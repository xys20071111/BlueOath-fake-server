import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'
import { socketPlayerMap } from '../utils/socketMaps.ts'
import { EMPTY_UINT8ARRAY } from '../utils/placeholder.ts'
import { sendShipInfo } from './hero.ts'

const pb = protobuf.loadSync('./raw-protobuf/illustrate.proto')
const TIllustrateBehaviourArgs = pb.lookupType(
    'illustrate.TIllustrateBehaviourArgs'
)
const TIllustrateList = pb.lookupType('illustrate.TIllustrateList')
const TVowHeroRet = pb.lookupType('illustrate.TVowHeroRet')
const TModiVowHeroListArg = pb.lookupType('illustrate.TModiVowHeroListArg')
const TIllustrateInfoRet = pb.lookupType('illustrate.TIllustrateInfoRet')

export function AddBehavior(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TIllustrateBehaviourArgs.decode(args).toJSON()
    for (const item of parsedArgs.BehaviourItem) {
        player.getIllustrate().setHeroIllustrate(
            item.IllustrateId,
            item.BehaviourId
        )
    }
    const illustrateResData = TIllustrateInfoRet.create(
        player.getIllustrate().getIllustrateInfo()
    )

    sendResponsePacket(
        socket,
        'illustrate.IllustrateInfo',
        TIllustrateInfoRet.encode(illustrateResData).finish(),
        callbackHandler,
        token
    )
}

export function IllustrateNew(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const player = socketPlayerMap.get(socket)!
    const illustrate = player.getIllustrate()
    const illustrateResData = TIllustrateList.create({
        IllustrateList: illustrate.getIllustrateInfo().IllustrateList
    })
    sendResponsePacket(
        socket,
        'illustrate.IllustrateNew',
        TIllustrateList.encode(illustrateResData).finish(),
        callbackHandler,
        token
    )
}

export function ModiVowHeroList(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs = TModiVowHeroListArg.decode(args).toJSON()
    const illustrate = socketPlayerMap.get(socket)!.getIllustrate()
    illustrate.setVowHeroList(parsedArgs.ChooseHeroList ?? [])
    sendResponsePacket(
        socket,
        'illustrate.ModiVowHeroList',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token
    )
}

export function VowHero(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs: {
        ChooseHeroList: Array<number>
    } = TModiVowHeroListArg.decode(args).toJSON() as any
    const player = socketPlayerMap.get(socket)!
    const illustrate = player.getIllustrate()
    const heroInfo = player.getHeroInfo()
    illustrate.setVowHeroList(parsedArgs.ChooseHeroList)
    const ship = parsedArgs
        .ChooseHeroList[
            Math.floor(Math.random() * parsedArgs.ChooseHeroList.length)
        ]
    const tid = ship * 10 + 1
    const ids = heroInfo.addShip([{
        Id: ship,
        TemplateId: tid
    }])
    const resData = TVowHeroRet.create({
        Type: 2,
        ConfigId: tid,
        Num: 1,
        Id: ids[0].Id
    })
    sendShipInfo(socket, callbackHandler, token)
    sendResponsePacket(
        socket,
        'illustrate.VowHero',
        TVowHeroRet.encode(resData).finish(),
        callbackHandler,
        token
    )
    sendIllustrateData(socket)
}

function sendIllustrateData(socket: Socket) {
    const player = socketPlayerMap.get(socket)!
    const illustrateResData = TIllustrateInfoRet.create(
        player.getIllustrate().getIllustrateInfo()
    )

    sendResponsePacket(
        socket,
        'illustrate.IllustrateInfo',
        TIllustrateInfoRet.encode(illustrateResData).finish(),
        0,
        ''
    )
}
