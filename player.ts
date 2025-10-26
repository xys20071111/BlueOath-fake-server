import { Socket } from "node:net";

interface HeroInfo {
    HeroId: number;
    TemplateId: number;
    Equips: any[];
    Lvl: number;
    Exp: number;
    Advance: number;
    Intensify: any[];
    CreateTime: number;
    CurHp: number;
    CurGasoline: number;
    CurAmmunition: number;
    Lock: boolean;
    PSkill: any[];
    Status: string;
    Name?: string;
    ChangeNameTime: number;
    Affection: number;
    Mood: number;
    MarryTime: number;
    UpdateTime: number;
    MarryType: number;
    Fashioning: number;
    ArrRemouldEffect: number[];
    RemouldLV: number;
    AdvLv: number;
    EquipEffects: any[];
    CombinationInfo: any[];
}

interface BasicHeroInfo {
    id: number
    TemplateId?: number
    isMarried: boolean
    Level: number
    Name?: string
    Locked?: boolean
}

interface Tactic {
    tacticName: string
    heroInfo: number[]
    modeId: number
    strategyId: number
    formationId: number
    type: number
}

interface EquipInfo {
    EquidId: number
    templateId: number
    EnhanceLv: number
    Star: number
    HeroId: number
    EnhanceExp: number
    PSkillList: Array<{ PSkillId: number; PSkillLv: number }>
    RiseCommonEquips: Array<{ TemplateId: number; Num: number }>
}

export class Player {
    private socket: Socket
    private uname: string
    private userInfo: any
    private heroInfo: Array<BasicHeroInfo>
    private tactics: Array<Tactic>
    private equipBagInfo: Array<EquipInfo>
    constructor(socket: Socket, uname: string) {
        this.socket = socket,
            this.uname = uname
        this.userInfo = JSON.parse(Deno.readTextFileSync(`./data/${this.uname}/UserInfo.json`))
        this.heroInfo = JSON.parse(Deno.readTextFileSync(`./data/${this.uname}/HeroBag.json`))
        this.tactics = JSON.parse(Deno.readTextFileSync(`./data/${this.uname}/FleetInfo.json`))
        this.equipBagInfo = JSON.parse(Deno.readTextFileSync(`./data/${this.uname}/EquipBag.json`))
        this.userInfo.HeadShow = this.heroInfo[this.userInfo.SecretaryId].isMarried ? 1 : 0
    }

    public getSocket(): Socket {
        return this.socket
    }

    public getUname(): string {
        return this.uname
    }

    public getHeroBag(): Array<HeroInfo> {
        const heros: Array<HeroInfo> = []
        this.heroInfo.forEach((v, k) => {
            heros.push({
                HeroId: k,
                TemplateId: v.TemplateId ?? v.id * 10 + 1,
                Equips: [],
                Lvl: v.Level,
                Exp: 100,
                Advance: 10,
                Intensify: [],
                CreateTime: Math.round(Date.now() / 1000),
                CurHp: 10000000000, // 最大hp
                CurGasoline: 10000000000,
                CurAmmunition: 10000000000,
                Lock: v.Locked ? true : false,
                PSkill: [],
                Status: "",
                Name: v.Name,
                ChangeNameTime: 0,
                Affection: 2000000, // 最大好感值
                Mood: 1500000, // 最大情绪值,
                MarryTime: v.isMarried ? Math.round(Date.now() / 1000) : 0,
                UpdateTime: 0,
                MarryType: 1,
                Fashioning: v.id,
                ArrRemouldEffect: [],
                RemouldLV: 0,
                AdvLv: 0,
                EquipEffects: [],
                CombinationInfo: []
            })
        })
        return heros
    }

    public getTactics(): Array<Tactic> {
        return this.tactics
    }

    public setTactics(tactic: Array<Tactic>) {
        for (let i = 0; i < tactic.length; i++) {
            if (!tactic[i].heroInfo) {
                tactic[i].heroInfo = []
            }
        }
        this.tactics = tactic
        Deno.writeTextFile(`./data/${this.uname}/FleetInfo.json`, JSON.stringify(this.tactics, null, 4))
    }

    public getUserInfo(): any {
        return this.userInfo
    }

    public setSecretary(id: number) {
        this.userInfo.SecretaryId = id
        this.userInfo.HeadShow = this.heroInfo[this.userInfo.SecretaryId].isMarried ? 1 : 0
        Deno.writeTextFile(`./data/${this.uname}/UserInfo.json`, JSON.stringify(this.userInfo, null, 4))
    }

    public setHeroLock(id: number, lock: boolean) {
        this.heroInfo[id].Locked = lock
        Deno.writeTextFile(`./data/${this.uname}/HeroBag.json`, JSON.stringify(this.heroInfo, null, 4))
    }

    public getEquipBag() {
        return this.equipBagInfo
    }
}