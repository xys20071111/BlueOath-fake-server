import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'
import { socketPlayerMap } from '../utils/socketMaps.ts'
import { EMPTY_UINT8ARRAY } from '../utils/placeholder.ts'
import { encoder } from '../utils/endecoder.ts'

const pb = protobuf.loadSync('./raw-protobuf/strategy.proto')
const TStrategyArg = pb.lookupType('strategy.TStrategyArg')

export function Apply(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = TStrategyArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const tactic = player.getTactic()
    tactic.setStrategy(parsedArgs.FleetId, parsedArgs.Id, parsedArgs.TacticType)
    sendResponsePacket(
        socket,
        'strategy.Apply',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    sendTacticInfo(socket, callbackHandler, token)
}

export function sendTacticInfo(
    socket: Socket,
    callbackHandler: number,
    token: string,
) {
    const player = socketPlayerMap.get(socket)!
    const tactics = player.getTactic().getTacticInfo()
    const tacticsData = JSON.stringify({
        MaxPower: 500,
        MinPower: 0,
        tactics,
    })
    sendResponsePacket(
        socket,
        'tactic.custom.ForceWriteFleetInfo',
        encoder.encode(tacticsData),
        callbackHandler,
        token,
    )
}
