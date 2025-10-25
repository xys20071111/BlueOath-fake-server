import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq } from "../utils/socketMaps.ts";

const pb = protobuf.loadSync("./raw-protobuf/guide.proto")
const TGuidePlotRewardRet = pb.lookupType("guide.TGuidePlotRewardRet")
const TGuidePlotRewardArg = pb.lookupType("guide.TGuidePlotRewardArg")
const TGuideSettingArg = pb.lookupType("guide.TGuideSettingArg")
const TGuideInfo = pb.lookupType("guide.TGuideInfo")

export function PlotReward(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs: any = TGuidePlotRewardArg.decode(args)
    const resData = TGuidePlotRewardRet.create({
        PlotId: parsedArgs.PlotId
    })
    const resPacket = createResponsePacket("guide.PlotReward", TGuidePlotRewardRet.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}

export function Setting(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs: any = TGuideSettingArg.decode(args)
    const res: any = {
        Setting: []
    }
    parsedArgs.param.forEach((v: any) => {
        res.Setting.push(v)
    })
    const resData = TGuideInfo.create(res)
    const resPacket = createResponsePacket("guide.Setting", TGuideInfo.encode(resData).finish(), callbackHandler, token, getSeq(socket))
    socket.write(resPacket)
}