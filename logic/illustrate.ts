import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/illustrate.proto")
const TIllustrateBehaviourArgs = pb.lookupType("illustrate.TIllustrateBehaviourArgs")
const TIllustrateInfoRet = pb.lookupType("illustrate.TIllustrateInfoRet")

export function AddBehavior(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TIllustrateBehaviourArgs.decode(args).toJSON()
    for (const item of parsedArgs.BehaviourItem) {
        player.setHeroIllustrate(item.IllustrateId, item.BehaviourId)
    }
    const illustrateResData = JSON.stringify(player.getIllustrateInfo())
    socket.write(createResponsePacket("illustrate.custom.IllustrateInfo", new TextEncoder().encode(illustrateResData), callbackHandler, token, getSeq(socket)))
}