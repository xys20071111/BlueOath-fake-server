import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { Player } from "../Player.ts";

const playerPb = protobuf.loadSync("./raw-protobuf/player.proto")
const TRetLogin = playerPb.lookupType("player.TRetLogin")

const userPb = protobuf.loadSync("./raw-protobuf/user.proto")
const TGetUserInfoRet = userPb.lookupType("user.TGetUserInfoRet")
const TSetUserSecretaryArg = userPb.lookupType("user.TSetUserSecretaryArg")

const heroPb = protobuf.loadSync("./raw-protobuf/hero.proto")
const THeroInfo = heroPb.lookupType("hero.THeroInfo")

const fleetPb = protobuf.loadSync("./raw-protobuf/tactic.proto")
const TSelfTactis = fleetPb.lookupType("TSelfTactis")

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
    const loginOKPacket = createResponsePacket("user.GetUserInfo", TGetUserInfoRet.encode(TGetUserInfoRet.create()).finish(), callbackHandler, token, getSeq(socket))
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
    // 基础用户信息
    const userInfo = player.getUserInfo()
    const userInfoData = TGetUserInfoRet.create(userInfo)
    const userDataPacket = createResponsePacket("user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(userDataPacket)
}

function sendInitMessages(socket: Socket, player: Player, callbackHandler: number, token: string) {
    // 基础用户信息
    const userInfo = player.getUserInfo()
    const userInfoData = TGetUserInfoRet.create(userInfo)
    const userDataPacket = createResponsePacket("user.UpdateUserInfo", TGetUserInfoRet.encode(userInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(userDataPacket)
    // 舰队信息
    const tactics = player.getTactis()
    const tacticsData = TSelfTactis.create({
        MaxPower: 1,
        MinPower: 0,
        tactics
    })
    const tacticsPacket = createResponsePacket("tactic.GetHerosTactic", TSelfTactis.encode(tacticsData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(tacticsPacket)
    // 舰娘信息
    const heroInfo = player.getHeroBag()
    const heroInfoData = THeroInfo.create({
        HeroInfo: heroInfo,
        HeroBagSize: 1000,
        HeroNum: [{ TemplateId: 10210511, Num: 80 }]
    })
    const heroInfoPacket = createResponsePacket("hero.UpdateHeroBagData", THeroInfo.encode(heroInfoData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(heroInfoPacket)
}