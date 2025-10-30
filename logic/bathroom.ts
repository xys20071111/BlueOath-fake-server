import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/bathroom.proto")
const TBathroomInfo = pb.lookupType("bathroom.TBathroomInfo")

export function GetBathroomInfo(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TBathroomInfo.create({
        IsAllAuto: true,
        HeroList: []
    })
    socket.write(createResponsePacket("bathroom.GetBathroomInfo", TBathroomInfo.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}