import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync('./raw-protobuf/discuss.proto')
const TGetDiscussRet = pb.lookupType("discuss.TGetDiscussRet")
const TGetDiscussArg = pb.lookupType("discuss.TGetDiscussArg")

export function GetDiscuss(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 现在这行还用不到
    const parsedArgs = TGetDiscussArg.decode(args)
    const resData = TGetDiscussRet.create({
        DisLikeNum: 0,
        DisLikeTime: 0,
        MsgTime: 0,
        HeroLikeNum: 999,
        MsgInfo: [
            {
                Name: "示例信息",
                Msg: "这是一条示例信息",
                LikeNum: 0,
                MsgID: 1,
                LikeTime: 0,
                IsLiked: 0,
                IsDisLikde: 0,
                Level: 1
            }
        ]
    })
    socket.write(createResponsePacket("discuss.GetDiscuss", TGetDiscussRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}