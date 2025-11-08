import { EXP_LEVEL } from "../constants/exp.ts";

interface HeroInfo {
    HeroId: number;
    TemplateId: number;
    Equips: any[];
    Lvl: number;
    Exp: number;
    Advance: number;
    Intensify: any[];
    CreateTime: number;
    CurHp: number;
    CurGasoline: number;
    CurAmmunition: number;
    Lock: boolean;
    PSkill: any[];
    Status: string;
    Name?: string;
    ChangeNameTime: number;
    Affection: number;
    Mood: number;
    MarryTime: number;
    UpdateTime: number;
    MarryType: number;
    Fashioning: number;
    ArrRemouldEffect: number[];
    RemouldLV: number;
    AdvLv: number;
    EquipEffects: any[];
    CombinationInfo: any[];
}

interface BasicHeroInfo {
    id: number
    TemplateId?: number
    isMarried?: boolean | number
    marryType?: number
    Level: number
    Name?: string
    Locked?: boolean
    CreateTime?: number
    deleted?: boolean
    Exp?: number
    Skills?: { Id: number; Level: number }[]
    Adv?: boolean
    Equips?: {
        [k: string]: { EquipsId: number; state: number }
    }
}

export class HeroBag {
    private heroInfo: Array<BasicHeroInfo>
    private uname: string

