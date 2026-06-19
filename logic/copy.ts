import { DB } from 'sqlite'
import { existsSync } from 'node:fs'
import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '@/utils/createResponsePacket.ts'
import { socketPlayerMap } from '@/utils/socketMaps.ts'
import { HeroBasicArrt } from '@/entity/attr/heroAttr.ts'

const copyPb = protobuf.loadSync('./raw-protobuf/copy.proto')
const battlePlayerPb = protobuf.loadSync('./raw-protobuf/battleplayer.proto')

const TStartBaseArg = copyPb.lookupType('copy.TStartBaseArg')
const TStartBaseRet = copyPb.lookupType('copy.TStartBaseRet')
const TBattlePlayerList = battlePlayerPb.lookupType('battleplayer.TBattlePlayerList')
const TBattlePlayer = battlePlayerPb.lookupType('battleplayer.TBattlePlayer')
const TBattleFleet = battlePlayerPb.lookupType('battleplayer.TBattleFleet')
const TBattleShip = battlePlayerPb.lookupType('battleplayer.TBattleShip')
const TFiledPSkillLv = battlePlayerPb.lookupType('battleplayer.TFiledPSkillLv')

const CONFIG_DIR = './game-config'

function loadJsonById(dbName: string, id: number | string): Record<string, any> | null {
    const path = `${CONFIG_DIR}/${dbName}`
    if (!existsSync(path)) return null
    try {
        const db = new DB(path)
        const rows = db.query<[Uint8Array]>(
            'SELECT jsonbytes FROM DBObject WHERE id=?',
            [String(id)]
        )
        db.close()
        if (rows.length === 0) return null
        return JSON.parse(new TextDecoder().decode(rows[0][0]))
    } catch {
        return null
    }
}

function* iterateJson(dbName: string): Generator<Record<string, any>> {
    const path = `${CONFIG_DIR}/${dbName}`
    if (!existsSync(path)) return
    try {
        const db = new DB(path)
        const rows = db.query<[Uint8Array]>('SELECT jsonbytes FROM DBObject')
        db.close()
        for (const row of rows) {
            try {
                yield JSON.parse(new TextDecoder().decode(row[0]))
            } catch { /* skip malformed */ }
        }
    } catch { /* skip unopenable */ }
}

function findCopyRecord(copyDisplayId: number): Record<string, any> | null {
    for (const obj of iterateJson('config_copy.db')) {
        if (obj.copy_id === copyDisplayId) {
            return obj
        }
    }
    return null
}

function buildBattleShips(heroIds: number[], player: any): any[] {
    const heroBag = player.getHeroInfo()
    const ships: any[] = []
    for (let i = 0; i < heroIds.length; i++) {
        const heroId = heroIds[i]
        if (heroId === 0) continue
        try {
            const heroInfo = heroBag.getHeroById(heroId)
            const pskills: any[] = []
            if (heroInfo.PSkill) {
                for (const skill of heroInfo.PSkill) {
                    pskills.push(
                        TFiledPSkillLv.create({
                            PSkillId: skill.PSkillId,
                            Level: skill.PSkillIdLv ?? 0
                        })
                    )
                }
            }
            const attrCalc = new HeroBasicArrt(heroInfo, player)
            ships.push(
                TBattleShip.create({
                    HeroId: heroInfo.HeroId,
                    TemplateId: heroInfo.TemplateId,
                    Level: heroInfo.Lvl,
                    Index: i,
                    Attr: attrCalc.getAttr(),
                    CurHp: heroInfo.CurHp ?? 100000,
                    Equips: [],
                    PSkill: pskills,
                    BathBuff: [],
                    AdvEffectIdList: [],
                    EquipGridNum: 6,
                    Fashioning: heroInfo.Fashioning
                })
            )
        } catch {
            ships.push(
                TBattleShip.create({
                    HeroId: heroId,
                    TemplateId: heroId,
                    Level: 1,
                    Index: i,
                    Attr: [
                        { AttrId: 1, AttrValue: 50000 },
                        { AttrId: 2, AttrValue: 500 },
                        { AttrId: 3, AttrValue: 500 },
                        { AttrId: 4, AttrValue: 500 }
                    ],
                    CurHp: 100000,
                    Equips: [],
                    PSkill: [],
                    BathBuff: [],
                    AdvEffectIdList: [],
                    EquipGridNum: 6
                })
            )
        }
    }
    return ships
}

