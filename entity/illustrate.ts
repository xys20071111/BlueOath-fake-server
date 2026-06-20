import { DB } from 'sqlite'

interface IllustrateListItem {
    IllustrateId: number
    GetTime: number
    LikeTime: number
    NewHero: boolean
    BehaviourList: number[]
    MarryCount: number
}

interface IllustrateInfo {
    IllustrateList: IllustrateListItem[]
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
    private db: DB

    constructor(db: DB) {
        this.db = db
    }

    public getIllustrateInfo(): IllustrateInfo {
        let vowHeroList: number[] = []
        let vowCount = 0
        const vowRows = this.db.query<[string, number]>('SELECT hero_list, count FROM vow_info')
        if (vowRows.length > 0) {
            vowHeroList = JSON.parse(vowRows[0][0])
            vowCount = vowRows[0][1]
        }

        return {
            IllustrateList: [],
            VowCoolTime: 0,
            VowCoolHero: 0,
            VowCount: vowCount,
            VowHeroList: vowHeroList,
            SkipVcr: [],
            UseInfo: [],
            HeroMemoryList: [],
            IllustrateEquipList: []
        }
    }

    public setHeroIllustrate(
        _illustrateId: number,
        _behaviourIds: Array<number>
    ) {
    }

    public addHeroIllustrate(_id: number) {
    }

    public setVowHeroList(list: Array<number>) {
        const count = list.length
        const vowRows = this.db.query<[string, number]>('SELECT hero_list, count FROM vow_info')
        if (vowRows.length > 0) {
            this.db.query(
                'UPDATE vow_info SET hero_list=?, count=?',
                [JSON.stringify(list), count]
            )
        } else {
            this.db.query(
                'INSERT INTO vow_info (hero_list, count) VALUES (?, ?)',
                [JSON.stringify(list), count]
            )
        }
    }
}
