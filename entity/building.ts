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

export class Building {
    private buildingInfo: UserBuildingInfo
    private uname: string
    constructor(uname: string) {
        this.uname = uname
        this.buildingInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${uname}/BuildingInfo.json`))
    }

    public reload() {
        this.buildingInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/BuildingInfo.json`))
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
}