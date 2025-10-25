import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketUserMap } from "../utils/socketMaps.ts";

const playerPb = protobuf.loadSync("./raw-protobuf/player.proto")
const TRetLogin = playerPb.lookupType("player.TRetLogin")

const userPb = protobuf.loadSync("./raw-protobuf/user.proto")
const TGetUserInfoRet = userPb.lookupType("user.TGetUserInfoRet")

export function UserLogin(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TRetLogin.create({
        Ret: 'ok',
        ErrCode: '0'
    })
    const resPacket = createResponsePacket("user.UserLogin", TRetLogin.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

export function GetUserInfo(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const user = socketUserMap.get(socket)
    const userInfo = JSON.parse(Deno.readTextFileSync(`./data/${user}/UserInfo.json`))
    const userInfoData = TGetUserInfoRet.create(userInfo)
    const userDataPacket = createResponsePacket("user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token, getSeq(socket))
    const loginOKPacket = createResponsePacket("user.GetUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(userDataPacket)
    // 这个LoginOK也不知道有啥用，在lua里看了一圈没有一个会用到它发送的数据的，要想设置UserData全靠上面的UpdateUserInfo
    // 这里大概就是把单机版那里设置数据的部分写到这吧
    socket.write(loginOKPacket)
}