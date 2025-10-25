import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/prefs.proto")
const TPrefsRet = pb.lookupType("TPrefsRet")

export function SavePrefs(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("prefs.SavePrefs", TPrefsRet.encode(TPrefsRet.create()).finish(), callbackHandler, token, getSeq(socket)))
}