    constructor(uname: string) {
        this.heroInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${uname}/HeroBag.json`))
        this.uname = uname
    }

    public reload() {
        this.heroInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/HeroBag.json`))
    }

    public setHeroMarry(id: number, type: number) {
        const targetId = id - 1
        this.heroInfo[targetId].isMarried = Math.round(Date.now() / 1000)
        this.heroInfo[targetId].marryType = type
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setHeroName(id: number, name: string) {
        this.heroInfo[id - 1].Name = name
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public getHeroBasicInfoById(id: number) {
        return this.heroInfo[id - 1]
    }

    public getHeroById(id: number) {
        const targetId = id - 1
        const targetShip = this.heroInfo[targetId]
        const equips = {
            type: 1,
            Equip: [
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
                { EquipsId: 0, state: 0 },
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
                    Level: item.Level
                })
            }
        }
        return {
            HeroId: targetId,
            TemplateId: targetShip.TemplateId ?? targetShip.id * 10 + 1,
            Equips: [equips],
            Lvl: targetShip.Level,
            Exp: targetShip.Exp ?? 0,
            Advance: 0,
            Intensify: [],
            CreateTime: targetShip.CreateTime ? targetShip.CreateTime : Math.round(Date.now() / 1000),
            CurHp: 10000000000, // 最大hp
            CurGasoline: 10000000000,
            CurAmmunition: 10000000000,
            Lock: targetShip.Locked ? true : false,
            PSkill: pskills,
            Status: "",
            Name: targetShip.Name,
            ChangeNameTime: 0,
            Affection: 2000000, // 最大好感值
            Mood: 1500000, // 最大情绪值,
            MarryTime: targetShip.isMarried ? Math.round(Date.now() / 1000) : 0,
            UpdateTime: 0,
            MarryType: targetShip.marryType ? targetShip.marryType : 0,
            Fashioning: targetShip.id,
            ArrRemouldEffect: [],
            RemouldLV: 0,
            AdvLv: targetShip.Adv ? 1 : 0,
            EquipEffects: [],
            CombinationInfo: []
        }
    }

    public getHeroBag(): Array<HeroInfo> {
        const heros: Array<HeroInfo> = []
        this.heroInfo.forEach((v, k) => {
            const pskills = []
            if (v.Skills) {
                for (const item of v.Skills) {
                    pskills.push({
                        PSkillId: item.Id,
                        Level: item.Level
                    })
                }
            }
            const equips = {
                type: 1,
                Equip: [
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                    { EquipsId: 0, state: 0 },
                ]
            }
            if (v.Equips) {
                for (const k in v.Equips) {
                    const key = parseInt(k) - 1
                    equips.Equip[key] = v.Equips[k]
                }
            }
            const heroInfo = {
                HeroId: k + 1,
                TemplateId: v.TemplateId ?? v.id * 10 + 1,
                Equips: [equips],
                Lvl: v.Level,
                Exp: v.Exp ?? 0,
                Advance: 0,
                Intensify: [],
                CreateTime: v.CreateTime ? v.CreateTime : Math.round(Date.now() / 1000),
                CurHp: 10000000000, // 最大hp
                CurGasoline: 10000000000,
                CurAmmunition: 10000000000,
                Lock: v.Locked ? true : false,
                PSkill: pskills,
                Status: "",
                Name: v.Name,
                ChangeNameTime: 0,
                Affection: 2000000, // 最大好感值
                Mood: 1500000, // 最大情绪值,
                MarryTime: v.isMarried ? Math.round(Date.now() / 1000) : 0,
                UpdateTime: 0,
                MarryType: v.marryType ? v.marryType : 0,
                Fashioning: v.id,
                ArrRemouldEffect: [],
                RemouldLV: 0,
                AdvLv: v.Adv ? 1 : 0,
                EquipEffects: [],
                CombinationInfo: []
            }
            if (typeof (v.isMarried) === 'number') {
                heroInfo.MarryTime = v.isMarried
            }
            heros.push(heroInfo)
        })
        return heros
    }

    public setHeroLock(id: number, lock: boolean) {
        this.heroInfo[id - 1].Locked = lock
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public addShip(ships: Array<{ Id: number; TemplateId: number }>) {
        const ids: Array<{ Id: number; TemplateId: number }> = []
        for (const item of ships) {
            this.heroInfo.push({
                id: item.Id,
                TemplateId: item.TemplateId,
                CreateTime: Math.round(Date.now() / 1000),
                isMarried: false,
                Level: 1,
                Exp: 0
            })
            ids.push({
                Id: this.heroInfo.length,
                TemplateId: item.TemplateId
            })
        }
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
        return ids
    }

    public addHeroLevel(id: number, addExp: number) {
        const targetId = id - 1
        const hero = this.heroInfo[targetId]
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
        this.heroInfo[targetId].Level = targetLevel
        this.heroInfo[targetId].Exp = afterExp
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
        return { targetLevel, afterExp }
    }

    public deleteShips(ids: Array<number>) {
        for (const id of ids) {
            this.heroInfo[id - 1].deleted = true
        }
        for (let i = 0; i < this.heroInfo.length; i++) {
            if (this.heroInfo[i].deleted) {
                this.heroInfo.splice(i, 1)
            }
        }
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public addShipSkillLevel(id: number, skill: number) {
        const targetId = id - 1
        if (!this.heroInfo[targetId].Skills) {
            this.heroInfo[targetId].Skills = []
        }
        for (let i = 0; i < this.heroInfo[targetId].Skills.length; i++) {
            if (this.heroInfo[targetId].Skills[i].Id === skill) {
                this.heroInfo[targetId].Skills[i].Level += 1
                Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
                return
            }
        }
        this.heroInfo[targetId].Skills.push({
            Id: skill,
            Level: 2
        })
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setAdvLv(id: number) {
        this.heroInfo[id - 1].Adv = true
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }
    public addAdvanceLv(id: number) {
        const targetId = id - 1
        if (!this.heroInfo[targetId].TemplateId) {
            this.heroInfo[targetId].TemplateId = this.heroInfo[targetId].id * 10 + 1
        }
        this.heroInfo[targetId].TemplateId++
        console.log(this.heroInfo[targetId].TemplateId)
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setFashion(id: number, fashion: number) {
        this.heroInfo[id - 1].id = fashion
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setEquip({
        HeroId,
        Index,
        EquipId,
        Type,
    }: { HeroId: number; Index: number; EquipId: number; Type: number }) {
        if (Type === 1) {
            const targetId = HeroId - 1
            if (!this.heroInfo[targetId].Equips) {
                this.heroInfo[targetId].Equips = {}
            }
            this.heroInfo[targetId].Equips[Index] = {
                EquipsId: EquipId,
                state: 4
            }
        }

        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public unEquipAll(id: number) {
        const targetId = id - 1
        this.heroInfo[targetId].Equips = {}
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public getEquipInfo(type: number, id: number) {
        if (type === 1) {
            return this.heroInfo[id - 1].Equips
        }
    }
}