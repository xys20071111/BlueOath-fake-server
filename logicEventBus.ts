import { EventEmitter } from "node:events";
import { Socket } from "node:net"
import { socketPlayerMap } from "./utils/socketMaps.ts";
import { GetUserList, Login } from "./logic/login.ts";
import { GetSupply, GetUserInfo, Refresh, SetUserSecretary, UserLogin } from "./logic/user.ts"
import { ChangeWorldChannel, GetBarrageById, SendMessage } from "./logic/chat.ts";
import { PlotReward, Setting } from "./logic/guide.ts";
import { SavePrefs } from "./logic/prefs.ts";
import { GetNotesList } from "./logic/buildnotes.ts";
import { SetHerosTactic } from "./logic/fleet.ts";
import { AddExp, ChangeName, GetHeroInfoByHeroIdArray, HeroAdvMaxLv, LockHero, Marry, RetireHero, StudySkill } from "./logic/hero.ts";
import { GetCopyInfo } from "./logic/copyinfo.ts";
import { StartBase } from "./logic/copy.ts";
import { GetDiscuss, Discuss, Like } from "./logic/discuss.ts";
import { AddBehavior, IllustrateNew } from "./logic/illustrate.ts";
import { GetList, /*CreateGuild*/ } from "./logic/guild.ts";
import { AddBuilding, SaveTactic, SetHero, UpdateHeroAddition, UpgradeBuilding, EmptyReceive } from "./logic/building.ts";
import { GetBathroomInfo } from "./logic/bathroom.ts";
import { GetShopsInfo } from "./logic/shop.ts";
import { GetFriendMainData, GetRecommendList } from "./logic/friend.ts";
import { CacheData } from "./logic/cachedata.ts";
import { BuildShip } from "./logic/gacha.ts";
import { EmptyReply } from "./utils/emptyReceive.ts";

class EventBus extends EventEmitter {
    // 重写一下emit函数，检查socket是不是已经登录了
    public override emit(eventName: string, socket: Socket, ...args: unknown[]): boolean {
        if (eventName === 'player.Login') {
            // player.Login除外，因为这个是负责登录的函数
            return super.emit(eventName, socket, ...args)
        } else {
            const user = socketPlayerMap.get(socket)
            if (!user) {
                socket.destroy()
                return false
            }
            return super.emit(eventName, socket, ...args)
        }
    }
}

export const eventBus = new EventBus()

eventBus.on("player.Login", Login)
eventBus.on("player.GetUserList", GetUserList)

eventBus.on("user.UserLogin", UserLogin)
eventBus.on("user.GetUserInfo", GetUserInfo)
eventBus.on("user.SetUserSecretary", SetUserSecretary)
eventBus.on("user.Refresh", Refresh)
eventBus.on("user.GetSupply", GetSupply)

eventBus.on("chat.GetBarrageById", GetBarrageById)
eventBus.on("chat.SendMessage", SendMessage)
eventBus.on("chat.ChangeWorldChannel", ChangeWorldChannel)

eventBus.on("guide.PlotReward", PlotReward)
eventBus.on("guide.Setting", Setting)

eventBus.on("prefs.SavePrefs", SavePrefs)

eventBus.on("buildnotes.GetNotesList", GetNotesList)

eventBus.on("tactic.SetHerosTactic", SetHerosTactic)

eventBus.on("hero.LockHero", LockHero)
eventBus.on("hero.GetHeroInfoByHeroIdArray", GetHeroInfoByHeroIdArray)
eventBus.on("hero.Marry", Marry)
eventBus.on("hero.ChangeName", ChangeName)
eventBus.on("hero.AddExp", AddExp)
eventBus.on("hero.RetireHero", RetireHero)
eventBus.on("hero.StudySkill", StudySkill)
eventBus.on("hero.HeroAdvMaxLv", HeroAdvMaxLv)

eventBus.on("copyinfo.GetCopyInfo", GetCopyInfo)

eventBus.on("copy.StartBase", StartBase)

eventBus.on("discuss.GetDiscuss", GetDiscuss)
eventBus.on("discuss.Discuss", Discuss)
eventBus.on("discuss.Like", Like)

eventBus.on("illustrate.AddBehaviour", AddBehavior)
eventBus.on("illustrate.IllustrateNew", IllustrateNew)

eventBus.on("guild.GetList", GetList)
// eventBus.on("guild.Create", CreateGuild)

eventBus.on("building.UpdateHeroAddition", UpdateHeroAddition)
eventBus.on("building.SaveTactic", SaveTactic)
eventBus.on("building.AddBuilding", AddBuilding)
eventBus.on("building.SetHero", SetHero)
eventBus.on("building.UpgradeBuilding", UpgradeBuilding)
eventBus.on("building.ReceiveBuilding", (socket, _args, callbackHandler, token) => {
    EmptyReceive(socket, "building.ReceiveBuilding", callbackHandler, token)
})
eventBus.on("building.ReceiveAll", (socket, _args, callbackHandler, token) => {
    EmptyReceive(socket, "building.ReceiveAll", callbackHandler, token)
})

eventBus.on("bathroom.GetBathroomInfo", GetBathroomInfo)

eventBus.on("shop.GetShopsInfo", GetShopsInfo)

eventBus.on("friend.GetFriendMainData", GetFriendMainData)
eventBus.on("friend.GetRecommendList", GetRecommendList)

eventBus.on("cachedata.CacheData", CacheData)

eventBus.on("buildship.BuildShip", BuildShip)

//日服特有
eventBus.on("invitescore.SetInviteStateByType", EmptyReply("invitescore.SetInviteStateByType"))