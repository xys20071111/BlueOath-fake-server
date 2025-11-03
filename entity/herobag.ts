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
                HeroId: 0,
                TemplateId: this.heroInfo[id].TemplateId ?? this.heroInfo[id].id * 10 + 1,
                Equips: [],
                Lvl: this.heroInfo[id].Level,
                Exp: 100,
                Advance: 5,
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
                AdvLv: 0,
                EquipEffects: [],
                CombinationInfo: []
            }
    }

    public getHeroBag(): Array<HeroInfo> {
        const heros: Array<HeroInfo> = []
        this.heroInfo.forEach((v, k) => {
            const heroInfo = {
                HeroId: k,
                TemplateId: v.TemplateId ?? v.id * 10 + 1,
                Equips: [],
                Lvl: v.Level,
                Exp: 100,
                Advance: 5,
                Intensify: [],
                CreateTime: v.CreateTime ? v.CreateTime : Math.round(Date.now() / 1000),
                CurHp: 10000000000, // 最大hp
                CurGasoline: 10000000000,
                CurAmmunition: 10000000000,
                Lock: v.Locked ? true : false,
                PSkill: [],
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
                AdvLv: 0,
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

    public addShip(id: number, templateId: number) {
        // 在抽卡功能写完前不要向文件内写入
        this.heroInfo.push({
            id,
            TemplateId: templateId,
            CreateTime: Math.round(Date.now() / 1000),
            isMarried: false,
            Level: 1,
        })
        return this.heroInfo.length - 1
    }
}