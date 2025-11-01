import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { chatDb } from "../db.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";
import { Player } from "../player.ts";

export interface Message {
    sender: string
    message: string
    type: number
}

const pb = protobuf.loadSync("./raw-protobuf/chat.proto")
const TGetBarrageDataRet = pb.lookupType("chat.TGetBarrageDataRet")
const TGetBarrageDataArg = pb.lookupType("chat.TGetBarrageDataArg")
const TChatSendMessageArg = pb.lookupType("chat.TChatSendMessageArg")
const TChatSendMessageRet = pb.lookupType("chat.TChatSendMessageRet")
const TChatInfoRet = pb.lookupType("chat.TChatInfoRet")

export function GetBarrageById(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 似乎是获取剧情部分的弹幕用的
    const parsedArgs = TGetBarrageDataArg.decode(args).toJSON()
    // 发个空的回去
    const resData = TGetBarrageDataRet.create({
        Id: parsedArgs.Id,
        BarrageList: []
    })
    const resPacket = createResponsePacket("chat.GetBarrageById", TGetBarrageDataRet.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

// 现在该函数只能将信息添加到数据库里，还不能发给别的用户
export async function SendMessage(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TChatSendMessageArg.decode(args).toJSON()
    const msg: Message = {
        sender: player.getUname(),
        message: parsedArgs.Message,
        type: parsedArgs.MsgType,
    }
    await chatDb.set([`WorldChat`, Date.now()], msg)
    const resData = TChatSendMessageRet.create({
        Message: parsedArgs.Message
    })
    const resPacket = createResponsePacket("chat.SendMessage", TChatSendMessageRet.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

export function ChangeWorldChannel(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("chat.ChangeWorldChannel", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

export function generageChatMsg(sender: string, message: string, type: number) {
    const senderPlayer = new Player(sender, 0)
    const senderInfo = senderPlayer.getUserInfo()
    const heroBag = senderPlayer.getHeroBag()
    return {
        UserInfo: {
            Uid: senderInfo.Uid,
            ServerId: senderInfo.ServerId,
            Uname: senderInfo.Uname,
            Level: senderInfo.Level,
            Head: 1,
            HeadFrame: 0,
            HeadShow: 1,
            Fashioning: heroBag[senderInfo.SecretaryId].Fashioning,
            Pid: senderInfo.Uid
        },
        Channel: 1,
        TemplateId: 0,
        SendTime: Math.round(Date.now() / 1000),
        Message: message,
        MsgType: type,
        Params: []
    }
}