import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
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
    socket.write(createResponsePacket("equip.Enhance", TEquipEnhanceRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
    sendEquipInfo(socket, callbackHandler, token)
}

export function RiseStar(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TEquipRiseStarArgs.decode(args).toJSON()
    const equipInfo = socketPlayerMap.get(socket)!.getEquipBag()
    equipInfo.riseStar(parsedArgs.EquipId)
    socket.write(createResponsePacket("equip.RiseStar", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
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
    socket.write(createResponsePacket("equip.UpdateEquipBagData", TEquipList.encode(equipData).finish(), callbackHandler, token, getSeq(socket)))
}