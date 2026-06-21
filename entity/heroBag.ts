import { EXP_LEVEL } from '@/constants/exp.ts'
import { SPECIAL_REMOULD_EFFECT } from '@/constants/specialRemouldEffect.ts'
import { shipIntensifyNeed, shipIntensifyProvide } from './gameConfig.ts'
import { DB } from 'sqlite'

export interface HeroInfo {
    HeroId: number
    TemplateId: number
    Equips: {
        type: number
        Equip: {
            EquipsId: number
            state: number
        }[]
    }[]
    Lvl: number
    Exp: number
    Advance: number
    Intensify: {
        AttrType: number
        IntensifyLvl: number
        CurExp: number
    }[]
    CreateTime: number
    CurHp: number
    CurGasoline: number
    CurAmmunition: number
    Lock: boolean
    PSkill: any[]
    Status: string
    Name?: string
    ChangeNameTime: number
    Affection: number
    Mood: number
    MarryTime: number
    UpdateTime: number
    MarryType: number
    Fashioning: number
    ArrRemouldEffect: number[]
    RemouldLV: number
    AdvLv: number
    EquipEffects: any[]
    CombinationInfo: {
        ComLv: number
        ComGrade: number
        Combine: number
        BeCombined: number
    }
}

interface BasicHeroInfo {
    id: number
    fashionId: number
    TemplateId: number
    MarryTime: number
    MarryType: number
    Level: number
    Name: string | null
    Locked: boolean
    CreateTime: number
    Exp: number
    Skills: { Id: number; Level: number; Replace: number }[]
    Adv: boolean
    Equips: {
        [k: string]: { EquipsId: number; state: number }
    }
    Remould: number[]
    Intensify: Record<number, {
        AttrType: number
        IntensifyLvl: number
        CurExp: number
    }>
    CombinationInfo: {
        ComLv: number
        ComGrade: number
        Combine: number
        BeCombined: number
    }
}

type HeroInfoSelectResult = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    string | null,
    number,
    number,
    string,
    number,
    string,
    string,
    string,
    string
]

export class HeroBag {
    private db: DB

    constructor(db: DB) {
        this.db = db
    }

    public setHeroMarry(id: number, type: number) {
        // this.heroInfoDb[targetId].isMarried = Math.round(Date.now() / 1000)
        // this.heroInfoDb[targetId].marryType = type
        this.db.query(`UPDATE heroes SET married_time=?,marry_type=? WHERE id=?`, [
            Math.round(Date.now() / 1000),
            type,
            id
        ])
    }

    public setHeroName(id: number, name: string) {
        // this.heroInfoDb[id - 1].Name = name
        // Deno.writeTextFile(
        //     `./playerData/${this.uname}/HeroBag.json`,
        //     JSON.stringify(this.heroInfoDb, null, 4)
        // )
        this.db.query(`UPDATE heroes SET name=? WHERE id=?`, [name, id])
    }

    public getHeroBasicInfoById(id: number): BasicHeroInfo {
        const result =
            this.db.query<HeroInfoSelectResult>('SELECT * FROM heroes WHERE id=?', [id])[0]
        return {
            id: result[0],
            fashionId: result[1],
            TemplateId: result[2],
            Level: result[3],
            Exp: result[4],
            MarryTime: result[5],
            MarryType: result[6],
            Name: result[7],
            Locked: result[8] === 1 ? true : false,
            CreateTime: result[9],
            Skills: JSON.parse(result[10]),
            Adv: result[11] === 1 ? true : false,
            Equips: JSON.parse(result[12]),
            Remould: JSON.parse(result[13]),
            Intensify: JSON.parse(result[14]),
            CombinationInfo: JSON.parse(result[15])
        }
    }

