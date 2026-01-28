import { THeroAttr } from '../../compiled-protobuf/battleplayer.ts'

export class Attribute {
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
