import { Player } from '../player.ts'
import { Attribute } from './basicAttr.ts'

export class EquipAttr extends Attribute {
    constructor(
        equipIds: Array<number>,
        isNpc: boolean,
        copyId: number,
        player: Player,
    ) {
        super()
        const playerEquipBag = player.getEquipBag().getEquipInfo()
        for (const equipId of equipIds) {
            const equip = playerEquipBag[equipId]
            const prop = getEquipProperties(equipId, copyId, player)
        }
    }
}

function getEquipProperties(id: number, copyId: number, player: Player) {
    const playerEquipBag = player.getEquipBag().getEquipInfo()
    const equip = playerEquipBag[id]
}
