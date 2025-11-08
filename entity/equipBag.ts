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

interface EquipInfo {
    TemplateId: number
    EnhanceLv: number
    Star: number
    HeroId: number
    EnhanceExp: number
    PSkillList: Array<{ PSkillId: number; PSkillLv: number }>
    RiseCommonEquips: Array<{ TemplateId: number; Num: number }>
}

export class EquipBag {
    private equipInfo: Array<EquipInfo>
    private uname: string

    constructor(uname: string) {
        this.equipInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${uname}/equipBag.json`))
        this.uname = uname
    }

    public reload() {
        this.equipInfo = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/equipBag.json`))
    }

    public getEquipInfo() {
        const equipBag: Array<EquipBagItem> = []
        this.equipInfo.forEach((v, k) => {
            equipBag.push({
                EquipId: k + 1,
                ...v
            })
        })
        return equipBag
    }

    public setHero(hero: number, equip: number) {
        if (equip > 0) {
            this.equipInfo[equip - 1].HeroId = hero
            Deno.writeTextFile(`./playerData/${this.uname}/equipBag.json`, JSON.stringify(this.equipInfo, null, 4))
        }
    }

    public enhance(id: number) {
        const targetId = id - 1
        this.equipInfo[targetId].EnhanceLv++
        Deno.writeTextFile(`./playerData/${this.uname}/equipBag.json`, JSON.stringify(this.equipInfo, null, 4))
        return this.equipInfo[targetId].EnhanceLv
    }

    public riseStar(id: number) {
        const targetId = id - 1
        this.equipInfo[targetId].Star++
        Deno.writeTextFile(`./playerData/${this.uname}/equipBag.json`, JSON.stringify(this.equipInfo, null, 4))
        return this.equipInfo[targetId].Star
    }

    public addEquip(ids: Array<number>) {
        const result = []
        for (const id of ids) {
            this.equipInfo.push({
                TemplateId: id,
                EnhanceLv: 1,
                Star: 1,
                EnhanceExp: 0,
                PSkillList: [],
                RiseCommonEquips: [],
                HeroId: 0
            })
            result.push({
                tid: id,
                id: this.equipInfo.length
            })
        }
        Deno.writeTextFile(`./playerData/${this.uname}/equipBag.json`, JSON.stringify(this.equipInfo, null, 4))
        return result
    }
}