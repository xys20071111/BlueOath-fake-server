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

interface Tactic {
    tacticName: string
    heroInfo: number[]
    modeId: number
    strategyId: number
    formationId: number
    type: number
}

interface EquipInfo {
    EquidId: number
    templateId: number
    EnhanceLv: number
    Star: number
    HeroId: number
    EnhanceExp: number
    PSkillList: Array<{ PSkillId: number; PSkillLv: number }>
    RiseCommonEquips: Array<{ TemplateId: number; Num: number }>
}

interface PlotInfo {
    BaseId: number
    FirstPassTime: number
}

interface IllustrateInfo {
    IllustrateList: {
        IllustrateId: number
        GetTime: number
        LikeTime: number
        NewHero: boolean
        BehaviourList: number[]
        MarryCount: number
    }[]
    VowCoolTime: number
    VowCoolHero: number
    VowCount: number
    VowHeroList: number[]
    SkipVcr: {
        ShipInfoId: number
        StartVcr: boolean
        EndVcr: boolean
    }[]
    UseInfo: {
        ItemTid: number
        ItemNum: number
    }[]
    HeroMemoryList: {
        HeroId: number
        PlotId: number
    }[]
    IllustrateEquipList: {
        EquipTemplateId: number
        GetEquipTime: number
        NewEquip: boolean
    }[]
}

interface BuildingTactic {
    BuildingId: number
    Name: string
    HeroList: number[]
    Index: number
}

interface BuildingInfo {
    Id: number
    Tid: number
    Level: number
    HeroList: number[]
    Productivity?: number
    ProduceSpeed?: number
    ProductCount?: number
    Status?: number
    LastUpdateTime?: number
    RecipeId?: number
    ItemCount?: number
    LastMoodUpdateTime?: number
    LastBuildUpdateTime?: number
    HeroEffectTimeList?: {
        HeroId: number
        EffectTime: number[]
    }[]
    RecipeTime?: number
    FloatCount?: number
    TacticList?: BuildingTactic[]
}

interface HeroPlotData {
    HeroId: number
    PlotId: number
    BuildingId: number
}

interface UserBuildingInfo {
    BuildingInfos: BuildingInfo[]
    LandList: {
        Index: number
        BuildingId: number
    }[]
    WorkerStrength: number
    WorkerRecover: number
    Food: number
    FoodMax: number
    Electric: number
    ElectricMax: number
    WorkerUpdateTime: number
    NormalPlotUpdateTime: number
    NormalPlotDatas: HeroPlotData[]
    SpecialPlotDatas: HeroPlotData[]
    NormalTriggeredHeroIds: number[]
    SpecialTriggeredHeroPlots: {
        HeroId: number
        PlotId: number
    }
}

enum ClientType {
    CN,
    JP
}

