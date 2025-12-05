import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'
import { socketPlayerMap } from '../utils/socketMaps.ts'

const copyPb = protobuf.loadSync('./raw-protobuf/copy.proto')
const TStartBaseArg = copyPb.lookupType('copy.TStartBaseArg')
const TStartBaseRet = copyPb.lookupType('copy.TStartBaseRet')

interface BattleShip {
    HeroId: number
    TemplateId: number
    Level: number
    Index: number
    Attr: {
        AttrId: number
        AttrValue: number
    }[]
    CurHp: number
    Equips: {
        EquipTid: number
        EquipIndex: number
        PlaneNum: number
        AttrValue: any[]
        PSkillEquipList: any[]
        PetId: number
    }[]
    PSkill: {
        PSkillId: number
        PSkillLv: number
    }[]
    BathBuff: number[]
    AdvEffectIdList: number[]
    EquipGridNum: number
    Fashioning: number
    HurtPer: number
}

// 注意：此方法现在返回的参数基本都是瞎填的，点击出征会导致游戏卡死
export function StartBase(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs = TStartBaseArg.decode(args).toJSON()
    console.log(parsedArgs)
    const player = socketPlayerMap.get(socket)!
    const userInfo = player.getUserInfo()
    const playerHeroBag = player.getHeroInfo()
    const Ships: Array<BattleShip> = []
    let counter = 1
    try {
        for (const item of parsedArgs.HeroList[0].HeroIdList) {
            const ship = playerHeroBag.getHeroById(item)
            Ships.push({
                HeroId: ship.HeroId,
                TemplateId: ship.TemplateId,
                Level: ship.Lvl,
                Index: counter++,
                Attr: [],
                CurHp: ship.CurHp,
                Equips: [],
                PSkill: [],
                BathBuff: [],
                AdvEffectIdList: ship.ArrRemouldEffect,
                EquipGridNum: 6,
                Fashioning: ship.Fashioning,
                HurtPer: 0,
            })
        }
    } catch (e) {
        console.error(e)
    }
    const ShipEquipGridInfo: Array<{
        HeroId: number
        EquipGridNum: number
    }> = []
    for (const HeroId of parsedArgs.HeroList[0].HeroIdList) {
        ShipEquipGridInfo.push({
            HeroId,
            EquipGridNum: 6,
        })
    }
    const resData = TStartBaseRet.create({
        BattlePlayer: {
            Pid: userInfo.Uid,
            Uid: userInfo.Uid,
            Uname: userInfo.Uname,
            Level: userInfo.Level,
            PlayerCamp: 0,
            Index: 0,
            FleetInfo: {
                FleetId: 1,
                FormationId: 1,
                Index: parsedArgs.HeroList[0].Index,
                Ships,
                StrategyId: parsedArgs.HeroList[0].StrategyId,
                ConditionList: [],
                KillTimes: 0,
                HeroList: parsedArgs.HeroList[0].HeroIdList,
                TacticType: 1,
            },
        },
        RandomSeed: 114514,
        Rid: 1,
        arrRes: [],
        EnemyFleet: [1],
        CopyId: parsedArgs.CopyId,
        CopyType: 1,
        CopyPass: true,
        BossProgress: 100,
        IsRunningFight: true,
        ShipEquipGridInfo,
        RandomFactors: [
            {
                Factors: [1, 2, 3],
                GroupId: 1,
                SetId: 1,
            },
        ],
        SafeLv: 1,
        Verify: {
            opes: {
                frameCount: 0,
                opes: [],
            },
            result: {},
        },
        ExtraBattlePlayerList: [],
        Token: token,
        SkipVcr: [],
        BattleMode: parsedArgs.BattleMode,
        IsFinal: true,
        CopyMission: [],
        EnemyFleets: [],
        ConfigData: [],
        MatchType: 1,
        AnimMode: parsedArgs.AnimMode,
        WeatherGroupId: 1,
    })
    sendResponsePacket(
        socket,
        'copy.StartBase',
        TStartBaseRet.encode(resData).finish(),
        callbackHandler,
        token,
    )
}
