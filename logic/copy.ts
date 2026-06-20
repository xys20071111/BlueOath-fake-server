import { DB } from 'sqlite'
import { existsSync } from 'node:fs'
import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '@/utils/createResponsePacket.ts'
import { socketPlayerMap } from '@/utils/socketMaps.ts'
import { HeroBasicArrt } from '@/entity/attr/heroAttr.ts'
import { EmptyReply } from '@/utils/emptyReceive.ts'

const copyPb = protobuf.loadSync('./raw-protobuf/copy.proto')
const battlePlayerPb = protobuf.loadSync('./raw-protobuf/battleplayer.proto')

const TStartBaseArg = copyPb.lookupType('copy.TStartBaseArg')
const TStartBaseRet = copyPb.lookupType('copy.TStartBaseRet')
const TBattlePlayerList = battlePlayerPb.lookupType('battleplayer.TBattlePlayerList')
const TBattlePlayer = battlePlayerPb.lookupType('battleplayer.TBattlePlayer')
const TBattleFleet = battlePlayerPb.lookupType('battleplayer.TBattleFleet')
const TBattleShip = battlePlayerPb.lookupType('battleplayer.TBattleShip')
const TBattleEquip = battlePlayerPb.lookupType('battleplayer.TBattleEquip')
const THeroAttr = battlePlayerPb.lookupType('battleplayer.THeroAttr')
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
                            PSkillLv: skill.PSkillIdLv ?? 1
                        })
                    )
                }
            }
            const attrCalc = new HeroBasicArrt(heroInfo, player)
            const attrs = attrCalc.getAttr()
            console.log(`[buildBattleShips] HeroId=${heroInfo.HeroId} TemplateId=${heroInfo.TemplateId} Level=${heroInfo.Lvl}`)
            const attrMap: Record<number, number> = {}
            for (const a of attrs) if (a.AttrId) attrMap[a.AttrId] = a.AttrValue ?? 0
            console.log(`[buildBattleShips]  attack(id=8)=${attrMap[8]} defense(id=9)=${attrMap[9]} hp(id=1)=${attrMap[1]} torpedo_attack(id=10)=${attrMap[10]} torpedo_defense(id=11)=${attrMap[11]} cat_attack(id=600)=${attrMap[600]} cat_defense(id=901)=${attrMap[901]} hit(id=19)=${attrMap[19]} dodge(id=20)=${attrMap[20]}`)
            ships.push(
                TBattleShip.create({
                    HeroId: heroInfo.HeroId,
                    TemplateId: heroInfo.TemplateId,
                    Level: heroInfo.Lvl,
                    Index: i,
                    Attr: attrs,
                    CurHp: heroInfo.CurHp ?? 100000,
                    Equips: [],
                    PSkill: pskills,
                    BathBuff: [],
                    AdvEffectIdList: [],
                    EquipGridNum: 6,
                    Fashioning: heroInfo.Fashioning,
                    HurtPer: 0
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
                    EquipGridNum: 6,
                    Fashioning: 0,
                    HurtPer: 0
                })
            )
        }
    }
    return ships
}

function resolveEnemyFleetIds(rid: number, fleetIds: number[]): number[] {
    if (fleetIds.length > 0) return fleetIds
    const result: number[] = []
    const ridStr = String(rid)
    for (const obj of iterateJson('config_fleet.db')) {
        const fId = obj.f_id ?? obj.id
        if (fId && String(fId).startsWith(ridStr)) {
            result.push(fId)
        }
    }
    return result.sort()
}

// ── NPC Assist Fleet helpers ──────────────────────────────────────

let attrTableCache: Record<number, string> | null = null

const COMBAT_ATTRS: [number, string][] = [
    [17, 'crit'],
    [18, 'anti_crit'],
    [19, 'hit'],
    [20, 'dodge'],
    [22, 'fate'],
]

function loadAttrTableCache(): Record<number, string> {
    if (attrTableCache) return attrTableCache
    attrTableCache = {}
    for (const obj of iterateJson('config_attribute.db')) {
        if (obj.girl_if_show === 1) {
            const id = obj.attr_type ?? obj.id
            attrTableCache[Number(id)] = obj.beizhu ?? ''
        }
    }
    for (const [id, beizhu] of COMBAT_ATTRS) {
        if (!(id in attrTableCache)) {
            attrTableCache[id] = beizhu
        }
    }
    return attrTableCache
}

function getAttrStringById(attrId: number): string {
    return loadAttrTableCache()[attrId] ?? ''
}

function getShipInfoId(templateId: number): number {
    const shipMain = loadJsonById('config_ship_main.db', templateId)
    return shipMain?.ship_info_id ?? 0
}

