import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '@/utils/createResponsePacket.ts'

const pb = protobuf.loadSync('./raw-protobuf/bathroom.proto')
const TBathroomInfo = pb.lookupType('bathroom.TBathroomInfo')

export function GetBathroomInfo(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const resData = TBathroomInfo.create({
        IsAllAuto: true,
        HeroList: []
    })
    sendResponsePacket(
        socket,
        'bathroom.GetBathroomInfo',
        TBathroomInfo.encode(resData).finish(),
        callbackHandler,
        token
    )
}
