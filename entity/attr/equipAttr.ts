import { equip } from '../gameConfig.ts'
import { Player } from '../player.ts'
import { Attribute } from './basicAttr.ts'

export class EquipAttr extends Attribute {
    constructor(
        equipIds: Array<number>,
        isNpc: boolean,
        copyId: number,
        player: Player
    ) {
        super()
        const playerEquipBag = player.getEquipBag().getEquipInfo()
        for (const equipId of equipIds) {
            const equip = playerEquipBag[equipId]
            const prop = this.getEquipProperties(equipId, copyId, player)
        }
    }

    private getEquipProperties(id: number, copyId: number, player: Player) {
        const playerEquipBag = player.getEquipBag().getEquipInfo()
        const equipItem = playerEquipBag[id]
        const equipConfig = equip.getConfig(equipItem.TemplateId)
        const enhanceProps = equipConfig.enhance_prop.map((v) => {
            return {
                value: v[1],
                calculated: false
            }
        })
    }
}
