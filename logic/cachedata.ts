import { Socket } from "node:net";
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

export function CacheData(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 两个信息格式一样，直接给它发回去
    socket.write(createResponsePacket("cachedata.CacheData", args, callbackHandler, token, getSeq(socket)))
}