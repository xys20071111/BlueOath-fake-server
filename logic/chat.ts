import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/chat.proto")
const TGetBarrageDataRet = pb.lookupType("chat.TGetBarrageDataRet")
const TGetBarrageDataArg = pb.lookupType("chat.TGetBarrageDataArg")

export function GetBarrageById(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 似乎是获取剧情部分的弹幕用的
    const parsedArgs: any = TGetBarrageDataArg.decode(args)
    // 发个空的回去
    const resData = TGetBarrageDataRet.create({
        Id: parsedArgs.Id,
        BarrageList: []
    })
    const resPacket = createResponsePacket("chat.GetBarrageById", TGetBarrageDataRet.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}