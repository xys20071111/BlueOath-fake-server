import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";
import { Player } from "../player.ts";

const pb = protobuf.loadSync("./raw-protobuf/hero.proto")
const TLockHeroArg = pb.lookupType("hero.TLockHeroArg")
const TLockHeroRet = pb.lookupType("hero.TLockHeroRet")
const THeroInfo = pb.lookupType("hero.THeroInfo")
const TMarryArg = pb.lookupType("hero.TMarryArg")
const TChangeHeroNameArg = pb.lookupType("hero.TChangeHeroNameArg")

export function LockHero(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs: {
        HeroId: number
        lock: boolean
    } = TLockHeroArg.decode(args) as any
    const player = socketPlayerMap.get(socket)!
    player.setHeroLock(parsedArgs.HeroId, parsedArgs.lock)
    socket.write(createResponsePacket("hero.LockHero", TLockHeroRet.encode(TLockHeroRet.create({
        Ret: parsedArgs.lock ? 0 : 1
    })).finish(), callbackHandler, token, getSeq(socket)))
    // 更新舰娘信息
    sendShipInfo(socket, player, callbackHandler, token)
}

export function GetHeroInfoByHeroIdArray(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("hero.GetHeroInfoByHeroIdArray", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

export function Marry(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TMarryArg.decode(args).toJSON()
    player.setHeroMarry(parsedArgs.HeroId, parsedArgs.MarryType)
    socket.write(createResponsePacket("hero.Marry", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    // 发一份新的舰娘信息
    sendShipInfo(socket, player, callbackHandler, token)
}

export function ChangeName(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TChangeHeroNameArg.decode(args).toJSON()
    player.setHeroName(parsedArgs.HeroId, parsedArgs.Name)
    socket.write(createResponsePacket("hero.ChangeName", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    sendShipInfo(socket, player, callbackHandler, token)
}

function sendShipInfo(socket: Socket, player: Player, callbackHandler: number, token: string | null) {
    // 发一份新的舰娘信息
    const heroInfo = player.getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
}