import { DB } from 'sqlite'

interface EquipBagItem {
    EquipId: number
    TemplateId: number
    EnhanceLv: number
    Star: number
    HeroId: number
    EnhanceExp: number
    PSkillList: Array<{ PSkillId: number; PSkillLv: number }>
    RiseCommonEquips: Array<{ TemplateId: number; Num: number }>
}

type EquipDbSelectResult = [number, number, number, number, number, number, string, string]

export class EquipBag {
    private db: DB

    constructor(db: DB) {
        this.db = db
    }

    public getEquipInfo() {
        const equipBag: Array<EquipBagItem> = []
        const result = this.db.query<EquipDbSelectResult>('SELECT * FROM equips;')
        result.forEach((v) => {
            equipBag.push({
                EquipId: v[0],
                TemplateId: v[1],
                EnhanceLv: v[2],
                EnhanceExp: v[3],
                Star: v[4],
                HeroId: v[5],
                PSkillList: JSON.parse(v[6]),
                RiseCommonEquips: JSON.parse(v[7])
            })
        })
        return equipBag
    }

    public setHero(hero: number, equip: number) {
            this.db.query("UPDATE equips SET hero_id=? WHERE id=?;", [hero, equip])
    }

    public enhance(id: number) {
        const currentLv = this.db.query<[number]>("SELECT enhance_lv FROM equips WHERE id=?", [id])[0][0]
        this.db.query<[number]>("UPDATE equips SET enhance_lv=? WHERE id=?", [currentLv + 1 ,id])
        return currentLv + 1
    }

    public riseStar(id: number) {
        const currentLv = this.db.query<[number]>("SELECT star FROM equips WHERE id=?", [id])[0][0]
        this.db.query<[number]>("UPDATE equips SET star=? WHERE id=?", [currentLv + 1 ,id])
        return currentLv + 1
    }

    public addEquip(ids: Array<number>) {
        const result = []
        for (const id of ids) {
            this.db.query("INSERT INTO equips(template_id) VALUES (?)", [id])
            result.push({
                tid: id,
                id: this.db.query<[number]>('SELECT id FROM equips ORDER BY id DESC LIMIT 1;')[0][0],
            })
        }
        return result
    }
}
