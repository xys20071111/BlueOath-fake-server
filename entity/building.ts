import { DB } from 'sqlite'

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
    LastUpdateTime: number
    MaxWorkerStrength: number
}

function createData(): Partial<UserBuildingInfo> {
    return {
        'WorkerStrength': 1000000,
        'WorkerRecover': 100,
        'MaxWorkerStrength': 10000000,
        'SpecialPlotDatas': [],
        'NormalPlotDatas': [],
        'Food': 0,
        'FoodMax': 1000,
        'Electric': 0,
        'ElectricMax': 1000
    }
}

export class Building {
    private db: DB

    constructor(db: DB) {
        this.db = db
        this.db.query(`CREATE TABLE IF NOT EXISTS buildings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tid INTEGER NOT NULL,
            level INTEGER NOT NULL DEFAULT 1,
            hero_list TEXT NOT NULL DEFAULT '[]',
            status INTEGER NOT NULL DEFAULT 1,
            tactic TEXT NOT NULL DEFAULT '[]'
        )`)
        this.db.query(`CREATE TABLE IF NOT EXISTS land_list (
            building INTEGER NOT NULL,
            [index] INTEGER PRIMARY KEY NOT NULL
        )`)
    }

    public getBuildingInfo(): UserBuildingInfo {
        const lastUpdateTime = Math.round(Date.now() / 1000)
        const buildings = this.db.query<[number, number, number, string, number, string]>(
            'SELECT * FROM buildings'
        ).map(([id, tid, level, heroListStr, status, tacticStr]) => ({
            Id: id,
            Tid: tid,
            Level: level,
            HeroList: JSON.parse(heroListStr) as number[],
            Status: status,
            TacticList: JSON.parse(tacticStr) as BuildingTactic[],
            Productivity: 100,
            ProduceSpeed: 100,
            ProductCount: 100,
            HeroEffectTimeList: [],
            LastMoodUpdateTime: 0,
            LastBuildUpdateTime: 0,
            LastUpdateTime: lastUpdateTime
        }))
        const landList = this.db.query<[number, number]>(
            'SELECT * FROM land_list'
        ).map(([building, index]) => ({
            BuildingId: building,
            Index: index
        }))
        const template = createData()
        return {
            BuildingInfos: buildings,
            LandList: landList,
            ...template,
            WorkerUpdateTime: lastUpdateTime,
            NormalPlotUpdateTime: lastUpdateTime,
            NormalTriggeredHeroIds: [],
            SpecialTriggeredHeroPlots: { HeroId: 0, PlotId: 0 },
            LastUpdateTime: 0
        } as UserBuildingInfo
    }

    public setBuildingTactics(id: number, tactic: BuildingTactic[]) {
        this.db.query(
            'UPDATE buildings SET tactic=? WHERE id=?',
            [JSON.stringify(tactic), id]
        )
    }

    public buildingUpgrade(id: number) {
        this.db.query(
            'UPDATE buildings SET level = level + 1 WHERE id=?',
            [id]
        )
    }

    public buildingSetHero(id: number, HeroIdList: number[]) {
        const heroList = HeroIdList ?? []
        this.db.query(
            'UPDATE buildings SET hero_list=? WHERE id=?',
            [JSON.stringify(heroList), id]
        )
        if (heroList.length > 0) {
            const otherBuildings = this.db.query<[number, string]>(
                'SELECT id, hero_list FROM buildings WHERE id != ?',
                [id]
            )
            for (const [otherId, heroListStr] of otherBuildings) {
                const currentHeroList: number[] = JSON.parse(heroListStr)
                let changed = false
                for (const heroId of heroList) {
                    const idx = currentHeroList.indexOf(heroId)
                    if (idx !== -1) {
                        currentHeroList.splice(idx, 1)
                        changed = true
                    }
                }
                if (changed) {
                    this.db.query(
                        'UPDATE buildings SET hero_list=? WHERE id=?',
                        [JSON.stringify(currentHeroList), otherId]
                    )
                }
            }
        }
    }

    public addBuilding(tid: number, index: number): number {
        this.db.query(
            'INSERT INTO buildings (tid) VALUES (?)',
            [tid]
        )
        const id = this.db.query<[number]>(
            'SELECT id FROM buildings ORDER BY id DESC LIMIT 1'
        )[0][0]
        this.db.query(
            'INSERT INTO land_list (building, [index]) VALUES (?, ?)',
            [id, index]
        )
        return id
    }
}
