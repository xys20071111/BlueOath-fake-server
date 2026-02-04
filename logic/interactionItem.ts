import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '@/utils/createResponsePacket.ts'
import { INTERACTION_BAG_IDS_CN, INTERACTION_BAG_IDS_JP } from '@/constants/interactiveItem.ts'
import { socketPlayerMap } from '@/utils/socketMaps.ts'
import { EMPTY_UINT8ARRAY } from '@/utils/placeholder.ts'

const pb = protobuf.loadSync('./raw-protobuf/interactionitem.proto')
const TDecorateMutexBagGroupArg = pb.lookupType(
    'interactionitem.TDecorateMutexBagGroupArg'
)
const TInteractionItemArg = pb.lookupType('interactionitem.TInteractionItemArg')
const TPosterStateArg = pb.lookupType('interactionitem.TPosterStateArg')
const TInteractionItemRet = pb.lookupType('interactionitem.TInteractionItemRet')

export function SetMutexBagGroupState(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const { groupType, SelectId } = TDecorateMutexBagGroupArg.decode(args)
        .toJSON()
    const player = socketPlayerMap.get(socket)!
    player.getInteractionItem().setDecorateMutexBag(groupType, SelectId)
    sendResponsePacket(
        socket,
        'interactionitem.SetMutexBagGroupState',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token
    )
    sendInteractionItemInfo(socket)
}

export function SetBagItemVisible(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const { interactionItem, visibleState } = TInteractionItemArg.decode(args)
        .toJSON()
    const player = socketPlayerMap.get(socket)!
    player.getInteractionItem().setVisible(
        interactionItem,
        visibleState === 1 ? true : false
    )
    sendResponsePacket(
        socket,
        'interactionitem.SetBagItemVisible',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token
    )
    sendInteractionItemInfo(socket)
}

export function SetPosterState(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const { point, posterId } = TPosterStateArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    player.getInteractionItem().setPoster(point, posterId)
    sendResponsePacket(
        socket,
        'interactionitem.SetPosterState',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token
    )
    sendInteractionItemInfo(socket)
}

export function sendInteractionItemInfo(socket: Socket) {
    const player = socketPlayerMap.get(socket)!
    const interactionItem = player.getInteractionItem()
    const interactionBagItem = []
    for (
        const id of player.getClientType() === 0 ? INTERACTION_BAG_IDS_CN : INTERACTION_BAG_IDS_JP
    ) {
        interactionBagItem.push({
            id,
            num: 1,
            state: interactionItem.isVisible(id) ? 1 : 0
        })
    }
    const interactionItemData = TInteractionItemRet.create({
        interactionBagItem,
        ...interactionItem.getInteractionItemInfo()
    })
    sendResponsePacket(
        socket,
        'interactionitem.RefreshInteractionItems',
        TInteractionItemRet.encode(interactionItemData).finish(),
        null,
        null
    )
}
