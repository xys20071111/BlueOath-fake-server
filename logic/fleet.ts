import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'
import { socketPlayerMap } from '../utils/socketMaps.ts'

const pb = protobuf.loadSync('./raw-protobuf/tactic.proto')
const TSelfTactis = pb.lookupType('tactic.TSelfTactis')

export function SetHerosTactic(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs = TSelfTactis.decode(args)
    const player = socketPlayerMap.get(socket)!
    player.getTactic().setTacticInfo(parsedArgs.toJSON().tactics)
    sendResponsePacket(
        socket,
        'tactic.SetHerosTactic',
        args,
        callbackHandler,
        token
    )
}
