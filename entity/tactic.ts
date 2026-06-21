import { DB } from 'sqlite'

interface TacticInfo {
    tacticName: string
    heroInfo: number[]
    modeId: number
    strategyId: number
    formationId: number
    type: number
}

export class Tactic {
    private db: DB

    constructor(db: DB) {
        this.db = db
    }

    public setTacticInfo(tactic: Array<TacticInfo>) {
        for (let i = 0; i < tactic.length; i++) {
            const heros = tactic[i].heroInfo ? JSON.stringify(tactic[i].heroInfo) : '[]'
            this.db.query(
                `UPDATE fleets SET name=?, heros=?, mode=?, strategy=?, formation=?, type=? WHERE id=?`,
                [
                    tactic[i].tacticName,
                    heros,
                    tactic[i].modeId,
                    tactic[i].strategyId,
                    tactic[i].formationId,
                    tactic[i].type,
                    i + 1
                ]
            )
        }
    }

    public setStrategy(fleet: number, strategy: number, type: number) {
        this.db.query(`UPDATE fleets SET strategy=?, type=? WHERE id=?`, [strategy, type, fleet])
    }

    public getTacticInfo(): Array<TacticInfo> {
        const result = this.db.query<[number, string, string, number, number, number, number]>(
            'SELECT id, name, heros, mode, strategy, formation, type FROM fleets ORDER BY id'
        )
        return result.map((v) => ({
            tacticName: v[1],
            heroInfo: JSON.parse(v[2]),
            modeId: v[3],
            strategyId: v[4],
            formationId: v[5],
            type: v[6]
        }))
    }
}
