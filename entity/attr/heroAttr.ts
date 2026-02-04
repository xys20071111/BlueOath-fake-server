import { ATTRIBUTR } from '@/constants/gameConfigAttribute.ts'
import { SHIP_LEVEL_UP } from '@/constants/gameConfigShipLevelUp.ts'
import { shipMain, shipRemouldEffect } from '../gameConfig.ts'
import { HeroInfo } from '../heroBag.ts'
import { Player } from '../player.ts'
import { Attribute } from './basicAttr.ts'

export class HeroBasicArrt extends Attribute {
    constructor(ship: HeroInfo, player: Player) {
        super()
        // self:_GetHeroAttr(heroInfo.Lvl, heroInfo.TemplateId)
        const heroInfo = shipMain.getConfig(ship.TemplateId)
        const levelConfig = SHIP_LEVEL_UP[ship.Lvl]
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

        // self:_GetIntensify(heroInfo.Intensify)
        for (const intensify of ship.Intensify) {
            this.setAttr(intensify.AttrType, intensify.IntensifyLvl)
        }

        // self:_GetRemould(heroInfo.ArrRemouldEffect)
        const allRemouldAttr = getFinalRemouldAttr(ship.ArrRemouldEffect)
        for (const item of allRemouldAttr) {
            this.setAttr(item[0], item[1])
        }

        // local equip = Data.heroData:GetEquipsByType(heroInfo.HeroId, fleetType)
        // equip = self:_formatEquip(equip)
        // local isNpc = npcAssistFleetMgr:IsNpcHeroId(heroInfo.HeroId)
        // self:_GetEquipAttr(equip, isNpc, copyId)
        // 看不懂，先放在这里
        // const equip = ship.Equips[0].Equip.map((v) => {
        //     return v.EquipsId
        // })
    }
}

function getFinalRemouldAttr(effects: number[]) {
    const attrValues: Array<number[]> = []
    const mapAttrValue: Map<number, number> = new Map()
    for (const value of effects) {
        const remouldItem = shipRemouldEffect.getConfig(value)
        for (const item of remouldItem.remould_effect_type) {
            if (item[0] === 2) {
                attrValues.push(item)
            }
        }
    }
    for (const item of attrValues) {
        if (mapAttrValue.has(item[1])) {
            const oldValue = mapAttrValue.get(item[1])!
            mapAttrValue.set(item[1], oldValue + item[2])
        } else {
            mapAttrValue.set(item[1], item[2])
        }
    }
    return mapAttrValue
}
