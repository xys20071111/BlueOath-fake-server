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

export class InteractionItemEntity {
    private uname: string
    private interactionItem: InteractionItem
    constructor(uname: string) {
        this.uname = uname
        this.interactionItem = JSON.parse(Deno.readTextFileSync(`./playerData/${uname}/InteractionItem.json`))
    }

    public reload() {
        this.interactionItem = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/InteractionItem.json`))
    }

    public getInteractionItemInfo(): InteractionItemInfo {
        return {
            halloweenPumpkin: this.interactionItem.halloweenPumpkin,
            furniture: [],
            paperFlowerState: this.interactionItem.paperFlowerState,
            ballToyState: this.interactionItem.ballToyState,
            posterState: this.interactionItem.posterState,
            decorate: this.interactionItem.decorate
        }
    }

    public setDecorateMutexBag(typeId: number, curSelect: number) {
        this.interactionItem.decorate = [{
            typeId,
            curSelect
        }]
        Deno.writeTextFile(`./playerData/${this.uname}/InteractionItem.json`, JSON.stringify(this.interactionItem, null, 4))
    }

    public isVisible(id: number) {
        return this.interactionItem.furnitureVisible[id] ? true : false
    }

    public setVisible(id: number, state: boolean) {
        this.interactionItem.furnitureVisible[id] = state
        Deno.writeTextFile(`./playerData/${this.uname}/InteractionItem.json`, JSON.stringify(this.interactionItem, null, 4))
    }

    public setPoster(point: number, posterId: number) {
        this.interactionItem.posterState = [
            {
                point,
                posterId
            }
        ]
        Deno.writeTextFile(`./playerData/${this.uname}/InteractionItem.json`, JSON.stringify(this.interactionItem, null, 4))
    }
}