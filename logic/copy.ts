import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";

const copyPb = protobuf.loadSync("./raw-protobuf/copy.proto")
const TStartBaseArg = copyPb.lookupType("copy.TStartBaseArg")
const TStartBaseRet = copyPb.lookupType("copy.TStartBaseRet")

// 注意：此方法现在返回的参数基本都是瞎填的，点击出征会导致游戏卡死
export function StartBase(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TStartBaseArg.decode(args).toJSON()
    console.log(parsedArgs)
    const player = socketPlayerMap.get(socket)!
    const userInfo = player.getUserInfo()
    const resData = TStartBaseRet.create({
        BattlePlayer: {
            Pid: userInfo.Uid,
            Uid: userInfo.Uid,
            Uname: userInfo.Uname,
            Level: userInfo.Level,
            PlayerCamp: 0,
            Index: 0,
            FleetInfo: {
                FleetId: 1,
                FormationId: 1,
                Index: parsedArgs.HeroList[0].Index,
                Ships: [],
                StrategyId: parsedArgs.HeroList[0].StrategyId,
                ConditionList: [],
                KillTimes: 0,
                HeroList: parsedArgs.HeroList[0].HeroList,
                TacticType: 1
            }
        },
        RandomSeed: 114514,
        Rid: 1,
        arrRes: [],
        EnemyFleet: [],
        CopyId: parsedArgs.CopyId,
        CopyType: 1,
        CopyPass: true,
        BossProgress: 100,
        IsRunningFight: true,
        ShipEquipGridInfo: [],
        RandomFactors: [],
        SafeLv: 1,
        Verify: {
            opes: {
                frameCount: 0,
                opes: []
            },
            result: {}
        },
        ExtraBattlePlayerList: [],
        Token: token,
        SkipVcr: [],
        BattleMode: parsedArgs.BattleMode,
        IsFinal: true,
        CopyMission: [],
        EnemyFleets: [],
        ConfigData: [],
        MatchType: 1,
        AnimMode: parsedArgs.AnimMode
    })
    sendResponsePacket(socket, "copy.StartBase", TStartBaseRet.encode(resData).finish(), callbackHandler, token)
}