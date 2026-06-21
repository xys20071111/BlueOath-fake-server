import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '@/utils/createResponsePacket.ts'
import { socketPlayerMap } from '@/utils/socketMaps.ts'
import { Player } from '@/entity/player.ts'
import { userInfoMainDb } from '@/server/db.ts'

const playerPb = protobuf.loadSync('./raw-protobuf/player.proto')
const TArgLogin = playerPb.lookupType('player.TArgLogin')
const TRetLogin = playerPb.lookupType('player.TRetLogin')
const TUserInfo = playerPb.lookupType('player.TUserInfo')
const TRetGetUsers = playerPb.lookupType('player.TRetGetUsers')

export function Login(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs = TArgLogin.decode(args).toJSON()
    const uname: string = parsedArgs.Pid
    console.log(`用户尝试登录：${uname}`)
    try {
        // 检查用户是否存在
        const result = userInfoMainDb.query<[number, string, number]>(
            'SELECT * FROM user_info WHERE uname=?',
            [uname]
        )
        if (result.length === 0) {
            // 不存在就踢掉
            const resData = TRetLogin.create({
                Ret: '用户不存在',
                ErrCode: '1'
            })
            sendResponsePacket(
                socket,
                'player.Login',
                TRetLogin.encode(resData).finish(),
                callbackHandler,
                token
            )
            return
        }
        const info = result[0]
        socketPlayerMap.set(
            socket,
            new Player({
                id: info[0],
                uname: info[1],
                secretaryId: info[2]
            }, parsedArgs.ClientVersion === '1.5.120' ? 0 : 1)
        )
        const resData = TRetLogin.create({
            Ret: 'ok',
            ErrCode: '0'
        })
        sendResponsePacket(
            socket,
            'player.Login',
            TRetLogin.encode(resData).finish(),
            callbackHandler,
            token
        )
    } catch (e) {
        console.log(`玩家 ${uname} 资料损坏，请根据下方错误信息进行判断`)
        console.log(e)
        // 不存在就踢掉
        const resData = TRetLogin.create({
            Ret: 'error',
            ErrCode: '1'
        })
        sendResponsePacket(
            socket,
            'player.Login',
            TRetLogin.encode(resData).finish(),
            callbackHandler,
            token
        )
    }
}

export function GetUserList(
    socket: Socket,
    _args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    // user肯定会有，因为有前置检查
    const user = socketPlayerMap.get(socket)!
    const resData = TRetGetUsers.create({
        ArrUser: [
            TUserInfo.create(user.getUserInfo())
        ]
    })
    sendResponsePacket(
        socket,
        'player.GetUserList',
        TRetGetUsers.encode(resData).finish(),
        callbackHandler,
        token
    )
}
