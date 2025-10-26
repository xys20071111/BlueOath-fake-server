import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/hero.proto")
const TLockHeroArg = pb.lookupType("hero.TLockHeroArg")
const TLockHeroRet = pb.lookupType("hero.TLockHeroRet")
const THeroInfo = pb.lookupType("hero.THeroInfo")

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
    const heroInfo = player.getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
}