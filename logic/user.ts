import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { ClientType, Player } from "../entity/player.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";
import { generateChatMsg, WorldChatMessage } from "./chat.ts";
import { chatDb } from "../db.ts";
import { ITEM_BAG_BASE, ITEM_BAG_CN, ITEM_BAG_JP } from "../constants/itemBag.ts";
import { TEN_DAYS_IN_SECONDS } from "../constants/chat.ts"
import { FASHION_INFO, FASHION_INFO_JP } from "../constants/fashion.ts"
import { sendShipInfo } from "./hero.ts";

const playerPb = protobuf.loadSync("./raw-protobuf/player.proto")
const TRetLogin = playerPb.lookupType("player.TRetLogin")

const userPb = protobuf.loadSync("./raw-protobuf/user.proto")
const TGetUserInfoRet = userPb.lookupType("user.TGetUserInfoRet")
const TSetUserSecretaryArg = userPb.lookupType("user.TSetUserSecretaryArg")

const heroPb = protobuf.loadSync("./raw-protobuf/hero.proto")
const THeroInfo = heroPb.lookupType("hero.THeroInfo")

// 副本相关的proto，哪个大聪明将副本翻译成了copy?
const copyPb = protobuf.loadSync("./raw-protobuf/copy.proto")
const TUserCopyInfo = copyPb.lookupType("copy.TUserCopyInfo")

const equipPb = protobuf.loadSync("./raw-protobuf/equip.proto")
const TEquipList = equipPb.lookupType("equip.TEquipList")

const bagPb = protobuf.loadSync("./raw-protobuf/bag.proto")
const TBagInfoRet = bagPb.lookupType("bag.TBagInfoRet")

const chatPb = protobuf.loadSync("./raw-protobuf/chat.proto")
const TChatInfoRet = chatPb.lookupType("chat.TChatInfoRet")

const gachaPb = protobuf.loadSync("./raw-protobuf/buildship.proto")
const TBuildShipInfo = gachaPb.lookupType("buildship.TBuildShipInfo")

const bathroomPb = protobuf.loadSync("./raw-protobuf/bathroom.proto")
const TBathroomInfo = bathroomPb.lookupType("bathroom.TBathroomInfo")

const fashionPb = protobuf.loadSync("./raw-protobuf/fashion.proto")
const TFashionList = fashionPb.lookupType("fashion.TFashionList")

export function UserLogin(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TRetLogin.create({
        Ret: 'ok',
        ErrCode: '0'
    })
    sendResponsePacket(socket, "user.UserLogin", TRetLogin.encode(resData).finish(), callbackHandler, token)
}

export function GetUserInfo(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    // 这个LoginOK也不知道有啥用，在lua里看了一圈没有一个会用到它发送的数据的，要想设置UserData全靠上面的UpdateUserInfo
    // 这里大概就是把单机版那里设置数据的部分写到这吧
    sendInitMessages(socket, player, callbackHandler, token)
    sendResponsePacket(socket, "user.GetUserInfo", EMPTY_UINT8ARRAY, callbackHandler, token)
}