function hasNpcAssist(copyDisplayId: number): boolean {
    const copyDisplay = loadJsonById('config_copy_display.db', copyDisplayId)
    if (!copyDisplay) return false
    const assistFleet: number[] = copyDisplay.assist_fleet ?? []
    return assistFleet.length > 0 && assistFleet.some((id) => id !== 0)
}

function createNpcBattleShip(assistInfoId: number, position: number): Record<string, any> | null {
    const assistInfo = loadJsonById('config_assist_ship_info.db', assistInfoId)
    if (!assistInfo) return null

    const shipMainId = Number(assistInfo.ship_main_id)
    const shipMain = loadJsonById('config_ship_main.db', shipMainId)
    if (!shipMain) return null

    const battleConfig = loadJsonById('config_battle_config.db', 169)
    const defaultHp = battleConfig ? Number(battleConfig.data) : 10000000000

    const skillIds: number[] = shipMain.direct_activate_talent_id ?? []
    const skillLvs: number[] = assistInfo.ship_skill_level ?? []
    const pskills = skillIds.map((id, i) =>
        TFiledPSkillLv.create({ PSkillId: id, PSkillLv: skillLvs[i] ?? 1 })
    )

    const equips: any[] = []
    const equipIds: number[] = assistInfo.equip ?? []
    const equipLvs: number[] = assistInfo.equip_level ?? []
    for (let i = 0; i < 6; i++) {
        const eid = equipIds[i]
        if (eid && eid !== 0) {
            const level = equipLvs[i] ?? 0
            const attrValues = computeEquipAttrs(eid, level)
            const shipEquipRec = loadJsonById('config_ship_equip.db', shipMainId)
            const planeNum = shipEquipRec?.plane_number?.[i] ?? 0
            equips.push(
                TBattleEquip.create({
                    EquipTid: eid,
                    EquipIndex: i + 1,
                    PlaneNum: planeNum,
                    AttrValue: attrValues,
                    PSkillEquipList: []
                })
            )
        }
    }

    const attrMap: Record<number, number> = {}
    for (const [attrIdStr, name] of Object.entries(loadAttrTableCache())) {
        if (!name) continue
        const attrValue = assistInfo[name]
        if (attrValue != null) {
            attrMap[Number(attrIdStr)] = (attrMap[Number(attrIdStr)] ?? 0) + Number(attrValue)
        }
    }

    const shipBreak = loadJsonById('config_ship_break.db', shipMainId)
    if (shipBreak) {
        const effectIds: number[] = shipBreak.ship_break_effect_id_list ?? []
        for (const effId of effectIds) {
            const effect = loadJsonById('config_ship_break_effect.db', effId)
            if (effect?.type != null && effect?.value != null) {
                attrMap[Number(effect.type)] = (attrMap[Number(effect.type)] ?? 0) +
                    Number(effect.value)
            }
        }
    }

    const attrs = Object.entries(attrMap).map(([idStr, val]) =>
        THeroAttr.create({ AttrId: Number(idStr), AttrValue: val })
    )

    return TBattleShip.create({
        HeroId: assistInfoId,
        TemplateId: shipMainId,
        Level: assistInfo.ship_level ?? 1,
        Index: position - 1,
        Attr: attrs,
        CurHp: defaultHp,
        Equips: equips,
        PSkill: pskills,
        BathBuff: [],
        AdvEffectIdList: [],
        EquipGridNum: 6,
        Fashioning: assistInfo.ship_fashion_id ?? 0,
        HurtPer: 0
    })
}

function computeEquipAttrs(equipTid: number, level: number): any[] {
    const equipRec = loadJsonById('config_equip.db', equipTid)
    if (!equipRec) return []

    const equipProp: number[][] = equipRec.equip_prop ?? []
    const enhanceProp: number[][] = equipRec.enhance_prop ?? []

    const attrMap: Record<number, number> = {}
    for (const [attrId, baseValue] of equipProp) {
        attrMap[attrId] = (attrMap[attrId] ?? 0) + baseValue
    }
    if (level > 0) {
        for (const [attrId, addPerLevel] of enhanceProp) {
            attrMap[attrId] = (attrMap[attrId] ?? 0) + level * addPerLevel
        }
    }

    return Object.entries(attrMap).map(([idStr, val]) =>
        THeroAttr.create({ AttrId: Number(idStr), AttrValue: val })
    )
}

