import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/tactic.proto")
const TSelfTactis = pb.lookupType("tactic.TSelfTactis")

export function SetHerosTactic(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TSelfTactis.decode(args)
    const player = socketPlayerMap.get(socket)!
    player.setTactics(parsedArgs.toJSON().tactics)
    socket.write(createResponsePacket("tactic.SetHerosTactic", args, callbackHandler, token, getSeq(socket)))
}