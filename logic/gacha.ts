import { Socket } from "node:net"
import protobuf from 'protobufjs'
import { createResponsePacket } from "../utils/createResponsePacket.ts"
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts"
import { HERO_POOL, HERO_POOL_JP } from "../constants/cardPool.ts";
import { ClientType } from "../entity/player.ts";
import { EQUIP_POOL, EQUIP_POOL_JP } from "../constants/equipPool.ts";
import { sendEquipInfo } from "./equip.ts";
import { sendShipInfo } from "./hero.ts";

const pb = protobuf.loadSync("./raw-protobuf/buildship.proto")
const TBuildShipRet = pb.lookupType("buildship.TBuildShipRet")
const TBuildShipArg = pb.lookupType("buildship.TBuildShipArg")

const heroPb = protobuf.loadSync("./raw-protobuf/hero.proto")
const THeroInfo = heroPb.lookupType("hero.THeroInfo")

enum CardType {
    EQUIP,
    SHIP
}

function getCardsFromPool(num: number, cardType: CardType, clientType: ClientType) {
    const result = []
    if (cardType === CardType.SHIP) {
        if (clientType === ClientType.CN) {
            for (let i = 0; i <= num; i++) {
                result.push(HERO_POOL[Math.floor(Math.random() * HERO_POOL.length)])
            }
        } else {
            for (let i = 0; i <= num; i++) {
                result.push(HERO_POOL_JP[Math.floor(Math.random() * HERO_POOL_JP.length)])
            }
        }
    } else {
        if (clientType === ClientType.CN) {
            for (let i = 0; i <= num; i++) {
                result.push(EQUIP_POOL[Math.floor(Math.random() * EQUIP_POOL.length)])
            }
        } else {
            for (let i = 0; i <= num; i++) {
                result.push(EQUIP_POOL_JP[Math.floor(Math.random() * EQUIP_POOL_JP.length)])
            }
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
    if (parsedArgs.Id == 201) {
        const result = getCardsFromPool(parsedArgs.Num, CardType.EQUIP, player.getClientType()) as number[]
        const equipInfo = player.getEquipBag()
        const ids = equipInfo.addEquip(result)
        const buildShipResult = []
        for (const item of ids) {
            buildShipResult.push({
                Type: 3,
                ConfigId: item.tid,
                Num: 1,
                Id: item.id
            })
        }
        const resData = TBuildShipRet.create({
            BuildShipResult: buildShipResult,
            SpReward: [],
            TransReward: [],
            IsChangeReward: false
        })
        sendEquipInfo(socket, callbackHandler, token)
        socket.write(createResponsePacket("buildship.BuildShip", TBuildShipRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
        return
    }
    const result = getCardsFromPool(parsedArgs.Num, CardType.SHIP, player.getClientType()) as any
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
    sendShipInfo(socket, callbackHandler, token)
    socket.write(createResponsePacket("buildship.BuildShip", TBuildShipRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}