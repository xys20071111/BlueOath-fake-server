import { EventEmitter } from 'node:events'
import { Socket } from 'node:net'
import { socketPlayerMap } from './utils/socketMaps.ts'
import { GetUserList, Login } from './logic/login.ts'
import {
    GetMiniGameScore,
    GetSupply,
    GetUserInfo,
    Refresh,
    SetMiniGameScore,
    SetUserSecretary,
    UserLogin
} from './logic/user.ts'
import { ChangeWorldChannel, GetBarrageById, SendMessage } from './logic/chat.ts'
import { PlotReward, Setting } from './logic/guide.ts'
import { SavePrefs } from './logic/prefs.ts'
import { GetNotesList } from './logic/buildnotes.ts'
import { SetHerosTactic } from './logic/fleet.ts'
import {
    AddExp,
    AutoUnEquip,
    ChangeEquip,
    ChangeName,
    GetHeroInfoByHeroIdArray,
    HeroAdvance,
    HeroAdvMaxLv,
    HeroIntensify,
    HeroRemould,
    LockHero,
    Marry,
    RetireHero,
    StudySkill
} from './logic/hero.ts'
import { GetCopyInfo } from './logic/copyinfo.ts'
import { StartBase } from './logic/copy.ts'
import { Discuss, GetDiscuss, Like } from './logic/discuss.ts'
import { AddBehavior, IllustrateNew, ModiVowHeroList, VowHero } from './logic/illustrate.ts'
import { GetList /*CreateGuild*/ } from './logic/guild.ts'
import {
    AddBuilding,
    EmptyReceive,
    SaveTactic,
    SetHero,
    UpdateHeroAddition,
    UpgradeBuilding
} from './logic/building.ts'
import { GetBathroomInfo } from './logic/bathroom.ts'
import { GetShopsInfo } from './logic/shop.ts'
import { GetFriendMainData, GetRecommendList } from './logic/friend.ts'
import { CacheData } from './logic/cachedata.ts'
import { BuildShip } from './logic/gacha.ts'
import { EmptyReply } from './utils/emptyReceive.ts'
import { Equip } from './logic/fashion.ts'
import { Enhance, RiseStar } from './logic/equip.ts'
import { Apply } from './logic/strategy.ts'
import {
    SetBagItemVisible,
    SetMutexBagGroupState,
    SetPosterState
} from './logic/interactionItem.ts'

