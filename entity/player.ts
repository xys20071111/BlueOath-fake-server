import { Building } from './building.ts'
import { HeroBag } from './heroBag.ts'
import { EquipBag } from './equipBag.ts'
import { Illustrate } from './illustrate.ts'
import { Tactic } from './tactic.ts'
import { InteractionItemEntity } from './interactionItem.ts'

export enum ClientType {
    CN,
    JP
}

export interface UserInfo {
    Uid: number
    Uname: string
    Level: number
    Class: number
    ServerId: number
    SecretaryId: number
    HeadShow: number
    Exp: number
    Gold: number
    Diamond: number
    Gas: number
    Supply: number
    MainGun: number
    Torpedo: number
    Plane: number
    Other: number
    Retire: number
    Bath: number
    Strategy: number
    Medal: number
    CopyTrainPoint: number
    Tower: number
    FashionPoint: number
    Lucky: number
    GuildContri: number
    TeacherMedal: number
    TeacherPrestige: number
    BattlePassExp: number
    BattlePassGold: number
    PvePt: number
    Head?: number
}

export class Player {
    private uname: string
    private userInfo: UserInfo
    private heroInfo: HeroBag
    private tactic: Tactic
    private equipBagInfo: EquipBag
    private illustrateInfo: Illustrate
    private buildingInfo: Building
    private interactionItem: InteractionItemEntity
    private clientType: ClientType
    constructor(uname: string, type: ClientType) {
        this.uname = uname
        this.clientType = type
        this.userInfo = JSON.parse(
            Deno.readTextFileSync(`./playerData/${this.uname}/UserInfo.json`)
        )
        this.heroInfo = new HeroBag(uname)
        this.tactic = new Tactic(uname)
        this.equipBagInfo = new EquipBag(uname)
        this.illustrateInfo = new Illustrate(uname)
        this.buildingInfo = new Building(uname)
        this.interactionItem = new InteractionItemEntity(uname)

        const secretary = this.heroInfo.getHeroBasicInfoById(
            this.userInfo.SecretaryId
        )
        this.userInfo.HeadShow = secretary.isMarried ? 1 : 0
        this.userInfo.Head = secretary.id
    }

    public refreshUserInfo() {
        this.userInfo = JSON.parse(
            Deno.readTextFileSync(`./playerData/${this.uname}/UserInfo.json`)
        )
        this.heroInfo.reload()
        this.tactic.reload()
        this.buildingInfo.reload()
        this.equipBagInfo.reload()
        this.illustrateInfo.reload()

        const secretary = this.heroInfo.getHeroBasicInfoById(
            this.userInfo.SecretaryId
        )
        this.userInfo.HeadShow = secretary.isMarried ? 1 : 0
        this.userInfo.Head = secretary.id
    }

    public getHeroInfo() {
        return this.heroInfo
    }

    public getUname(): string {
        return this.uname
    }

    public getClientType() {
        return this.clientType
    }

    public getTactic(): Tactic {
        return this.tactic
    }

    public getUserInfo(): UserInfo {
        return this.userInfo
    }

    public getUserBuilding() {
        return this.buildingInfo
    }

    public getIllustrate() {
        return this.illustrateInfo
    }

    public getInteractionItem() {
        return this.interactionItem
    }

    public setSecretary(id: number) {
        const hero = this.heroInfo.getHeroBasicInfoById(id)
        this.userInfo.SecretaryId = id
        this.userInfo.HeadShow = hero.isMarried ? 1 : 0
        Deno.writeTextFile(
            `./playerData/${this.uname}/UserInfo.json`,
            JSON.stringify(this.userInfo, null, 4)
        )
    }

    public getEquipBag() {
        return this.equipBagInfo
    }
}
