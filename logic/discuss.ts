import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '@/utils/createResponsePacket.ts'
import { socketPlayerMap } from '@/utils/socketMaps.ts'
import { EMPTY_UINT8ARRAY } from '@/utils/placeholder.ts'
import { discussDb } from '@/server/db.ts'

const pb = protobuf.loadSync('./raw-protobuf/discuss.proto')
const TGetDiscussRet = pb.lookupType('discuss.TGetDiscussRet')
const TGetDiscussArg = pb.lookupType('discuss.TGetDiscussArg')
const TDiscussArg = pb.lookupType('discuss.TDiscussArg')

interface MsgInfo {
    Name: string
    Msg: string
    LikeNum: number
    MsgID: number
    IsLiked: number
    IsDisLiked: number
    Level: number
    LikeTime: number
}

interface DiscussInfo {
    DisLikeNum: number
    DisLikeTime: number
    MsgTime: number
    HeroLikeNum: number
    MsgInfo: MsgInfo[]
    nextMsgId: number
}

export async function GetDiscuss(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs = TGetDiscussArg.decode(args).toJSON()
    const id = parsedArgs.Htid
    let discuss: DiscussInfo | null = (await discussDb.get<DiscussInfo>(['discuss', id])).value
    if (!discuss) {
        discuss = {
            DisLikeNum: 0,
            DisLikeTime: 0,
            MsgTime: 0,
            HeroLikeNum: 0,
            MsgInfo: [],
            nextMsgId: 0
        }
    }
    await discussDb.set(['discuss', id], discuss)
    const resData = TGetDiscussRet.create(discuss)
    sendResponsePacket(
        socket,
        'discuss.GetDiscuss',
        TGetDiscussRet.encode(resData).finish(),
        callbackHandler,
        token
    )
}

export async function Discuss(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TDiscussArg.decode(args).toJSON()
    const id = parsedArgs.Htid
    const discuss: DiscussInfo = (await discussDb.get<DiscussInfo>(['discuss', id])).value!
    discuss.MsgInfo.push({
        Name: player.getUname(),
        Msg: parsedArgs.Msg,
        LikeNum: 0,
        MsgID: discuss.nextMsgId++,
        LikeTime: 0,
        IsLiked: 0,
        IsDisLiked: 0,
        Level: 1
    })
    await discussDb.set(['discuss', id], discuss)
    const resData = TGetDiscussRet.create(discuss)
    sendResponsePacket(
        socket,
        'discuss.GetDiscuss',
        TGetDiscussRet.encode(resData).finish(),
        callbackHandler,
        token
    )
}

export function Like(
    socket: Socket,
    _args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    sendResponsePacket(
        socket,
        'discuss.Like',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token
    )
}
