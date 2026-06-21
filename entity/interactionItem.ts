import { DB } from 'sqlite'

interface InteractionItem {
    halloweenPumpkin?: number[]
    furnitureVisible: Record<number, boolean>
    paperFlowerState?: { id: number; state: number }[]
    ballToyState?: { ballId: number; ToyId: number }[]
    posterState?: { point: number; posterId: number }[]
    decorate?: { typeId: number; curSelect: number }[]
}

interface InteractionItemInfo {
    halloweenPumpkin?: number[]
    furniture: number[]
    paperFlowerState?: { id: number; state: number }[]
    ballToyState?: { ballId: number; ToyId: number }[]
    posterState?: { point: number; posterId: number }[]
    decorate?: { typeId: number; curSelect: number }[]
}

type InteractionItemRow = [string, string, string]

export class InteractionItemEntity {
    private db: DB

    constructor(db: DB) {
        this.db = db
    }

    private ensureRow(): InteractionItemRow {
        const rows = this.db.query<InteractionItemRow>(
            'SELECT furniture_visible, poster_state, decorate FROM interaction_items'
        )
        if (rows.length === 0) {
            this.db.query('INSERT INTO interaction_items DEFAULT VALUES')
            return ['{}', '[]', '[]']
        }
        return rows[0]
    }

    public getInteractionItemInfo(): InteractionItemInfo {
        const [furnitureVisibleStr, posterStateStr, decorateStr] = this.ensureRow()
        return {
            halloweenPumpkin: undefined,
            furniture: [],
            paperFlowerState: undefined,
            ballToyState: undefined,
            posterState: JSON.parse(posterStateStr),
            decorate: JSON.parse(decorateStr)
        }
    }

    public setDecorateMutexBag(typeId: number, curSelect: number) {
        this.db.query(
            'UPDATE interaction_items SET decorate=?',
            [JSON.stringify([{ typeId, curSelect }])]
        )
    }

    public isVisible(id: number) {
        const [furnitureVisibleStr] = this.ensureRow()
        const furnitureVisible: Record<number, boolean> = JSON.parse(furnitureVisibleStr)
        return furnitureVisible[id] ?? false
    }

    public setVisible(id: number, state: boolean) {
        const [furnitureVisibleStr] = this.ensureRow()
        const furnitureVisible: Record<number, boolean> = JSON.parse(furnitureVisibleStr)
        furnitureVisible[id] = state
        this.db.query(
            'UPDATE interaction_items SET furniture_visible=?',
            [JSON.stringify(furnitureVisible)]
        )
    }

    public setPoster(point: number, posterId: number) {
        const [, posterStateStr] = this.ensureRow()
        const posterState: { point: number; posterId: number }[] = JSON.parse(posterStateStr)
        let found = false
        for (const item of posterState) {
            if (item.point === point) {
                item.posterId = posterId
                found = true
                break
            }
        }
        if (!found) {
            posterState.push({ point, posterId })
        }
        this.db.query(
            'UPDATE interaction_items SET poster_state=?',
            [JSON.stringify(posterState)]
        )
    }
}