    public getHeroById(id: number): HeroInfo {
        const targetShip: BasicHeroInfo = this.getHeroBasicInfoById(id)
        const equips = {
            type: 1,
            Equip: [
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 }
            ]
        }
        if (targetShip.Equips) {
            for (const k in targetShip.Equips) {
                const key = parseInt(k) - 1
                equips.Equip[key] = targetShip.Equips[k]
            }
        }
        const pskills = []
        if (targetShip.Skills) {
            for (const item of targetShip.Skills) {
                pskills.push({
                    PSkillId: item.Id,
                    PSkillIdLv: item.Level
                })
            }
        }
        let RemouldLV = 0
        if (targetShip.Remould) {
            if (targetShip.Remould.length >= 13) {
                RemouldLV = 1
            }
        }
        return {
            HeroId: id,
            TemplateId: targetShip.TemplateId ?? targetShip.fashionId * 10 + 1,
            Equips: [equips],
            Lvl: targetShip.Level,
            Exp: targetShip.Exp,
            Advance: 0,
            Intensify: [],
            CreateTime: targetShip.CreateTime,
            CurHp: 10000000000, // 最大hp
            CurGasoline: 10000000000,
            CurAmmunition: 10000000000,
            Lock: targetShip.Locked,
            PSkill: pskills,
            Status: '',
            Name: targetShip.Name ?? undefined,
            ChangeNameTime: 0,
            Affection: 2000000, // 最大好感值
            Mood: 1500000, // 最大情绪值,
            MarryTime: targetShip.MarryTime,
            UpdateTime: 0,
            MarryType: targetShip.MarryType,
            Fashioning: targetShip.fashionId,
            ArrRemouldEffect: targetShip.Remould,
            RemouldLV: RemouldLV,
            AdvLv: targetShip.Adv ? 1 : 0,
            EquipEffects: [],
            CombinationInfo: targetShip.CombinationInfo
        }
    }

    public getHeroBag(): Array<HeroInfo> {
        const heros: Array<HeroInfo> = []
        this.db.query<HeroInfoSelectResult>('SELECT * FROM heroes').forEach((v, i) => {
            const pskills = []
            const rawEquips = JSON.parse(v[12])
            const rawSkills = JSON.parse(v[10])
            const rawRemould = JSON.parse(v[13])
            const rawIntensify = JSON.parse(v[14])
            for (const item of rawSkills) {
                const result = {
                    PSkillId: item.Id,
                    Level: item.Level
                } as any
                if (item.Replace) {
                    result.Replace = item.Replace
                }
                pskills.push(result)
            }
            const equips = {
                type: 1,
                Equip: [
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 }
                ]
            }
            for (const k in rawEquips) {
                const key = parseInt(k) - 1
                equips.Equip[key] = rawEquips[k]
            }
            const RemouldLV = Math.floor(rawRemould.length / 13)
            const heroInfo: HeroInfo = {
                HeroId: i + 1,
                TemplateId: v[2],
                Equips: [equips],
                Lvl: v[3],
                Exp: v[4],
                Advance: 0,
                Intensify: [],
                CreateTime: v[9],
                CurHp: 10000000000, // 最大hp
                CurGasoline: 10000000000,
                CurAmmunition: 10000000000,
                Lock: v[8] === 1 ? true : false,
                PSkill: pskills,
                Status: '',
                Name: v[7] ?? undefined,
                ChangeNameTime: 0,
                Affection: 2000000, // 最大好感值
                Mood: 1500000, // 最大情绪值,
                MarryTime: v[5],
                UpdateTime: 0,
                MarryType: v[6],
                Fashioning: v[1],
                ArrRemouldEffect: rawRemould,
                RemouldLV,
                AdvLv: v[11] === 1 ? 1 : 0,
                EquipEffects: [],
                CombinationInfo: JSON.parse(v[15])
            }
            for (const key in rawIntensify) {
                const value = rawIntensify[key]
                heroInfo.Intensify.push(value)
            }
            heros.push(heroInfo)
        })
        return heros
    }

    public setHeroLock(id: number, lock: boolean) {
        // this.heroInfoDb[id - 1].Locked = lock
        // Deno.writeTextFile(
        //     `./playerData/${this.uname}/HeroBag.json`,
        //     JSON.stringify(this.heroInfoDb, null, 4)
        // )
        this.db.query(`UPDATE heroes SET locked=? WHERE id=?`, [lock ? 1 : 0, id])
    }

    public addShip(ships: Array<{ Id: number; TemplateId: number }>) {
        const ids: Array<{ Id: number; TemplateId: number }> = []
        for (const item of ships) {
            this.db.query(
                "INSERT INTO heroes (ship_id, template_id, create_time) VALUES (?, ?, ?)",
                [
                    item.Id,
                    item.TemplateId,
                    Math.round(Date.now() / 1000),
                ]
            )
            ids.push({
                Id: this.db.query<[number]>('SELECT id FROM heroes ORDER BY id DESC LIMIT 1;')[0][0],
                TemplateId: item.TemplateId
            })
        }
        return ids
    }

    public addHeroLevel(id: number, addExp: number) {
        const hero = this.getHeroBasicInfoById(id)
        const currentExp = EXP_LEVEL[hero.Level - 1] + (hero.Exp ?? 0)
        let targetLevel = 0
        for (let i = 0; i < EXP_LEVEL.length; i++) {
            if (EXP_LEVEL[i] > currentExp + addExp) {
                targetLevel = i + 1
                break
            }
        }
        let afterExp = currentExp + addExp - EXP_LEVEL[targetLevel - 2]
        if (targetLevel > 80 && !hero.Adv) {
            targetLevel = 80
            afterExp = 0
        }
        if (targetLevel > 85 && !hero.Adv) {
            targetLevel = 85
            afterExp = 0
        }
        this.db.query(`UPDATE heroes SET level=?, exp=? WHERE id=?`, [targetLevel, afterExp, id])
        return { targetLevel, afterExp }
    }

    public deleteShips(ids: Array<number>) {
        for (const id of ids) {
            this.db.query(`DELETE FROM heroes WHERE id=?`, [id])
        }
    }

    public addShipSkillLevel(id: number, skill: number) {
        const hero = this.getHeroBasicInfoById(id)
        const skills = hero.Skills ?? []
        for (let i = 0; i < skills.length; i++) {
            if (skills[i].Id === skill) {
                skills[i].Level += 1
                this.db.query(`UPDATE heroes SET skills=? WHERE id=?`, [JSON.stringify(skills), id])
                return
            }
        }
        skills.push({ Id: skill, Level: 2, Replace: 0 })
        this.db.query(`UPDATE heroes SET skills=? WHERE id=?`, [JSON.stringify(skills), id])
    }

    public setAdvLv(id: number) {
        this.db.query(`UPDATE heroes SET adv=1 WHERE id=?`, [id])
    }
    public addAdvanceLv(id: number) {
        const hero = this.getHeroBasicInfoById(id)
        let templateId = hero.TemplateId
        if (!templateId) {
            templateId = hero.fashionId * 10 + 1
        }
        this.db.query(`UPDATE heroes SET template_id=? WHERE id=?`, [templateId + 1, id])
    }

    public setFashion(id: number, fashion: number) {
        this.db.query(`UPDATE heroes SET ship_id=? WHERE id=?`, [fashion, id])
    }

    public setEquip({
        HeroId,
        Index,
        EquipId,
        Type
    }: { HeroId: number; Index: number; EquipId: number; Type: number }) {
        if (Type === 1) {
            const hero = this.getHeroBasicInfoById(HeroId)
            const equips = hero.Equips ?? {}
            equips[Index] = { EquipsId: EquipId, state: 4 }
            this.db.query(`UPDATE heroes SET equips=? WHERE id=?`, [JSON.stringify(equips), HeroId])
        }
    }

    public unEquipAll(id: number) {
        this.db.query(`UPDATE heroes SET equips='{}' WHERE id=?`, [id])
    }

    public getEquipInfo(type: number, id: number) {
        if (type === 1) {
            const hero = this.getHeroBasicInfoById(id)
            return hero.Equips
        }
    }

    public setHeroRemould(id: number, effId: number) {
        const hero = this.getHeroBasicInfoById(id)
        const remould = hero.Remould ?? []
        remould.push(effId)
        const skills = hero.Skills ?? []
        if (SPECIAL_REMOULD_EFFECT[effId.toString()]) {
            const effect = SPECIAL_REMOULD_EFFECT[effId.toString()]
            if (effect.type === 'replace') {
                if (!hero.Skills) {
                    skills.push({ Id: effect.old, Replace: 0, Level: 1 })
                }
                for (let i = 0; i < skills.length; i++) {
                    if (skills[i].Id === effect.old) {
                        skills[i].Replace = effect.new
                    }
                }
            } else if (effect.type === 'add') {
                skills.push({ Id: effect.new, Level: 1, Replace: 0 })
            }
        }
        this.db.query(`UPDATE heroes SET remould=?, skills=? WHERE id=?`, [
            JSON.stringify(remould),
            JSON.stringify(skills),
            id
        ])
    }

    public intensify(id: number, consumed: number[]) {
        const targetShip = this.getHeroBasicInfoById(id)
        const needExpConfig = shipIntensifyNeed.getConfig(targetShip.TemplateId)
        const needExpMap: Map<number, number> = new Map()
        let intensify = targetShip.Intensify ?? {}
        try {
            for (const item of needExpConfig.need_power_exp) {
                needExpMap.set(item[0], item[1])
            }
            for (const resId of consumed) {
                const consumedShip = this.getHeroBasicInfoById(resId)
                const provideExpConfig = shipIntensifyProvide.getConfig(
                    consumedShip.TemplateId
                )
                const provideExpMap: Map<number, number> = new Map()
                for (const item of provideExpConfig.provide_power_exp) {
                    provideExpMap.set(item[0], item[1])
                }
                for (const [attr, needExp] of needExpMap) {
                    const provideExp = provideExpMap.get(attr)!
                    if (!intensify[attr]) {
                        intensify[attr] = {
                            AttrType: attr,
                            CurExp: 0,
                            IntensifyLvl: 0
                        }
                    }
                    const curExp = intensify[attr].CurExp
                    const curLevel = intensify[attr].IntensifyLvl

                    const newLevel = Math.round((curExp + provideExp) / needExp) + curLevel
                    const newExp = (curExp + provideExp) % needExp

                    intensify[attr] = {
                        AttrType: attr,
                        CurExp: newExp,
                        IntensifyLvl: newLevel
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
        this.db.query(`UPDATE heroes SET intensify=? WHERE id=?`, [
            JSON.stringify(intensify),
            id
        ])
    }
    public addCombineInfo(heroId: number) {
        const hero = this.getHeroBasicInfoById(heroId)
        let combinationInfo = hero.CombinationInfo
        if (!combinationInfo) {
            combinationInfo = {
                Combine: 1,
                ComGrade: 1,
                ComLv: 1,
                BeCombined: 1
            }
        }
        combinationInfo.ComLv++
        this.db.query(`UPDATE heroes SET combination_info=? WHERE id=?`, [
            JSON.stringify(combinationInfo),
            heroId
        ])
    }
}
