import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/shop.proto")
const TRetShopsInfo = pb.lookupType("shop.TRetShopsInfo")

export function GetShopsInfo(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TRetShopsInfo.create({
        ShopInfo: [],
        GoodList: [],
        CondGoodList: []
    })
    socket.write(createResponsePacket("shop.GetShopsInfo", TRetShopsInfo.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}