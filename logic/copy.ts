import { Socket } from 'node:net'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'
import { socketPlayerMap } from '../utils/socketMaps.ts'

import { TStartBaseArg, TStartBaseRet } from '../compiled-protobuf/copy.ts'
import { TBattleShip } from '../compiled-protobuf/battleplayer.ts'
import { HeroBasicArrt } from '../entity/attr/heroAttr.ts'

// 注意：此方法现在返回的参数基本都是瞎填的，点击出征会导致游戏卡死
export function StartBase(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs = TStartBaseArg.decode(args)
    console.log(parsedArgs)
    const player = socketPlayerMap.get(socket)!
    const userInfo = player.getUserInfo()
    const playerHeroBag = player.getHeroInfo()
    /*
    我不知道Ship这里缺了什么，已经是按照protobuf填的了
    [22:13:04.899] [UNITY] NullReferenceException: A null value was found where an object instance was required.
      at Battle.StartData.Ship.PBConvert (pb.TBattleShip lShip) [0x00000] in <filename unknown>:0
      at Battle.StartData.Player.PBConvert (pb.TBattlePlayer battlePlayer) [0x00000] in <filename unknown>:0
      at Battle.StartData.PVEStartData..ctor (pb.TStartBaseRet ret) [0x00000] in <filename unknown>:0
      at BabelTime.GD.StageSimpleBattle.getStartData (FSM.FSMParam enterParam) [0x00000] in <filename unknown>:0
      at BabelTime.GD.StageSimpleBattle.initBattle (FSM.FSMParam enterParam) [0x00000] in <filename unknown>:0
      at BabelTime.GD.StageBattleBaseEx.StageEnterImpl (FSM.FSMParam enterParam) [0x00000] in <filename unknown>:0
      at BabelTime.GD.StateBattleBaseImpl.StageEnter (FSM.FSMParam enterParam) [0x00000] in <filename unknown>:0
      at BabelTime.GD.StageBase.Enter (FSM.FSMParam enterParam) [0x00000] in <filename unknown>:0
      at FSM.FSMBaseState`1[M]._Enter (FSM.FSMParam enterParam) [0x00000] in <filename unknown>:0
      at BabelTime.GD.StageMgr.DelayGoto () [0x00000] in <filename unknown>:0
      at BabelTime.GD.StageMgr.Tick (Single deltaTime) [0x00000] in <filename unknown>:0
      at BabelTime.GD.GameApp.Update (Single deltaTime) [0x00000] in <filename unknown>:0
      at BabelTime.GD.Main.Update () [0x00000] in <filename unknown>:0

    (Filename: currently not available on il2cpp Line: -1)
    */
    const Ships: Array<TBattleShip> = []
    let counter = 1
    try {
        for (const item of parsedArgs.HeroList[0].HeroIdList) {
            const ship = playerHeroBag.getHeroById(item)
            const attr = new HeroBasicArrt(ship, player)
            const data: TBattleShip = {
                HeroId: ship.HeroId + 1,
                TemplateId: ship.TemplateId,
                Level: ship.Lvl,
                Index: counter++,
                Attr: attr.getAttr(),
                CurHp: ship.CurHp,
                Equips: [],
                PSkill: ship.PSkill,
                BathBuff: [],
                AdvEffectIdList: [],
                EquipGridNum: ship.Equips.length,
                Fashioning: ship.Fashioning,
                HurtPer: 1000
            }
            Ships.push(data)
        }
    } catch (e) {
        console.error(e)
    }
    const ret: TStartBaseRet = {
        BattlePlayer: {
            BattlePlayerList: [{
                Pid: userInfo.Uid,
                Uid: userInfo.Uid,
                Uname: userInfo.Uname,
                Level: userInfo.Level,
                PlayerCamp: 0,
                Index: 0,
                FleetInfo: {
                    FleetId: 1,
                    FormationId: 1001,
                    Index: parsedArgs.HeroList[0].Index,
                    Ships,
                    StrategyId: parsedArgs.HeroList[0].StrategyId,
                    ConditionList: [],
                    KillTimes: 0,
                    HeroList: parsedArgs.HeroList[0].HeroIdList,
                    TacticType: 1
                },
                OpenFunc: [],
                BattleMode: parsedArgs.BattleMode,
                RandomFactors: []
            }]
        },
        RandomSeed: 0,
        Rid: 1,
        arrRes: [],
        EnemyFleet: [],
        CopyId: parsedArgs.CopyId,
        CopyType: 1,
        CopyPass: false,
        BossProgress: 0,
        IsRunningFight: false,
        ShipEquipGridInfo: [],
        RandomFactors: [],
        SafeLv: 0,
        Verify: undefined,
        ExtraBattlePlayerList: [],
        Token: '',
        SkipVcr: [],
        BattleMode: parsedArgs.BattleMode,
        IsFinal: false,
        AnimMode: parsedArgs.AnimMode,
        //在config_weather_group中找
        WeatherGroupId: 5,
        CopyMission: [],
        EnemyFleets: [],
        ConfigData: [],
        MatchType: parsedArgs.MatchType
    }
    const resData = TStartBaseRet.create(ret)

    sendResponsePacket(
        socket,
        'copy.StartBase',
        TStartBaseRet.encode(resData).finish(),
        callbackHandler,
        token
    )
}
