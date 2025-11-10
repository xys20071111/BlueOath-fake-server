import { Socket } from "node:net";
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

export function CacheData(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 两个信息格式一样，直接给它发回去
    sendResponsePacket(socket, "cachedata.CacheData", args, callbackHandler, token)
}