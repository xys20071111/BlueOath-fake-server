export const discussDb = await Deno.openKv("./serverData/discuss.db")
export const chatDb = await Deno.openKv("./serverData/chat.db")
export const guildDb = await Deno.openKv("./serverData/guild.db")