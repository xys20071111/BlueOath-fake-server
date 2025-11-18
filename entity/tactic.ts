interface TacticInfo {
    tacticName: string
    heroInfo: number[]
    modeId: number
    strategyId: number
    formationId: number
    type: number
}

export class Tactic {
    private uname: string
    private tactics: Array<TacticInfo>
    
    constructor(uname: string) {
        this.tactics = JSON.parse(Deno.readTextFileSync(`./playerData/${uname}/FleetInfo.json`))
        this.uname = uname
    }

    public reload() {
        this.tactics = JSON.parse(Deno.readTextFileSync(`./playerData/${this.uname}/FleetInfo.json`))
    }
    
    public setTacticInfo(tactic: Array<TacticInfo>) {
        for (let i = 0; i < tactic.length; i++) {
            if (!tactic[i].heroInfo) {
                tactic[i].heroInfo = []
            }
        }
        this.tactics = tactic
        Deno.writeTextFile(`./playerData/${this.uname}/FleetInfo.json`, JSON.stringify(this.tactics, null, 4))
    }

    public setStrategy(fleet: number, strategy: number, type: number) {
        this.tactics[fleet - 1].strategyId = strategy
        Deno.writeTextFile(`./playerData/${this.uname}/FleetInfo.json`, JSON.stringify(this.tactics, null, 4))
    }

    public getTacticInfo() {
        return this.tactics
    }
}