export class Player {
    private uname: string
    private userInfo: any
    private heroInfo: Array<BasicHeroInfo>
    private tactics: Array<Tactic>
    private equipBagInfo: Array<EquipInfo>
    private plotInfo: Array<PlotInfo>
    private illustrateInfo: IllustrateInfo
    private buildingInfo: UserBuildingInfo
    private clientType: ClientType
    constructor(uname: string, type: ClientType) {
        this.uname = uname
        this.clientType = type
        this.userInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/UserInfo.json`))
        this.heroInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/HeroBag.json`))
        this.tactics = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/FleetInfo.json`))
        this.equipBagInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/EquipBag.json`))
        this.plotInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/PlotInfo.json`))
        this.illustrateInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/IllustrateInfo.json`))
        this.buildingInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/BuildingInfo.json`))
        this.userInfo.HeadShow = this.heroInfo[this.userInfo.SecretaryId].isMarried ? 1 : 0
        this.userInfo.Head = this.heroInfo[this.userInfo.SecretaryId].id
    }

    public refreshUserInfo() {
        this.userInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/UserInfo.json`))
        this.heroInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/HeroBag.json`))
        this.tactics = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/FleetInfo.json`))
        this.equipBagInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/EquipBag.json`))
        this.plotInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/PlotInfo.json`))
        this.illustrateInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/IllustrateInfo.json`))
        this.userInfo.HeadShow = this.heroInfo[this.userInfo.SecretaryId].isMarried ? 1 : 0
    }

    public getUname(): string {
        return this.uname
    }

    public getClientType() {
        return this.clientType
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

    public getTactics(): Array<Tactic> {
        return this.tactics
    }

    public setTactics(tactic: Array<Tactic>) {
        for (let i = 0; i < tactic.length; i++) {
            if (!tactic[i].heroInfo) {
                tactic[i].heroInfo = []
            }
        }
        this.tactics = tactic
        Deno.writeTextFile(`./playerData/${this.uname}/FleetInfo.json`, JSON.stringify(this.tactics, null, 4))
    }

    public getUserInfo(): any {
        return this.userInfo
    }

    public setSecretary(id: number) {
        this.userInfo.SecretaryId = id
        this.userInfo.HeadShow = this.heroInfo[this.userInfo.SecretaryId].isMarried ? 1 : 0
        Deno.writeTextFile(`./playerData/${this.uname}/UserInfo.json`, JSON.stringify(this.userInfo, null, 4))
    }

    public setHeroLock(id: number, lock: boolean) {
        this.heroInfo[id].Locked = lock
        Deno.writeTextFile(`./playerData/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public getEquipBag() {
        return this.equipBagInfo
    }

    public getIllustrateInfo(): IllustrateInfo {
        return this.illustrateInfo
    }

    public setHeroIllustrate(illustrateId: number, behaviourIds: Array<number>) {
        for (let i = 0; i < this.illustrateInfo.IllustrateList.length; i++) {
            if (this.illustrateInfo.IllustrateList[i].IllustrateId === illustrateId) {
                behaviourIds.forEach((v) => {
                    this.illustrateInfo.IllustrateList[i].BehaviourList.push(v)
                })
                this.illustrateInfo.IllustrateList[i].NewHero = false
                Deno.writeTextFile(`./playerData/${this.uname}/IllustrateInfo.json`, JSON.stringify(this.illustrateInfo, null, 4))
                return
            }
        }
        this.illustrateInfo.IllustrateList.push({
            IllustrateId: illustrateId,
            GetTime: Math.round(Date.now() / 1000),
            BehaviourList: behaviourIds,
            NewHero: true,
            MarryCount: 0,
            LikeTime: 0
        })
        Deno.writeTextFile(`./playerData/${this.uname}/IllustrateInfo.json`, JSON.stringify(this.illustrateInfo, null, 4))
    }

    public getBuildingInfo() {
        const lastUpdateTime = Math.round(Date.now() / 1000)
        for (let i = 0; i < this.buildingInfo.BuildingInfos.length; i++) {
            this.buildingInfo.BuildingInfos[i].LastUpdateTime = lastUpdateTime
        }
        this.buildingInfo.WorkerUpdateTime = lastUpdateTime
        return this.buildingInfo
    }

    public setBuildingTactics(id: number, tactic: BuildingTactic[]) {
        for (let i = 0; i < this.buildingInfo.BuildingInfos.length; i++) {
            if (this.buildingInfo.BuildingInfos[i].Id === id) {
                this.buildingInfo.BuildingInfos[i].TacticList = tactic
                break
            }
        }
        Deno.writeTextFile(`./playerData/${this.uname}/BuildingInfo.json`, JSON.stringify(this.buildingInfo, null, 4))
    }

    public buildingUpgrade(id: number) {
        for (let i = 0; i < this.buildingInfo.BuildingInfos.length; i++) {
            if (this.buildingInfo.BuildingInfos[i].Id === id) {
                this.buildingInfo.BuildingInfos[i].Level++
                break
            }
        }
        Deno.writeTextFile(`./playerData/${this.uname}/BuildingInfo.json`, JSON.stringify(this.buildingInfo, null, 4))
    }

    public buildingSetHero(id: number, HeroIdList: number[]) {
        for (let i = 0; i < this.buildingInfo.BuildingInfos.length; i++) {
            if (this.buildingInfo.BuildingInfos[i].Id === id) {
                this.buildingInfo.BuildingInfos[i].HeroList = HeroIdList
                break
            }
        }
        Deno.writeTextFile(`./playerData/${this.uname}/BuildingInfo.json`, JSON.stringify(this.buildingInfo, null, 4))
    }

    public addBuilding(tid: number, index: number) {
        const id = this.buildingInfo.BuildingInfos.length + 1
        this.buildingInfo.BuildingInfos.push({
            Tid: tid,
            Id: id,
            Level: 1,
            HeroList: [],
            Productivity: 100,
            ProduceSpeed: 100,
            ProductCount: 100,
            Status: 1,
            LastUpdateTime: 0,
            LastMoodUpdateTime: 0,
            LastBuildUpdateTime: 0,
            HeroEffectTimeList: []
        })
        this.buildingInfo.LandList.push({
            Index: index,
            BuildingId: id
        })
        Deno.writeTextFile(`./playerData/${this.uname}/BuildingInfo.json`, JSON.stringify(this.buildingInfo, null, 4))
        return id
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