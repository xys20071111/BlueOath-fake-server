import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/buildnotes.proto")
const TNotesListRet = pb.lookupType("buildnotes.TNotesListRet")

export function GetNotesList(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    sendResponsePacket(socket, "buildnotes.GetNotesList", TNotesListRet.encode(TNotesListRet.create({List: []})).finish(), callbackHandler, token)
}