export function StartBase(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs: any = TStartBaseArg.decode(args).toJSON()
    const player = socketPlayerMap.get(socket)!
    const userInfo = player.getUserInfo()
    const uid = userInfo.Uid
    const uname = userInfo.Uname
    const level = userInfo.Level
    const copyDisplayId = parsedArgs.CopyId ?? 0
    const chapterId = parsedArgs.ChapterId ?? 0
    const isRunningFight = parsedArgs.IsRunningFight ?? false
    const battleMode = parsedArgs.BattleMode ?? 0
    const heroList: any[] = parsedArgs.HeroList ?? []

    const copyRecord = findCopyRecord(copyDisplayId)
    const rid = copyRecord?.r_id ?? 0
    const fleetIds: number[] = copyRecord?.fleet_id ?? []
    const copyType = copyRecord?.copy_type ?? 0
    const weatherGroupIds: number[] = copyRecord?.weather_group ?? []

    const copyDisplay = loadJsonById('config_copy_display.db', copyDisplayId)

    const fleets: any[] = []
    const shipEquipGridInfos: any[] = []

    for (const formation of heroList) {
        const heroIdList: number[] = formation.HeroIdList ?? []
        const strategyId = formation.StrategyId ?? 0
        const index = formation.Index ?? 0

        const ships = buildBattleShips(heroIdList, player)

        for (const ship of ships) {
            shipEquipGridInfos.push(
                copyPb.lookupType('copy.TShipEquipGridInfo').create({
                    HeroId: ship.HeroId,
                    EquipGridNum: 6
                })
            )
        }

        fleets.push(
            TBattleFleet.create({
                FleetId: index,
                FormationId: 0,
                Index: index,
                Ships: ships,
                StrategyId: strategyId,
                ConditionList: [],
                KillTimes: 0,
                HeroList: heroIdList,
                TacticType: 0
            })
        )
    }

    const battlePlayerList = TBattlePlayerList.create({
        BattlePlayerList: fleets.length > 0
            ? fleets.map((f, i) =>
                TBattlePlayer.create({
                    Pid: uid,
                    Uid: uid,
                    Uname: uname,
                    Level: level,
                    PlayerCamp: 0,
                    Index: i,
                    FleetInfo: f,
                    OpenFunc: [],
                    BattleMode: 0,
                    RandomFactors: []
                })
            )
            : [
                TBattlePlayer.create({
                    Pid: uid,
                    Uid: uid,
                    Uname: uname,
                    Level: level,
                    PlayerCamp: 0,
                    Index: 0,
                    FleetInfo: null,
                    OpenFunc: [],
                    BattleMode: 0,
                    RandomFactors: []
                })
            ]
    })

    const weatherGroupId = weatherGroupIds.length > 0 ? weatherGroupIds[0] : 0

    const retData = TStartBaseRet.create({
        BattlePlayer: battlePlayerList,
        RandomSeed: Math.floor(Math.random() * 2147483647),
        Rid: rid,
        arrRes: [],
        EnemyFleet: fleetIds,
        CopyId: copyDisplayId,
        CopyType: copyType,
        CopyPass: false,
        BossProgress: 0,
        IsRunningFight: isRunningFight,
        ShipEquipGridInfo: shipEquipGridInfos,
        RandomFactors: [],
        SafeLv: 0,
        Token: '',
        ExtraBattlePlayerList: [],
        SkipVcr: [],
        BattleMode: battleMode,
        IsFinal: false,
        AnimMode: parsedArgs.AnimMode ?? 0,
        WeatherGroupId: weatherGroupId,
        CopyMission: [],
        EnemyFleets: [],
        ConfigData: [],
        MatchType: parsedArgs.MatchType ?? 0
    })

    sendResponsePacket(
        socket,
        'copy.StartBase',
        TStartBaseRet.encode(retData).finish(),
        callbackHandler,
        token
    )
}
