import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'

const pb = protobuf.loadSync('./raw-protobuf/copyinfo.proto')
const TCopyInfoRet = pb.lookupType('copyinfo.TCopyInfoRet')

// 现在此方法只会返回一个空的信息
export function GetCopyInfo(
    socket: Socket,
    _args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    sendResponsePacket(
        socket,
        'copyinfo.GetCopyInfo',
        TCopyInfoRet.encode(TCopyInfoRet.create()).finish(),
        callbackHandler,
        token
    )
}
