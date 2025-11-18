import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { socketPlayerMap } from "../utils/socketMaps.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";

const pb = protobuf.loadSync("./raw-protobuf/equip.proto")
const TEquipEnhanceArgs = pb.lookupType("equip.TEquipEnhanceArgs")
const TEquipEnhanceRet = pb.lookupType("equip.TEquipEnhanceRet")
const TEquipList = pb.lookupType("equip.TEquipList")
const TEquipRiseStarArgs = pb.lookupType("equip.TEquipRiseStarArgs")

export function Enhance(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TEquipEnhanceArgs.decode(args).toJSON()
    const equipInfo = socketPlayerMap.get(socket)!.getEquipBag()
    const lv = equipInfo.enhance(parsedArgs.EquipId)
    const resData = TEquipEnhanceRet.create({
        EquipId: parsedArgs.EquipId,
        EquipEnhanceLevel: lv,
        EquipEnhanceExp: 0
    })
    sendResponsePacket(socket, "equip.Enhance", TEquipEnhanceRet.encode(resData).finish(), callbackHandler, token)
    sendEquipInfo(socket, callbackHandler, token)
}

export function RiseStar(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TEquipRiseStarArgs.decode(args).toJSON()
    const equipInfo = socketPlayerMap.get(socket)!.getEquipBag()
    equipInfo.riseStar(parsedArgs.EquipId)
    sendResponsePacket(socket, "equip.RiseStar", EMPTY_UINT8ARRAY, callbackHandler, token)
    sendEquipInfo(socket, callbackHandler, token)
}

export function sendEquipInfo(socket: Socket, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    // 装备背包
    const equipData = TEquipList.create({
        EquipBagSize: 1000,
        EquipInfo: player.getEquipBag().getEquipInfo(),
        EquipNum: []
    })
    sendResponsePacket(socket, "equip.UpdateEquipBagData", TEquipList.encode(equipData).finish(), callbackHandler, token)
}