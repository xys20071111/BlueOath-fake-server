import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { Player } from "../entity/player.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";
import { generateChatMsg, WorldChatMessage } from "./chat.ts";
import { chatDb } from "../db.ts";
import { FASHION_INFO, ITEM_BAG, TEN_DAYS_IN_SECONDS } from "../constant.ts";

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
    const resPacket = createResponsePacket("user.UserLogin", TRetLogin.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

export function GetUserInfo(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const loginOKPacket = createResponsePacket("user.GetUserInfo", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket))
    // 这个LoginOK也不知道有啥用，在lua里看了一圈没有一个会用到它发送的数据的，要想设置UserData全靠上面的UpdateUserInfo
    // 这里大概就是把单机版那里设置数据的部分写到这吧
    sendInitMessages(socket, player, callbackHandler, token)
    socket.write(loginOKPacket)
}

export function SetUserSecretary(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs: any = TSetUserSecretaryArg.decode(args)
    player.setSecretary(parsedArgs.SecretaryId)
    const reply = createResponsePacket("user.SetUserSecretary", new Uint8Array(), callbackHandler, token, getSeq(socket))
    socket.write(reply)
    // 发送一份新的基础用户信息，通知客户端换秘书舰了
    const userInfo = player.getUserInfo()
    const userInfoData = TGetUserInfoRet.create(userInfo)
    const userDataPacket = createResponsePacket("user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(userDataPacket)
}

export function Refresh(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    sendInitMessages(socket, player, callbackHandler, token)
    socket.write(createResponsePacket("user.Refresh", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

export function GetSupply(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("user.GetSupply", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

export function SetUserOrderRecord(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("user.SetUserOrderRecord", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

async function sendInitMessages(socket: Socket, player: Player, callbackHandler: number, token: string) {
    const encoder = new TextEncoder()
    // 基础用户信息
    const userInfo = player.getUserInfo()
    const userInfoData = TGetUserInfoRet.create(userInfo)
    const userDataPacket = createResponsePacket("user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(userDataPacket)
    // 舰队信息，不知道该发给哪个方法，用自定义方法强行写进去
    const tactics = player.getTactic().getTacticInfo()
    const tacticsData = JSON.stringify({
        MaxPower: 500,
        MinPower: 0,
        tactics
    })
    const tacticsPacket = createResponsePacket("tactic.custom.ForceWriteFleetInfo", encoder.encode(tacticsData), callbackHandler, token, getSeq(socket))
    socket.write(tacticsPacket)
    // 舰娘信息
    const heroInfo = player.getHeroInfo().getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
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
    socket.write(createResponsePacket("copy.GetCopy", TUserCopyInfo.encode(plotCopyInfo).finish(), callbackHandler, token, getSeq(socket)))
    // 海域
    if (player.getClientType() === 0) {
        const seaCopyInfo = TUserCopyInfo.create({
            BaseInfo: [
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
        socket.write(createResponsePacket("copy.GetCopy", TUserCopyInfo.encode(seaCopyInfo).finish(), callbackHandler, token, getSeq(socket)))
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
        socket.write(createResponsePacket("copy.GetCopy", TUserCopyInfo.encode(seaCopyInfo).finish(), callbackHandler, token, getSeq(socket)))
    }
    // 道具背包
    const bagData = TBagInfoRet.create({
        bagType: 1,
        bagSize: 8000,
        bagInfo: ITEM_BAG,
        useInfo: []
    })
    socket.write(createResponsePacket("bag.UpdateBagData", TBagInfoRet.encode(bagData).finish(), callbackHandler, token, getSeq(socket)))
    // 装备背包
    const equipData = TEquipList.create({
        EquipBagSize: 1000,
        EquipInfo: player.getEquipBag(),
        EquipNum: []
    })
    socket.write(createResponsePacket("equip.UpdateEquipBagData", TEquipList.encode(equipData).finish(), callbackHandler, token, getSeq(socket)))
    // 图鉴
    const illustrateResData = JSON.stringify(player.getIllustrate().getIllustrateInfo())
    socket.write(createResponsePacket("illustrate.custom.IllustrateInfo", encoder.encode(illustrateResData), callbackHandler, token, getSeq(socket)))
    // 基建
    socket.write(createResponsePacket("building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token, getSeq(socket)))
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
    socket.write(createResponsePacket("chat.ChatInfo", TChatInfoRet.encode(chatData).finish(), callbackHandler, token, getSeq(socket)))
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
    socket.write(createResponsePacket("buildship.BuildShipInfo", TBuildShipInfo.encode(gachaData).finish(), callbackHandler, token, getSeq(socket)))
    // 浴室
    const resData = TBathroomInfo.create({
        IsAllAuto: true,
        HeroList: []
    })
    socket.write(createResponsePacket("bathroom.BathroomInfo", TBathroomInfo.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
    // 时装信息
    const fashionData = {
        FashionInfo: FASHION_INFO
    }
    socket.write(createResponsePacket("fashion.custom.updateData", encoder.encode(JSON.stringify(fashionData)), callbackHandler, token, getSeq(socket)))
}