import { DB as SqliteDB } from 'sqlite'

export const userInfoMainDb = new SqliteDB("./serverData/userInfo.db")
export const discussDb = await Deno.openKv('./serverData/discuss.db')
export const chatDb = await Deno.openKv('./serverData/chat.db')
export const guildDb = await Deno.openKv('./serverData/guild.db')
export const miniGameScoreDb = await Deno.openKv('./serverData/minigame.db')
