import { THeroAttr } from '../compiled-protobuf/battleplayer.ts'
import { ATTRIBUTR } from '../constants/gameConfigAttribute.ts'
import { SHIP_LEVEL_UP } from '../constants/gameConfigShipLevelUp.ts'
import { getShipMain } from './gameConfigShipMain.ts'

class Attribute {
    protected attrRecord: Map<number, number> = new Map()
    protected setAttr(id: number, value: number) {
        if (this.attrRecord.has(id)) {
            const oldValue = this.attrRecord.get(id)!
            this.attrRecord.set(id, value + oldValue)
        } else {
            this.attrRecord.set(id, value)
        }
    }

    public getAttr(): THeroAttr[] {
        const result: THeroAttr[] = []
        for (const item of this.attrRecord) {
            result.push({
                AttrId: item[0],
                AttrValue: item[1]
            })
        }
        return result
    }
}

export class HeroBasicArrt extends Attribute {
    constructor(level: number, heroTemplateId: number) {
        super()
        /*
        Basic Attr
        local tabHeroInfo = configManager.GetDataById("config_ship_main", self.heroTId)
        local attrTbl = Logic.attrLogic:GetAttrTableShow()
        local lvconfig = configManager.GetDataById("config_ship_levelup", self.heroLvl)
        local factor = lvconfig and lvconfig.attribute_level - 1 or 0
        for k, v in pairs(attrTbl) do
          local attrString = Logic.attrLogic:GetAttrStringById(v)
          local temp = 0
          if tabHeroInfo[attrString] ~= nil then
            temp = tabHeroInfo[attrString]
          end
          local lvlAttrString = attrString .. "_levelup"
          if tabHeroInfo[lvlAttrString] ~= nil then
            temp = temp + math.floor(factor * (tabHeroInfo[lvlAttrString] / 100))
          end
          self:AddAttr(self.attrDic, v, temp)
        end
        */
        const heroInfo = getShipMain(heroTemplateId)
        const levelConfig = SHIP_LEVEL_UP[level]
        const attrs: Array<number> = []
        for (const item in ATTRIBUTR) {
            if (ATTRIBUTR[item].girl_if_show === 1) {
                attrs.push(ATTRIBUTR[item].id)
            }
        }

        const attrFactor = levelConfig?.attribute_level - 1
        for (const attr of attrs) {
            let temp = 0
            const attrString = ATTRIBUTR[attr].beizhu
            const levelAttrString = `${attrString}_levelup`
            if (heroInfo[attrString]) {
                temp = heroInfo[attrString]
            }
            if (heroInfo[levelAttrString]) {
                temp = temp +
                    Math.floor(attrFactor * (heroInfo[levelAttrString] / 100))
            }
            this.setAttr(attr, temp)
        }
    }
}
