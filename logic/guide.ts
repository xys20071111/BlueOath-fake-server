import { Socket } from 'node:net'
import protobuf from 'protobufjs'
import { sendResponsePacket } from '../utils/createResponsePacket.ts'

const pb = protobuf.loadSync('./raw-protobuf/guide.proto')
const TGuidePlotRewardRet = pb.lookupType('guide.TGuidePlotRewardRet')
const TGuidePlotRewardArg = pb.lookupType('guide.TGuidePlotRewardArg')
const TGuideSettingArg = pb.lookupType('guide.TGuideSettingArg')
const TGuideInfo = pb.lookupType('guide.TGuideInfo')

// 似乎在通关剧情时会发送一到多个PlotReward方法，可以在此处建立PlotId与剧情的关联，通过剧情后将通过信息和下一条剧情的信息加到PlotInfo中
export function PlotReward(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs: any = TGuidePlotRewardArg.decode(args).toJSON()
    console.log(parsedArgs)
    const resData = TGuidePlotRewardRet.create({
        PlotId: parsedArgs.PlotId,
    })
    sendResponsePacket(
        socket,
        'guide.PlotReward',
        TGuidePlotRewardRet.encode(resData).finish(),
        callbackHandler,
        token,
    )
}

export function Setting(
    socket: Socket,
    args: Uint8Array,
    callbackHandler: number,
    token: string,
) {
    const parsedArgs: any = TGuideSettingArg.decode(args).toJSON()
    const res: any = {
        Setting: [
            {
                Key: 'GUIDE_DONE_STAGE',
                Value: '{\n["stageId"]=10000,\n["stepId"]=1,\n["paraId"]=1,\n}',
            },
            {
                Key: 'GUIDE_DOING_STAGE',
                Value: '{\n["stageId"]=10001,\n["stepId"]=1,\n["paraId"]=1,\n}',
            },
        ],
    }
    const resData = TGuideInfo.create(res)
    sendResponsePacket(
        socket,
        'guide.Setting',
        TGuideInfo.encode(resData).finish(),
        callbackHandler,
        token,
    )
}
