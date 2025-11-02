import { Socket } from "node:net"
import protobuf from 'protobufjs'
import { createResponsePacket } from "../utils/createResponsePacket.ts"
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts"

const pb = protobuf.loadSync("./raw-protobuf/buildship.proto")
const TBuildShipRet = pb.lookupType("buildship.TBuildShipRet")

const heroPb = protobuf.loadSync("./raw-protobuf/hero.proto")
const THeroInfo = heroPb.lookupType("hero.THeroInfo")

export function BuildShip(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 模拟抽卡，现在只是向舰娘信息中添加一艘奥克兰和一艘萤火虫，日后再去做个卡池
    const player = socketPlayerMap.get(socket)!

    const resData = TBuildShipRet.create({
        BuildShipResult: [
            {
                Type: 2,
                ConfigId: 10210511,
                Num: 1,
                Id: player.addShip(1021051, 10210511)
            },
            {
                Type: 2,
                ConfigId: 30130111,
                Num: 1,
                Id: player.addShip(3013011, 30130111)
            }
        ],
        SpReward: [],
        TransReward: [],
        IsChangeReward: false
    })
    // 舰娘信息
    const heroInfo = player.getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
    socket.write(createResponsePacket("buildship.BuildShip", TBuildShipRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}