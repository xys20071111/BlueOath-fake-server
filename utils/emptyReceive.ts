import { Socket } from "node:net";
import { EMPTY_UINT8ARRAY } from "./placeholder.ts";
import { sendResponsePacket } from "./createResponsePacket.ts";

export function EmptyReply(method: string) {
    return function(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
        sendResponsePacket(socket, method, EMPTY_UINT8ARRAY, callbackHandler, token)
    }
}