import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

interface BaseGuildInfo {
    GuildId: number
    Name: string
    Emblem: number
    Enounce: number
    Level: number
    MemberNum: number
    Limit: {
        mode: number
        Level: number
        Power: number
    }
    LeaderId: number
    LeaderName: string
    Frame: number
    Power: number
    Honor: number
}

const guildDb = await Deno.openKv("./serverData/guild.db")

const pb = protobuf.loadSync("./raw-protobuf/guild.proto")
const TArgGetGuildList = pb.lookupType("guild.TArgGetGuildList")
const TRetGetGuildList = pb.lookupType("guild.TRetGetGuildList")
const TArgCreateGuild = pb.lookupType("guild.TArgCreateGuild")

export async function GetList(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TArgGetGuildList.decode(args).toJSON()
    const guildIter = await guildDb.list({
        prefix: ['BaseGuildInfo'],
        end: ['BaseGuildInfo', parsedArgs.Num]
    })
    const guildList = []
    for await (const item of guildIter) {
        guildList.push(item)
    }
    const resData = TRetGetGuildList.create({
        TotalNum: guildList.length,
        GuildList: guildList
    })

    socket.write(createResponsePacket("guild.GetList", TRetGetGuildList.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}

export async function CreateGuild(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TArgCreateGuild.decode(args).toJSON()
    console.log(parsedArgs)
}