function replaceNpcShips(
    currShips: any[],
    heroIdList: number[],
    copyDisplayId: number
): { ships: any[]; heroIdList: number[] } {
    const copyDisplay = loadJsonById('config_copy_display.db', copyDisplayId)
    if (!copyDisplay) return { ships: currShips, heroIdList }

    const assistFleet: number[] = copyDisplay.assist_fleet ?? []
    const totalCount: number = copyDisplay.assist_fleet_num ?? 0
    if (assistFleet.length === 0 || totalCount === 0) {
        return { ships: currShips, heroIdList }
    }

    const assistShips: any[] = []
    for (let i = 0; i < assistFleet.length; i++) {
        const aid = assistFleet[i]
        if (aid !== 0) {
            const ship = createNpcBattleShip(aid, i + 1)
            assistShips.push(ship ?? 0)
        } else {
            assistShips.push(0)
        }
    }

    const result: any[] = []
    const tidMap: Record<number, boolean> = {}

    result[0] = currShips[0]
    if (assistShips[0] !== 0) {
        result[0] = assistShips[0]
        result[0].Index = 0
    } else {
        if (!currShips[0]) {
            result[0] = assistShips[1]
        }
        assistShips.shift()
    }

    if (result[0]) {
        const tid = getShipInfoId(result[0].TemplateId)
        if (tid !== 0) tidMap[tid] = true
    }

    let remainCount = totalCount - 1
    let lastIndex = 1

    if (remainCount > 0) {
        for (const as of assistShips) {
            if (as === 0) continue
            const asTid = getShipInfoId(as.TemplateId)
            if (asTid !== 0 && !tidMap[asTid]) {
                result[lastIndex] = as
                as.Index = lastIndex
                tidMap[asTid] = true
                lastIndex++
                remainCount--
                if (remainCount <= 0) break
            }
        }
    }

    if (remainCount > 0) {
        for (const ship of currShips) {
            if (!ship) continue
            const heroTid = getShipInfoId(ship.TemplateId)
            if (!tidMap[heroTid]) {
                result[lastIndex] = ship
                ship.Index = lastIndex
                lastIndex++
                remainCount--
                if (remainCount <= 0) break
            }
        }
    }

    const validShips = result.filter((s) => s && typeof s === 'object' && s.HeroId)

    const newHeroIdList = validShips.map((s) => s.HeroId).filter((id) => id !== 0)

    return { ships: validShips, heroIdList: newHeroIdList }
}

export const AttactBase = EmptyReply('copy.AttackBase')

// ── PassBase (battle completion) ──────────────────────────────────

const TPassBaseArg = copyPb.lookupType('copy.TPassBaseArg')
const TPassBaseRet = copyPb.lookupType('copy.TPassBaseRet')

export function PassBase(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs: any = TPassBaseArg.decode(args).toJSON()
    console.log(JSON.stringify(parsedArgs, null, 4))

    const copyId = parsedArgs.BaseId ?? parsedArgs.CopyId ?? 0

    const retData = TPassBaseRet.create({
        Reward: [],
        BattlePlayer: null,
        Ret: 0,
        Grade: 1,
        ExReward: [],
        StarLv: 3,
        Evaluate: [],
        PassTime: 0,
        ExtraReward: [],
        FirstPass: 0,
        ExpReward: [],
        CopyId: copyId,
        BuildShipId: 0,
        BuildShipReward: [],
        MissionReward: []
    })

    sendResponsePacket(
        socket,
        'copy.PassBase',
        TPassBaseRet.encode(retData).finish(),
        callbackHandler,
        token
    )
}

export function StartBase(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string
) {
    const parsedArgs: any = TStartBaseArg.decode(args).toJSON()

    console.log(JSON.stringify(parsedArgs, null, 4))

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
    const rawFleetIds: number[] = copyRecord?.fleet_id ?? []
    const fleetIds = resolveEnemyFleetIds(rid, rawFleetIds)
    const copyType = copyRecord?.copy_type ?? 0
    const weatherGroupIds: number[] = copyRecord?.weather_group ?? []

    const copyDisplay = loadJsonById('config_copy_display.db', copyDisplayId)

    const fleets: any[] = []

    for (const formation of heroList) {
        const heroIdList: number[] = formation.HeroIdList ?? []
        const strategyId = formation.StrategyId ?? 0
        const index = formation.Index ?? 0

        const ships = buildBattleShips(heroIdList, player)

        if (hasNpcAssist(copyDisplayId)) {
            const merged = replaceNpcShips(ships, heroIdList, copyDisplayId)
            fleets.push(
                TBattleFleet.create({
                    FleetId: index,
                    FormationId: 0,
                    Index: index,
                    Ships: merged.ships,
                    StrategyId: strategyId,
                    ConditionList: [],
                    KillTimes: 0,
                    HeroList: merged.heroIdList,
                    TacticType: 0
                })
            )
        } else {
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
    }

    const shipEquipGridInfos: any[] = []
    for (const fleet of fleets) {
        for (const ship of fleet.Ships ?? []) {
            if (!ship || !ship.HeroId) continue
            shipEquipGridInfos.push(
                copyPb.lookupType('copy.TShipEquipGridInfo').create({
                    HeroId: ship.HeroId,
                    EquipGridNum: 6
                })
            )
        }
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
