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

export class Illustrate {
    private uname: string
    private illustrateInfo: IllustrateInfo

    constructor(uname: string) {
        this.uname = uname
        this.illustrateInfo = JSON.parse(
            Deno.readTextFileSync(`./playerData/${uname}/IllustrateInfo.json`)
        )
    }

    public reload() {
        this.illustrateInfo = JSON.parse(
            Deno.readTextFileSync(
                `./playerData/${this.uname}/IllustrateInfo.json`
            )
        )
    }

    public getIllustrateInfo(): IllustrateInfo {
        return this.illustrateInfo
    }

    public setHeroIllustrate(
        illustrateId: number,
        behaviourIds: Array<number>
    ) {
        for (let i = 0; i < this.illustrateInfo.IllustrateList.length; i++) {
            if (
                this.illustrateInfo.IllustrateList[i].IllustrateId ===
                    illustrateId
            ) {
                behaviourIds.forEach((v) => {
                    this.illustrateInfo.IllustrateList[i].BehaviourList.push(v)
                })
                this.illustrateInfo.IllustrateList[i].NewHero = false
                Deno.writeTextFile(
                    `./playerData/${this.uname}/IllustrateInfo.json`,
                    JSON.stringify(this.illustrateInfo, null, 4)
                )
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
        Deno.writeTextFile(
            `./playerData/${this.uname}/IllustrateInfo.json`,
            JSON.stringify(this.illustrateInfo, null, 4)
        )
    }

    public addHeroIllustrate(id: number) {
        this.illustrateInfo.IllustrateList.push({
            IllustrateId: id,
            GetTime: Math.round(Date.now() / 1000),
            BehaviourList: [],
            NewHero: true,
            MarryCount: 0,
            LikeTime: 0
        })
        Deno.writeTextFile(
            `./playerData/${this.uname}/IllustrateInfo.json`,
            JSON.stringify(this.illustrateInfo, null, 4)
        )
    }

    public setVowHeroList(list: Array<number>) {
        this.illustrateInfo.VowHeroList = list
        this.illustrateInfo.VowCount = list.length
        Deno.writeTextFile(
            `./playerData/${this.uname}/IllustrateInfo.json`,
            JSON.stringify(this.illustrateInfo, null, 4)
        )
    }
}
