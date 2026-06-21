import { ATTRIBUTR } from '@/constants/gameConfigAttribute.ts'
import { SHIP_LEVEL_UP } from '@/constants/gameConfigShipLevelUp.ts'
import { equip as equipConfig, shipMain, shipRemouldEffect } from '../gameConfig.ts'
import { HeroInfo } from '../heroBag.ts'
import { Player } from '../player.ts'
import { Attribute } from './basicAttr.ts'

const CATEGORY_ATTR_MAP: [number, number][] = [
    [600, 8],
    [600, 10],
    [700, 8],
    [800, 8],
    [900, 9],
    [901, 9],
    [901, 11],
    [931, 9],
    [961, 9],
]

export class HeroBasicArrt extends Attribute {
    constructor(ship: HeroInfo, player: Player) {
        super()

        const heroInfo = shipMain.getConfig(ship.TemplateId)
        const levelConfig = SHIP_LEVEL_UP[ship.Lvl]

        const attrs: Array<number> = []
        for (const item in ATTRIBUTR) {
            const cfg = ATTRIBUTR[item]
            if (cfg.girl_if_show === 1) {
                attrs.push(cfg.id)
            }
        }
        // combat-critical attrs not marked girl_if_show
        const combatAttrs = [17, 18, 19, 20, 22]
        for (const id of combatAttrs) {
            if (!attrs.includes(id)) attrs.push(id)
        }

        const attrFactor = (levelConfig?.attribute_level ?? 1) - 1
        for (const attr of attrs) {
            let temp = 0
            const attrString = ATTRIBUTR[attr].beizhu
            const levelAttrString = `${attrString}_levelup`
            if (heroInfo[attrString] != null) {
                temp = Number(heroInfo[attrString])
            }
            if (heroInfo[levelAttrString] != null) {
                temp += Math.floor(attrFactor * (Number(heroInfo[levelAttrString]) / 100))
            }
            this.setAttr(attr, temp)
        }

        for (const intensify of ship.Intensify) {
            this.setAttr(intensify.AttrType, intensify.IntensifyLvl)
        }

        const allRemouldAttr = getFinalRemouldAttr(ship.ArrRemouldEffect)
        for (const item of allRemouldAttr) {
            this.setAttr(item[0], item[1])
        }

        const equipList = ship.Equips?.[0]?.Equip ?? []
        for (const equipItem of equipList) {
            const equipId = equipItem.EquipsId
            if (!equipId) continue
            let equipRec: Record<string, any> | null = null
            try { equipRec = equipConfig.getConfig(equipId) } catch { continue }
            if (!equipRec) continue

            const equipProp: number[][] = equipRec.equip_prop ?? []
            for (const [attrId, value] of equipProp) {
                this.setAttr(Number(attrId), Number(value))
            }
            const enhanceProp: number[][] = equipRec.enhance_prop ?? []
            const enhanceLv = (equipItem as any).EnhanceLv ?? 0
            if (enhanceLv > 0) {
                for (const [attrId, perLv] of enhanceProp) {
                    this.setAttr(Number(attrId), enhanceLv * Number(perLv))
                }
            }
        }

        this.computeCategoryAttrs()

        // DEBUG: force very high hit rate to test miss issue
        this.setAttr(19, 1000)  // hit
        this.setAttr(20, 0)     // dodge
    }

    private computeCategoryAttrs() {
        for (const [categoryId, baseId] of CATEGORY_ATTR_MAP) {
            const baseValue = this.attrRecord.get(baseId) ?? 0
            if (baseValue > 0) {
                this.setAttr(categoryId, baseValue)
            }
        }
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
