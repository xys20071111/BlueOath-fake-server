import { Socket } from "node:net";
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";

export function UpdateHeroAddition(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("building.UpdateHeroAddition", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}