export function SetUserSecretary(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs: any = TSetUserSecretaryArg.decode(args)
    player.setSecretary(parsedArgs.SecretaryId)
    sendResponsePacket(socket, "user.SetUserSecretary", new Uint8Array(), callbackHandler, token)
    // 发送一份新的基础用户信息，通知客户端换秘书舰了
    const userInfo = player.getUserInfo()
    const userInfoData = TGetUserInfoRet.create(userInfo)
    sendResponsePacket(socket, "user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token)
}

export function Refresh(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    sendInitMessages(socket, player, callbackHandler, token)
    sendResponsePacket(socket, "user.Refresh", EMPTY_UINT8ARRAY, callbackHandler, token)
}

export function GetSupply(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    sendResponsePacket(socket, "user.GetSupply", EMPTY_UINT8ARRAY, callbackHandler, token)
}

async function sendInitMessages(socket: Socket, player: Player, callbackHandler: number, token: string) {
    const encoder = new TextEncoder()
    // 基础用户信息
    const userInfo = player.getUserInfo()
    const userInfoData = TGetUserInfoRet.create(userInfo)
    sendResponsePacket(socket, "user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token)
    // 舰队信息，不知道该发给哪个方法，用自定义方法强行写进去
    const tactics = player.getTactic().getTacticInfo()
    const tacticsData = JSON.stringify({
        MaxPower: 500,
        MinPower: 0,
        tactics
    })
    sendResponsePacket(socket, "tactic.custom.ForceWriteFleetInfo", encoder.encode(tacticsData), callbackHandler, token)
    // 舰娘信息
    sendShipInfo(socket, callbackHandler, token)
    // 副本信息
    // 剧情
    const plotCopyInfo = TUserCopyInfo.create({
        BaseInfo: [
            {
                BaseId: 0,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 1,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 2,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 3,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 4,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 5,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 6,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 7,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 8,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 9,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 10,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 11,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 12,
                FirstPassTime: Math.round(Date.now() / 1000),
            },
            {
                BaseId: 13,
                FirstPassTime: Math.round(Date.now() / 1000),
            }
        ],
        MaxCopyId: 1,
        CopyType: 1,
        StarInfo: [],
        PassCopyCount: 0
    })
    sendResponsePacket(socket, "copy.GetCopy", TUserCopyInfo.encode(plotCopyInfo).finish(), callbackHandler, token)
    // 海域
    if (player.getClientType() === 0) {
        const seaCopyInfo = TUserCopyInfo.create({
            BaseInfo: [
                {
                    BaseId: 5011,
                    Rid: 1,
                    StarLevel: 3,
                    IsRunningFight: false,
                    LBPoint: 0,
                    FirstPassTime: Math.round(Date.now() / 1000),
                    DropHeroIds: [],
                    SfLv: 1,
                    SfPoint: 1,
                    SfInfo: [],
                    SfDot: true,
                    SfLvChoose: 1
                },
                {
                    BaseId: 5012,
                    Rid: 1,
                    StarLevel: 3,
                    IsRunningFight: false,
                    LBPoint: 0,
                    FirstPassTime: Math.round(Date.now() / 1000),
                    DropHeroIds: [],
                    SfLv: 1,
                    SfPoint: 1,
                    SfInfo: [],
                    SfDot: true,
                    SfLvChoose: 1
                },
                {
                    BaseId: 5013,
                    Rid: 1,
                    StarLevel: 3,
                    IsRunningFight: false,
                    LBPoint: 0,
                    FirstPassTime: Math.round(Date.now() / 1000),
                    DropHeroIds: [],
                    SfLv: 1,
                    SfPoint: 1,
                    SfInfo: [],
                    SfDot: true,
                    SfLvChoose: 1
                }
            ],
            MaxCopyId: 1,
            CopyType: 2,
            StarInfo: [],
            PassCopyCount: 0
        })
        sendResponsePacket(socket, "copy.GetCopy", TUserCopyInfo.encode(seaCopyInfo).finish(), callbackHandler, token)
    } else {
        const seaCopyInfo = TUserCopyInfo.create({
            BaseInfo: [
                {
                    BaseId: 1610300,
                    Rid: 1,
                    StarLevel: 3,
                    IsRunningFight: false,
                    LBPoint: 0,
                    FirstPassTime: Math.round(Date.now() / 1000),
                    DropHeroIds: [],
                    SfLv: 1,
                    SfPoint: 1,
                    SfInfo: [],
                    SfDot: true,
                    SfLvChoose: 1
                }
            ],
            MaxCopyId: 1,
            CopyType: 2,
            StarInfo: [],
            PassCopyCount: 0
        })
        sendResponsePacket(socket, "copy.GetCopy", TUserCopyInfo.encode(seaCopyInfo).finish(), callbackHandler, token)
    }
    // 道具背包
    const items: {
        templateId: number
        num: number
    }[] = []
    if (player.getClientType() === ClientType.CN) {
        for (const item of ITEM_BAG_BASE) {
            items.push({
                templateId: item,
                num: 10000
            })
        }
        for (const item of ITEM_BAG_CN) {
            items.push({
                templateId: item,
                num: 10000
            })
        }
    } else {
        for (const item of ITEM_BAG_BASE) {
            items.push({
                templateId: item,
                num: 10000
            })
        }
        for (const item of ITEM_BAG_JP) {
            items.push({
                templateId: item,
                num: 10000
            })
        }
    }
    const bagData = TBagInfoRet.create({
        bagType: 1,
        bagSize: 8000,
        bagInfo: items,
        useInfo: []
    })
    sendResponsePacket(socket, "bag.UpdateBagData", TBagInfoRet.encode(bagData).finish(), callbackHandler, token)
    // 装备背包
    const equipData = TEquipList.create({
        EquipBagSize: 1000,
        EquipInfo: player.getEquipBag().getEquipInfo(),
        EquipNum: []
    })
    sendResponsePacket(socket, "equip.UpdateEquipBagData", TEquipList.encode(equipData).finish(), callbackHandler, token)
    // 图鉴和许愿墙
    const illustrateResData = JSON.stringify(player.getIllustrate().getIllustrateInfo())
    sendResponsePacket(socket, "illustrate.custom.IllustrateInfo", encoder.encode(illustrateResData), callbackHandler, token)
    // 基建
    sendResponsePacket(socket, "building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token)
    // 聊天
    const historyIter = chatDb.list<WorldChatMessage>({
        start: [`WorldChat`, Date.now() - 600000],
        end: [`WorldChat`, Date.now()],
    })
    const chatHistory: any[] = []
    for await (const item of historyIter) {
        const { sender, message, type } = item.value
        chatHistory.push(generateChatMsg(sender, message, type))
    }
    const chatData = TChatInfoRet.create({
        WorldNum: 0,
        WorldMsg: chatHistory,
        GuildMsg: [],
        TeamMsg: [],
        SysMsg: [],
        BanMsg: "",
        BanEndTime: 0,
        FriendMsg: [],
        PersonalMsg: []
    })
    sendResponsePacket(socket, "chat.ChatInfo", TChatInfoRet.encode(chatData).finish(), callbackHandler, token)
    // 抽卡信息
    const gachaData = TBuildShipInfo.create({
        DrawInfo: [],
        DispInfo: [
            { Id: 1, Count: 0 },
            { Id: 1000, Count: 0 },
        ],
        RefreshInfo: [],
        TotalCount: [],
        SpecialInfo: [],
        UsedBoxInfo: [],
        UsedRewardInfo: [],
        ResetTypeCount: [],
        ExtractInfo: [],
        CloseTime: [
            { Id: 1, CloseTime: Math.round(Date.now() / 1000) + TEN_DAYS_IN_SECONDS }
        ],
        RewardChange: []
    })
    sendResponsePacket(socket, "buildship.BuildShipInfo", TBuildShipInfo.encode(gachaData).finish(), callbackHandler, token)
    // 浴室
    const resData = TBathroomInfo.create({
        IsAllAuto: true,
        HeroList: []
    })
    sendResponsePacket(socket, "bathroom.BathroomInfo", TBathroomInfo.encode(resData).finish(), callbackHandler, token)
    // 时装信息
    const fashionData = {
        FashionInfo: player.getClientType() === 0 ? FASHION_INFO : FASHION_INFO_JP
    }
    sendResponsePacket(socket, "fashion.custom.updateData", encoder.encode(JSON.stringify(fashionData)), callbackHandler, token)
}