import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketSeqMap.ts";

const playerPb = protobuf.loadSync("./raw-protobuf/player.proto")
const TArgLogin = playerPb.lookupType("player.TArgLogin")
const TRetLogin = playerPb.lookupType("player.TRetLogin")
const TUserInfo = playerPb.lookupType("player.TUserInfo")
const TRetGetUsers = playerPb.lookupType("player.TRetGetUsers")

export function playerLogin(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs: any = TArgLogin.decode(args)
    console.log(`用户尝试登录：${parsedArgs.Pid}`)
    const resData = TRetLogin.create({
        Ret: 'ok',
        ErrCode: '0'
    })
    const resPacket = createResponsePacket("player.Login", TRetLogin.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

export function playerGetUserList(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TRetGetUsers.create({
        ArrUser: [
            TUserInfo.create({
                Uid: 10001,
                Uname: "Test123",
                Level: 100,
                Class: 1
            })
        ]
    })
    const resPacket = createResponsePacket("player.GetUserList", TRetGetUsers.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

