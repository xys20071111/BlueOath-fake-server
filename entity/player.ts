import { Building } from './building.ts'
import { HeroBag } from './heroBag.ts'
import { EquipBag } from './equipBag.ts'
import { Illustrate } from './illustrate.ts'
import { Tactic } from './tactic.ts'
import { InteractionItemEntity } from './interactionItem.ts'
import { DB } from 'sqlite'
import { userInfoMainDb } from '@/server/db.ts'

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

function createData(): UserInfo {
    return {
        'Uid': 10001,
        'Uname': '示例用户',
        'Level': 100,
        'Class': 1,
        'ServerId': 1,
        'SecretaryId': 2,
        'HeadShow': 0,
        'Exp': 100,
        'Gold': 500000,
        'Diamond': 500000,
        'Gas': 5000,
        'Supply': 5000,
        'MainGun': 5000,
        'Torpedo': 5000,
        'Plane': 5000,
        'Other': 5000,
        'Retire': 5000,
        'Bath': 5000,
        'Strategy': 101,
        'Medal': 5000,
        'CopyTrainPoint': 5000,
        'Tower': 5000,
        'FashionPoint': 5000,
        'Lucky': 5000,
        'GuildContri': 5000,
        'TeacherMedal': 5000,
        'TeacherPrestige': 5000,
        'BattlePassExp': 5000,
        'BattlePassGold': 5000,
        'PvePt': 5
    }
}

export class Player {
    private uname: string
    private id: number
    private heroInfo: HeroBag
    private tactic: Tactic
    private equipBagInfo: EquipBag
    private illustrateInfo: Illustrate
    private buildingInfo: Building
    private interactionItem: InteractionItemEntity
    private clientType: ClientType
    constructor(userInfo: {
        id: number
        uname: string
        secretaryId: number,
    }, type: ClientType) {
        this.uname = userInfo.uname
        this.id = userInfo.id
        this.clientType = type

        const playerDb = new DB(`./playerData/${userInfo.uname}.db`)
        this.heroInfo = new HeroBag(playerDb)
        this.tactic = new Tactic(playerDb)
        this.equipBagInfo = new EquipBag(playerDb)
        this.illustrateInfo = new Illustrate(playerDb)
        this.buildingInfo = new Building(playerDb)
        this.interactionItem = new InteractionItemEntity(playerDb)
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
        const secretary = this.heroInfo.getHeroBasicInfoById(
            userInfoMainDb.query<[number]>("SELECT secretary_id FROM user_info WHERE uname=?", [this.uname])[0][0]
        )
        const headShow = secretary.MarryTime === 0 ? 0 : 1
        const head = secretary.fashionId

        const data = createData()
        data.Uid = this.id
        data.Uname = this.uname
        data.SecretaryId = secretary.id
        data.HeadShow = headShow
        data.Head = head
        return data
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
        userInfoMainDb.query("UPDATE user_info SET secretary_id=? WHERE uname=?", [id, this.uname])
    }

    public getEquipBag() {
        return this.equipBagInfo
    }
}
