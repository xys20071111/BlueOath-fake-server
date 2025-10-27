import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { Player } from "../player.ts";

const playerPb = protobuf.loadSync("./raw-protobuf/player.proto")
const TArgLogin = playerPb.lookupType("player.TArgLogin")
const TRetLogin = playerPb.lookupType("player.TRetLogin")
const TUserInfo = playerPb.lookupType("player.TUserInfo")
const TRetGetUsers = playerPb.lookupType("player.TRetGetUsers")

export function Login(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs: any = TArgLogin.decode(args)
    const uname: string = parsedArgs.Pid
    console.log(`用户尝试登录：${uname}`)
    try {
        // 检查文件是否存在
        using _userData = Deno.openSync(`./data/${uname}/UserInfo.json`, {
            create: false,
            createNew: false,
            read: true,
            write: false
        })
        socketPlayerMap.set(socket, new Player(uname))
        const resData = TRetLogin.create({
            Ret: 'ok',
            ErrCode: '0'
        })
        const resPacket = createResponsePacket("player.Login", TRetLogin.encode(resData).finish(), callbackHandler, token, getSeq(socket))
        socket.write(resPacket)
    } catch {
        // 不存在就踢掉
        const resData = TRetLogin.create({
            Ret: 'error',
            ErrCode: '1'
        })
        const resPacket = createResponsePacket("player.Login", TRetLogin.encode(resData).finish(), callbackHandler, token, getSeq(socket))
        socket.write(resPacket)
    }

}

export function GetUserList(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    // user肯定会有，因为有前置检查
    const user = socketPlayerMap.get(socket)!
    const resData = TRetGetUsers.create({
        ArrUser: [
            TUserInfo.create(user.getUserInfo())
        ]
    })
    const resPacket = createResponsePacket("player.GetUserList", TRetGetUsers.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