class EventBus extends EventEmitter {
    // 重写一下emit函数，检查socket是不是已经登录了
    public override emit(
        eventName: string,
        socket: Socket,
        ...args: unknown[]
    ): boolean {
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

eventBus.on('player.Login', Login)
eventBus.on('player.GetUserList', GetUserList)

eventBus.on('user.UserLogin', UserLogin)
eventBus.on('user.GetUserInfo', GetUserInfo)
eventBus.on('user.SetUserSecretary', SetUserSecretary)
eventBus.on('user.Refresh', Refresh)
eventBus.on('user.GetSupply', GetSupply)
eventBus.on('user.SetUserOrderRecord', EmptyReply('user.SetUserOrderRecord'))
eventBus.on('user.GetMiniGameScore', GetMiniGameScore)
eventBus.on('user.SetMiniGameScore', SetMiniGameScore)

eventBus.on('chat.GetBarrageById', GetBarrageById)
eventBus.on('chat.SendMessage', SendMessage)
eventBus.on('chat.ChangeWorldChannel', ChangeWorldChannel)

eventBus.on('guide.PlotReward', PlotReward)
eventBus.on('guide.Setting', Setting)

eventBus.on('prefs.SavePrefs', SavePrefs)

eventBus.on('buildnotes.GetNotesList', GetNotesList)

eventBus.on('tactic.SetHerosTactic', SetHerosTactic)

eventBus.on('hero.LockHero', LockHero)
eventBus.on('hero.GetHeroInfoByHeroIdArray', GetHeroInfoByHeroIdArray)
eventBus.on('hero.Marry', Marry)
eventBus.on('hero.ChangeName', ChangeName)
eventBus.on('hero.AddExp', AddExp)
eventBus.on('hero.RetireHero', RetireHero)
eventBus.on('hero.StudySkill', StudySkill)
eventBus.on('hero.HeroAdvMaxLv', HeroAdvMaxLv)
eventBus.on('hero.HeroAdvance', HeroAdvance)
eventBus.on('hero.ChangeEquip', ChangeEquip)
eventBus.on('hero.AutoUnEquip', AutoUnEquip)
eventBus.on('hero.AutoEquip', EmptyReply('hero.AutoEquip')) // 这个不会写
eventBus.on('hero.HeroRemould', HeroRemould)
eventBus.on('hero.HeroIntensify', HeroIntensify)

eventBus.on('copyinfo.GetCopyInfo', GetCopyInfo)

eventBus.on('copy.StartBase', StartBase)

eventBus.on('discuss.GetDiscuss', GetDiscuss)
eventBus.on('discuss.Discuss', Discuss)
eventBus.on('discuss.Like', Like)

eventBus.on('illustrate.AddBehaviour', AddBehavior)
eventBus.on('illustrate.IllustrateNew', IllustrateNew)
eventBus.on('illustrate.ModiVowHeroList', ModiVowHeroList)
eventBus.on('illustrate.VowHero', VowHero)

eventBus.on('guild.GetList', GetList)
// eventBus.on("guild.Create", CreateGuild)

eventBus.on('building.UpdateHeroAddition', UpdateHeroAddition)
eventBus.on('building.SaveTactic', SaveTactic)
eventBus.on('building.AddBuilding', AddBuilding)
eventBus.on('building.SetHero', SetHero)
eventBus.on('building.UpgradeBuilding', UpgradeBuilding)
eventBus.on(
    'building.ReceiveBuilding',
    (socket, _args, callbackHandler, token) => {
        EmptyReceive(socket, 'building.ReceiveBuilding', callbackHandler, token)
    }
)
eventBus.on('building.ReceiveAll', (socket, _args, callbackHandler, token) => {
    EmptyReceive(socket, 'building.ReceiveAll', callbackHandler, token)
})
eventBus.on(
    'building.ReceiveResource',
    (socket, _args, callbackHandler, token) => {
        EmptyReceive(socket, 'building.ReceiveResource', callbackHandler, token)
    }
)

eventBus.on('bathroom.GetBathroomInfo', GetBathroomInfo)

eventBus.on('shop.GetShopsInfo', GetShopsInfo)

eventBus.on('friend.GetFriendMainData', GetFriendMainData)
eventBus.on('friend.GetRecommendList', GetRecommendList)

eventBus.on('cachedata.CacheData', CacheData)

eventBus.on('buildship.BuildShip', BuildShip)

eventBus.on('fashion.Equip', Equip)

eventBus.on('equip.Enhance', Enhance)
eventBus.on('equip.RiseStar', RiseStar)

eventBus.on('task.TaskTrigger', EmptyReply('task.TaskTrigger'))

eventBus.on('miniGame.StartMiniGame', EmptyReply('miniGame.StartMiniGame'))

eventBus.on('strategy.Apply', Apply)

eventBus.on('interactionitem.SetMutexBagGroupState', SetMutexBagGroupState)
eventBus.on('interactionitem.SetBagItemVisible', SetBagItemVisible)
eventBus.on('interactionitem.SetPosterState', SetPosterState)
eventBus.on(
    'interactionitem.GetItemReward',
    EmptyReply('interactionitem.GetItemReward')
)

//日服特有，邀请用户去Google Play打好评
eventBus.on(
    'invitescore.SetInviteStateByType',
    EmptyReply('invitescore.SetInviteStateByType')
)
