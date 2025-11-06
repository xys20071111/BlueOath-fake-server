import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { Player } from "../entity/player.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";
import { sendShipInfo } from "./hero.ts";

const pb = protobuf.loadSync("./raw-protobuf/fashion.proto")
const TFashionEquipArg = pb.lookupType("fashion.TFashionEquipArg")

export function Equip(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    const parsedArgs = TFashionEquipArg.decode(args).toJSON()
    heroInfo.setFashion(parsedArgs.HeroId, parsedArgs.FashionTid)
    socket.write(createResponsePacket("fashion.Equip", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    sendShipInfo(socket, callbackHandler, token)
}
