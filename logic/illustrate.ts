import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/illustrate.proto")
const TIllustrateBehaviourArgs = pb.lookupType("illustrate.TIllustrateBehaviourArgs")
const TIllustrateNewArgs = pb.lookupType("illustrate.TIllustrateNewArgs")
const TIllustrateList = pb.lookupType("illustrate.TIllustrateList")

export function AddBehavior(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TIllustrateBehaviourArgs.decode(args).toJSON()
    for (const item of parsedArgs.BehaviourItem) {
        player.getIllustrate().setHeroIllustrate(item.IllustrateId, item.BehaviourId)
    }
    const illustrateResData = JSON.stringify(player.getIllustrate().getIllustrateInfo())
    sendResponsePacket(socket, "illustrate.custom.IllustrateInfo", new TextEncoder().encode(illustrateResData), callbackHandler, token)
}

export function IllustrateNew(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const illustrate = player.getIllustrate()
    const illustrateResData = TIllustrateList.create({
        IllustrateList: illustrate.getIllustrateInfo().IllustrateList
    })
    sendResponsePacket(socket, "illustrate.IllustrateNew", TIllustrateList.encode(illustrateResData).finish(), callbackHandler, token)
}