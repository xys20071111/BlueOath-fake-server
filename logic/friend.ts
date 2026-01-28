import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'

const pb = protobuf.loadSync('./raw-protobuf/friend.proto')
const TFriendMainInfoRet = pb.lookupType('friend.TFriendMainInfoRet')
const TCommonFriendGetListRet = pb.lookupType('friend.TCommonFriendGetListRet')

// 此处现在只会返回一个全空的数据
export function GetFriendMainData(
    socket: Socket,
    _args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const resData = TFriendMainInfoRet.create()
    sendResponsePacket(
        socket,
        'friend.GetFriendMainData',
        TFriendMainInfoRet.encode(resData).finish(),
        callbackHandler,
        token
    )
}

export function GetRecommendList(
    socket: Socket,
    _args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const resData = TCommonFriendGetListRet.create()
    sendResponsePacket(
        socket,
        'friend.GetRecommendList',
        TFriendMainInfoRet.encode(resData).finish(),
        callbackHandler,
        token
    )
}
