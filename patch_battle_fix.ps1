$dllPath = "C:\Users\xys20\blueoath\clsy\GameAssembly.dll"
$bakPath = "$dllPath.bak"

# Backup
if (-not (Test-Path -LiteralPath $bakPath)) {
    Copy-Item -LiteralPath $dllPath $bakPath
    Write-Output "Backup saved: $bakPath"
} else {
    Write-Output "Backup already exists, skipping..."
}

# Read DLL
$bytes = [System.IO.File]::ReadAllBytes($dllPath)

# Patch 1: 0x4D4A35 - JZ target from END to skip extra processing
# Original: 0F 84 8F 01 00 00  (jz 0x664157CA -> throw)
# New:      0F 84 4F 00 00 00  (jz 0x6641568A -> skip to source2targetRelation)
$bytes[0x4D4A35] = 0x0F; $bytes[0x4D4A36] = 0x84
$bytes[0x4D4A37] = 0x4F; $bytes[0x4D4A38] = 0x00
$bytes[0x4D4A39] = 0x00; $bytes[0x4D4A3A] = 0x00
Write-Output "Patch 1 applied: JZ redirect at 0x4D4A35"

# Patch 2: 0x4D4BCA - replace throw with safe return
# Original: 6A 00 E8 EF 2D 16 01 CC (push 0; call throw; int3)
# New:      5F 5E 5D C3 90 90 90 90 (pop edi; pop esi; pop ebp; ret)
$patch2 = [byte[]]@(0x5F, 0x5E, 0x5D, 0xC3, 0x90, 0x90, 0x90, 0x90)
for ($i = 0; $i -lt 8; $i++) {
    $bytes[0x4D4BCA + $i] = $patch2[$i]
}
Write-Output "Patch 2 applied: throw -> safe return at 0x4D4BCA"

# Write back
[System.IO.File]::WriteAllBytes($dllPath, $bytes)
Write-Output "Done! GameAssembly.dll patched successfully."
