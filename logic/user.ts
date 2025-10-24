import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketSeqMap.ts";

const playerPb = protobuf.loadSync("./raw-protobuf/player.proto")
const TRetLogin = playerPb.lookupType("player.TRetLogin")

const userPb = protobuf.loadSync("./raw-protobuf/user.proto")
const TGetUserInfoRet = userPb.lookupType("user.TGetUserInfoRet")

export function userUserLogin(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TRetLogin.create({
        Ret: 'ok',
        ErrCode: '0'
    })
    const resPacket = createResponsePacket("user.UserLogin", TRetLogin.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

export function userGetUserInfo(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const resData = TGetUserInfoRet.create({
        "Uid": 10001,
        "Uname": "Test123",
        "OrderRecord": {},
        "Level": 100,
        "SecretaryId": 1,
        HeadShow: 1,
        Exp: 100,
        Gold: 5000,
        Diamond: 5000,
        Gas: 5000,
        Supply: 5000,
        MainGun: 5000,
        Torpedo: 5000,
        Plane: 5000,
        Other: 5000,
        Retire: 5000,
        Bath: 5000,
        Strategy: 101,
        Medal: 5000,
        CopyTrainPoint: 5000,
        Tower: 5000,
        FashionPoint: 5000,
        Lucky: 5000,
        GuildContri: 5000,
        TeacherMedal: 5000,
        TeacherPrestige: 5000,
        BattlePassExp: 5000,
        BattlePassGold: 5000,
        PvePt: 5
    })
    const resPacket = createResponsePacket("user.GetUserInfo", TGetUserInfoRet.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}