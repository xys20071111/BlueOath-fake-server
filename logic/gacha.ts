import { Socket } from "node:net"
import protobuf from 'protobufjs'
import { createResponsePacket } from "../utils/createResponsePacket.ts"
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts"
import { HERO_POOL, HERO_POOL_JP } from "../constant.ts";
import { ClientType } from "../entity/player.ts";

const pb = protobuf.loadSync("./raw-protobuf/buildship.proto")
const TBuildShipRet = pb.lookupType("buildship.TBuildShipRet")
const TBuildShipArg = pb.lookupType("buildship.TBuildShipArg")

const heroPb = protobuf.loadSync("./raw-protobuf/hero.proto")
const THeroInfo = heroPb.lookupType("hero.THeroInfo")

function getCardsFromPool(num: number, type: ClientType) {
    const result = []
    if (type === ClientType.CN) {
        for (let i = 0; i <= num; i++) {
            result.push(HERO_POOL[Math.floor(Math.random() * HERO_POOL.length)])
        }
    } else {
        for (let i = 0; i <= num; i++) {
            result.push(HERO_POOL_JP[Math.floor(Math.random() * HERO_POOL_JP.length)])
        }
    }
    return result
}

export function BuildShip(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs: {
        Id: number
        Num: number
        CacheId: string
    } = TBuildShipArg.decode(args).toJSON() as any
    const result = getCardsFromPool(parsedArgs.Num, player.getClientType())
    const heroInfo = player.getHeroInfo()
    const ids = heroInfo.addShip(result)
    const buildShipResult = []
    for (const item of ids) {
        buildShipResult.push({
            Type: 2,
            ConfigId: item.TemplateId,
            Num: 1,
            Id: item.Id
        })
    }
    const resData = TBuildShipRet.create({
        BuildShipResult: buildShipResult,
        SpReward: [],
        TransReward: [],
        IsChangeReward: false
    })
    // 舰娘信息
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo.getHeroBag(),
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
    socket.write(createResponsePacket("buildship.BuildShip", TBuildShipRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}