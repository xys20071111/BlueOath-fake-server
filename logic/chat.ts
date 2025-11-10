import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { chatDb } from "../db.ts";
import { Player } from "../entity/player.ts";

export interface WorldChatMessage {
    sender: string
    message: string
    type: number
    channel: number
}

const pb = protobuf.loadSync("./raw-protobuf/chat.proto")
const TGetBarrageDataRet = pb.lookupType("chat.TGetBarrageDataRet")
const TGetBarrageDataArg = pb.lookupType("chat.TGetBarrageDataArg")
const TChatSendMessageArg = pb.lookupType("chat.TChatSendMessageArg")
const TChatSendMessageRet = pb.lookupType("chat.TChatSendMessageRet")
const TChatMsg = pb.lookupType("chat.TChatMsg")

export function GetBarrageById(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 似乎是获取剧情部分的弹幕用的
    const parsedArgs = TGetBarrageDataArg.decode(args).toJSON()
    // 发个空的回去
    const resData = TGetBarrageDataRet.create({
        Id: parsedArgs.Id,
        BarrageList: []
    })
   sendResponsePacket(socket, "chat.GetBarrageById", TGetBarrageDataRet.encode(resData).finish(), callbackHandler, token)
}

// 现在该函数只能将信息添加到数据库里，还不能发给别的用户
export async function SendMessage(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    // 获取发送者信息
    const player = socketPlayerMap.get(socket)!
    const senderInfo = player.getUserInfo()
    const secretary = player.getHeroInfo().getHeroById(senderInfo.SecretaryId)
    // 处理一下存到数据库里
    const parsedArgs = TChatSendMessageArg.decode(args).toJSON()
    const msg: WorldChatMessage = {
        sender: player.getUname(),
        message: parsedArgs.Message,
        type: parsedArgs.MsgType,
        channel: parsedArgs.Channel,
    }
    await chatDb.set([`WorldChat`, Date.now()], msg)
    const resData = TChatSendMessageRet.create({
        Message: parsedArgs.Message
    })
    sendResponsePacket(socket, "chat.SendMessage", TChatSendMessageRet.encode(resData).finish(), callbackHandler, token)
    socketPlayerMap.keys().forEach((target) => {
        if (target !== socket) {
            const targetPlayer = socketPlayerMap.get(target)!
            const clientType = targetPlayer.getClientType()
            // 发送新消息
            const chatData = TChatMsg.create({
                UserInfo: {
                    Uid: senderInfo.Uid,
                    ServerId: senderInfo.ServerId,
                    Uname: senderInfo.Uname,
                    Level: senderInfo.Level,
                    Head: clientType === 0 ? secretary.TemplateId : secretary.Fashioning,
                    HeadFrame: 0,
                    HeadShow: senderInfo.HeadShow,
                    Fashioning: secretary.Fashioning,
                    GuildId: 0,
                    GuildName: "",
                    TeacherPrestige: 0,
                    SecretaryTid: secretary.TemplateId,
                    Pid: senderInfo.Uid
                },
                Channel: parsedArgs.Channel,
                TemplateId: 0,
                SendTime: Math.round(Date.now() / 1000),
                Message: parsedArgs.Message,
                MsgType: parsedArgs.MsgType,
                Params: []
            })
            sendResponsePacket(target, "chat.NewMessage", TChatMsg.encode(chatData).finish(), null, null)
        }

    })
}

export function ChangeWorldChannel(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    sendResponsePacket(socket, "chat.ChangeWorldChannel", args, callbackHandler, token)
}

export function generateChatMsg(sender: string, message: string, type: number) {
    const senderPlayer = new Player(sender, 0)
    const senderInfo = senderPlayer.getUserInfo()
    const secretary = senderPlayer.getHeroInfo().getHeroById(senderInfo.SecretaryId)
    return {
        UserInfo: {
            Uid: senderInfo.Uid,
            ServerId: senderInfo.ServerId,
            Uname: senderInfo.Uname,
            Level: senderInfo.Level,
            Head: secretary.TemplateId,
            HeadFrame: 0,
            HeadShow: senderInfo.HeadShow,
            Fashioning: secretary.Fashioning,
            GuildId: 0,
            GuildName: "",
            TeacherPrestige: 0,
            SecretaryTid: secretary.TemplateId,
            Pid: senderInfo.Uid
        },
        Channel: 901,
        TemplateId: 1,
        SendTime: Math.round(Date.now() / 1000),
        Message: message,
        MsgType: type,
        Params: []
    }
}