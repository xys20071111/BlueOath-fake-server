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
        this.heroInfo[id].isMarried = Math.round(Date.now() / 1000)
        this.heroInfo[id].marryType = type
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setHeroName(id: number, name: string) {
        this.heroInfo[id].Name = name
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public getHeroBasicInfoById(id: number) {
        return this.heroInfo[id]
    }

    public getHeroById(id: number) {
        return {
            HeroId: id,
            TemplateId: this.heroInfo[id].TemplateId ?? this.heroInfo[id].id * 10 + 1,
            Equips: [],
            Lvl: this.heroInfo[id].Level,
            Exp: this.heroInfo[id].Exp ?? 0,
            Advance: 0,
            Intensify: [],
            CreateTime: this.heroInfo[id].CreateTime ? this.heroInfo[id].CreateTime : Math.round(Date.now() / 1000),
            CurHp: 10000000000, // 最大hp
            CurGasoline: 10000000000,
            CurAmmunition: 10000000000,
            Lock: this.heroInfo[id].Locked ? true : false,
            PSkill: [],
            Status: "",
            Name: this.heroInfo[id].Name,
            ChangeNameTime: 0,
            Affection: 2000000, // 最大好感值
            Mood: 1500000, // 最大情绪值,
            MarryTime: this.heroInfo[id].isMarried ? Math.round(Date.now() / 1000) : 0,
            UpdateTime: 0,
            MarryType: this.heroInfo[id].marryType ? this.heroInfo[id].marryType : 0,
            Fashioning: this.heroInfo[id].id,
            ArrRemouldEffect: [],
            RemouldLV: 0,
            AdvLv: this.heroInfo[id].Adv ? 1 : 0,
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
            const heroInfo = {
                HeroId: k,
                TemplateId: v.TemplateId ?? v.id * 10 + 1,
                Equips: [],
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
        this.heroInfo[id].Locked = lock
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public addShip(ships: Array<{ Id: number; TemplateId: number }>) {
        // 在抽卡功能写完前不要向文件内写入
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
                Id: this.heroInfo.length - 1,
                TemplateId: item.TemplateId
            })
        }
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
        return ids
    }

    public addHeroLevel(id: number, addExp: number) {
        const hero = this.heroInfo[id]
        const currentExp = EXP_LEVEL[hero.Level - 1] + (hero.Exp ?? 0)
        let targetLevel = 0
        for (let i = 0; i < EXP_LEVEL.length; i++) {
            if (EXP_LEVEL[i] > currentExp + addExp) {
                targetLevel = i + 1
                break
            }
        }
        let afterExp = currentExp + addExp - EXP_LEVEL[targetLevel - 2]
        // 先不写进阶部分
        if (targetLevel > 80 && !hero.Adv) {
            targetLevel = 80
            afterExp = 0
        }
        this.heroInfo[id].Level = targetLevel
        this.heroInfo[id].Exp = afterExp
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
        return { targetLevel, afterExp }
    }

    public deleteShips(ids: Array<number>) {
        for (const id of ids) {
            this.heroInfo[id].deleted = true
        }
        for (let i = 0; i < this.heroInfo.length; i++) {
            if (this.heroInfo[i].deleted) {
                this.heroInfo.splice(i, 1)
            }
        }
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public addShipSkillLevel(id: number, skill: number) {
        if (!this.heroInfo[id].Skills) {
            this.heroInfo[id].Skills = []
        }
        for (let i = 0; i < this.heroInfo[id].Skills.length; i++) {
            if (this.heroInfo[id].Skills[i].Id === skill) {
                this.heroInfo[id].Skills[i].Level += 1
                Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
                return
            }
        }
        this.heroInfo[id].Skills.push({
            Id: skill,
            Level: 2
        })
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setAdvLv(id: number) {
        this.heroInfo[id].Adv = true
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }
    public addAdvanceLv(id: number) {
        if (!this.heroInfo[id].TemplateId) {
            this.heroInfo[id].TemplateId = this.heroInfo[id].id * 10 + 1
        }
        this.heroInfo[id].TemplateId++
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public setFashion(id: number, fashion: number) {
        this.heroInfo[id].id = fashion
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }
}