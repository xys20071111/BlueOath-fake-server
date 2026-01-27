import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'
import { socketPlayerMap } from '../utils/socketMaps.ts'
import { EMPTY_UINT8ARRAY } from '../utils/placeholder.ts'
import { EXP_ITEM } from '../constants/exp.ts'

const pb = protobuf.loadSync('./raw-protobuf/hero.proto')
const TLockHeroArg = pb.lookupType('hero.TLockHeroArg')
const TLockHeroRet = pb.lookupType('hero.TLockHeroRet')
const TMarryArg = pb.lookupType('hero.TMarryArg')
const TChangeHeroNameArg = pb.lookupType('hero.TChangeHeroNameArg')
const THeroAddExp = pb.lookupType('hero.THeroAddExp')
const TRetireHeroArg = pb.lookupType('hero.TRetireHeroArg')
const TRetireHeroRet = pb.lookupType('hero.TRetireHeroRet')
const THeroSkill = pb.lookupType('hero.THeroSkill')
const THeroAdvMaxLvArg = pb.lookupType('hero.THeroAdvMaxLvArg')
const TAdvanceArg = pb.lookupType('hero.TAdvanceArg')
const THeroChangeEquipArgs = pb.lookupType('hero.THeroChangeEquipArgs')
const THeroAutoUnEquipArg = pb.lookupType('hero.THeroAutoUnEquipArg')
const TRemouldArg = pb.lookupType('hero.TRemouldArg')
const THeroInfo = pb.lookupType('hero.THeroInfo')
const TIntensifyHeroArgs = pb.lookupType('hero.TIntensifyHeroArgs')

// 提示信息显示一直不正常
export function LockHero(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs: {
        HeroId: number
        lock: boolean
    } = TLockHeroArg.decode(args) as any
    const player = socketPlayerMap.get(socket)!
    player.getHeroInfo().setHeroLock(
        parsedArgs.HeroId,
        parsedArgs.lock,
    )
    // 更新舰娘信息
    sendShipInfo(socket, callbackHandler, token)
    sendResponsePacket(
        socket,
        'hero.LockHero',
        TLockHeroRet.encode(TLockHeroRet.create({})).finish(),
        callbackHandler,
        token,
    )
}

export function GetHeroInfoByHeroIdArray(
    socket: Socket,
    _args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    sendResponsePacket(
        socket,
        'hero.GetHeroInfoByHeroIdArray',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
}

export function Marry(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TMarryArg.decode(args).toJSON()
    player.getHeroInfo().setHeroMarry(parsedArgs.HeroId, parsedArgs.MarryType)
    sendResponsePacket(
        socket,
        'hero.Marry',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    // 发一份新的舰娘信息
    sendShipInfo(socket, callbackHandler, token)
}

export function ChangeName(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TChangeHeroNameArg.decode(args).toJSON()
    player.getHeroInfo().setHeroName(parsedArgs.HeroId, parsedArgs.Name)
    sendResponsePacket(
        socket,
        'hero.ChangeName',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

// 有点显示问题，但无大碍
export function AddExp(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const hero = socketPlayerMap.get(socket)!.getHeroInfo()
    const parsedArgs = THeroAddExp.decode(args).toJSON()
    let totalExp = 0
    for (const item of parsedArgs.ItemList) {
        totalExp += EXP_ITEM[item.Id] * item.Num
    }
    const result = hero.addHeroLevel(parsedArgs.HeroId, totalExp)
    const resData = THeroAddExp.create({
        LevelPre: result.targetLevel,
        ExpPre: result.afterExp,
    })
    sendResponsePacket(
        socket,
        'hero.AddExp',
        THeroAddExp.encode(resData).finish(),
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

//现在该方法会引发游戏显示错误，需要重启游戏才能解决
export function RetireHero(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = TRetireHeroArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    heroInfo.deleteShips(parsedArgs.HeroIds)
    const resData = TRetireHeroRet.create({
        Reward: [],
    })
    sendResponsePacket(
        socket,
        'hero.RetireHero',
        TRetireHeroRet.encode(resData).finish(),
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

export function StudySkill(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = THeroSkill.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    heroInfo.addShipSkillLevel(parsedArgs.HeroId, parsedArgs.SkillId)
    sendResponsePacket(
        socket,
        'hero.StudySkill',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

export function HeroAdvMaxLv(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = THeroAdvMaxLvArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    heroInfo.setAdvLv(parsedArgs.HeroId)
    sendResponsePacket(
        socket,
        'hero.HeroAdvMaxLv',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

// 有显示错误，突破后需要重进页面才能继续突破，无大碍
export function HeroAdvance(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = TAdvanceArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    heroInfo.addAdvanceLv(parsedArgs.HeroId)
    sendResponsePacket(
        socket,
        'hero.HeroAdvance',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

export function ChangeEquip(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    try {
        const parsedArgs = THeroChangeEquipArgs.decode(args).toJSON() as any
        const player = socketPlayerMap.get(socket)!
        const heroInfo = player.getHeroInfo()
        const equipInfo = player.getEquipBag()
        const oldEquips = heroInfo.getEquipInfo(
            parsedArgs.Type,
            parsedArgs.HeroId,
        )!
        if (oldEquips && oldEquips[parsedArgs.Index - 1]) {
            equipInfo.setHero(0, oldEquips[parsedArgs.Index - 1].EquipsId)
        }
        heroInfo.setEquip(parsedArgs)
        equipInfo.setHero(parsedArgs.HeroId, parsedArgs.EquipId)
    } catch (e) {
        console.error(e)
    }
    sendShipInfo(socket, callbackHandler, token)
    sendResponsePacket(
        socket,
        'hero.ChangeEquip',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
}

export function AutoUnEquip(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = THeroAutoUnEquipArg.decode(args).toJSON() as any
    const player = socketPlayerMap.get(socket)!
    const heroInfoEntity = player.getHeroInfo()
    const equipInfo = player.getEquipBag()
    if (parsedArgs.Type === 1) {
        for (const hero of parsedArgs.HeroId) {
            heroInfoEntity.unEquipAll(hero)
            const equips = equipInfo.getEquipInfo()
            for (const equip of equips) {
                if (equip.HeroId === hero) {
                    equipInfo.setHero(0, equip.EquipId)
                }
            }
        }
    }
    sendResponsePacket(
        socket,
        'hero.AutoUnEquip',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
    sendShipInfo(socket, callbackHandler, token)
}

export function HeroRemould(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = TRemouldArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo()
    heroInfo.setHeroRemould(parsedArgs.HeroId, parsedArgs.EffectId)
    sendShipInfo(socket, callbackHandler, token)
    sendResponsePacket(
        socket,
        'hero.HeroRemould',
        EMPTY_UINT8ARRAY,
        callbackHandler,
        token,
    )
}

export function HeroIntensify(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TIntensifyHeroArgs.decode(args)
    const heroInfo = player.getHeroInfo()
}

export function sendShipInfo(
    socket: Socket,
    callbackHandler: number,
    token: string | null,
) {
    const player = socketPlayerMap.get(socket)!
    const heroInfo = player.getHeroInfo().getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }],
    })
    sendResponsePacket(
        socket,
        'hero.UpdateHeroBagData',
        THeroInfo.encode(heroInfoData).finish(),
        callbackHandler,
        token,
    )
}
