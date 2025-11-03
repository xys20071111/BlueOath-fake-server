import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";
import { Player } from "../entity/player.ts";

const pb = protobuf.loadSync("./raw-protobuf/hero.proto")
const TLockHeroArg = pb.lookupType("hero.TLockHeroArg")
const TLockHeroRet = pb.lookupType("hero.TLockHeroRet")
const THeroInfo = pb.lookupType("hero.THeroInfo")
const TMarryArg = pb.lookupType("hero.TMarryArg")
const TChangeHeroNameArg = pb.lookupType("hero.TChangeHeroNameArg")
const THeroAddExp = pb.lookupType("hero.THeroAddExp")
const TRetireHeroArg = pb.lookupType("hero.TRetireHeroArg")
const TRetireHeroRet = pb.lookupType("hero.TRetireHeroRet")

export function LockHero(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs: {
        HeroId: number
        lock: boolean
    } = TLockHeroArg.decode(args) as any
    const player = socketPlayerMap.get(socket)!
    player.getHeroInfo().setHeroLock(parsedArgs.HeroId, parsedArgs.lock)
    socket.write(createResponsePacket("hero.LockHero", TLockHeroRet.encode(TLockHeroRet.create({
        Ret: parsedArgs.lock ? 1 : 0
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
    player.getHeroInfo().setHeroMarry(parsedArgs.HeroId, parsedArgs.MarryType)
    socket.write(createResponsePacket("hero.Marry", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    // 发一份新的舰娘信息
    sendShipInfo(socket, player, callbackHandler, token)
}

export function ChangeName(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TChangeHeroNameArg.decode(args).toJSON()
    player.getHeroInfo().setHeroName(parsedArgs.HeroId, parsedArgs.Name)
    socket.write(createResponsePacket("hero.ChangeName", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    sendShipInfo(socket, player, callbackHandler, token)
}

export function AddExp(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = THeroAddExp.decode(args).toJSON()
    // 偷个懒，一瓶省一级好了，反正物品数量是写死的
    console.log(parsedArgs)
    
}

//现在该方法会引发游戏显示错误，需要重启游戏才能解决
export function RetireHero(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TRetireHeroArg.decode(args).toJSON()
    console.log(parsedArgs)
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    heroInfo.deleteShips(parsedArgs.HeroIds)
    const resData = TRetireHeroRet.create({
        Reward: []
    })
    socket.write(createResponsePacket("hero.RetireHero", TRetireHeroRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
    sendShipInfo(socket, player, callbackHandler, token)
}

function sendShipInfo(socket: Socket, player: Player, callbackHandler: number, token: string | null) {
    // 发一份新的舰娘信息
    const heroInfo = player.getHeroInfo().getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
}