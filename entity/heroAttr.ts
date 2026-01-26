import { THeroAttr } from '../compiled-protobuf/battleplayer.ts'
import { ATTRIBUTR } from '../constants/gameConfigAttribute.ts'
import { SHIP_LEVEL_UP } from '../constants/gameConfigShipLevelUp.ts'
import { getShipMain, shipMain, shipRemouldEffect } from './gameConfig.ts'
import { HeroInfo } from './heroBag.ts'

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
                AttrValue: item[1],
            })
        }
        return result
    }
}

export class HeroBasicArrt extends Attribute {
    constructor(ship: HeroInfo) {
        super()
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

        for (const intensify of ship.Intensify) {
            this.setAttr(intensify.attrType, intensify.intensifyLvl)
        }

        const allRemouldAttr = getFinalRemouldAttr(ship.ArrRemouldEffect)
        for (const item of allRemouldAttr) {
            this.setAttr(item[0], item[1])
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
