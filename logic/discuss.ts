import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts"

const pb = protobuf.loadSync('./raw-protobuf/discuss.proto')
const TGetDiscussRet = pb.lookupType("discuss.TGetDiscussRet")
const TGetDiscussArg = pb.lookupType("discuss.TGetDiscussArg")
const TDiscussArg = pb.lookupType("discuss.TDiscussArg")

interface MsgInfo {
    Name: string,
    Msg: string
    LikeNum: number
    MsgID: number
    IsLiked: number
    IsDisLiked: number
    Level: number
    LikeTime: number
}

interface DiscussInfo {
    DisLikeNum: number
    DisLikeTime: number
    MsgTime: number
    HeroLikeNum: number
    MsgInfo: MsgInfo[]
    nextMsgId: number
}

class DiscussArea {
    private id: number
    private nextMsgId: number = 0
    public DisLikeNum: number = 0
    public DisLikeTime: number = 0
    public MsgTime: number = 0
    public HeroLikeNum: number = 0
    public MsgInfo: MsgInfo[] = []

    constructor(id: number) {
        this.id = id
        try {
            const discuss: DiscussInfo = JSON.parse(Deno.readTextFileSync(`./serverData/discuss/${id}.json`))
            this.DisLikeNum = discuss.DisLikeNum
            this.DisLikeTime = discuss.DisLikeTime
            this.MsgTime = discuss.MsgTime
            this.HeroLikeNum = discuss.HeroLikeNum
            this.MsgInfo = discuss.MsgInfo
            this.nextMsgId = discuss.nextMsgId
        } catch {
            console.log(`未找到评论文件./serverData/discuss/${id}.json，将在保存时创建`)
        }
    }

    public async saveDiscuss() {
        const discuss: DiscussInfo = {
            DisLikeNum: this.DisLikeNum,
            DisLikeTime: this.DisLikeTime,
            MsgTime: this.MsgTime,
            HeroLikeNum: this.HeroLikeNum,
            MsgInfo: this.MsgInfo,
            nextMsgId: this.nextMsgId
        }
        await Deno.writeTextFile(`./serverData/discuss/${this.id}.json`, JSON.stringify(discuss))
    }

    public getDiscuss() {
        return {
            DisLikeNum: this.DisLikeNum,
            DisLikeTime: this.DisLikeTime,
            MsgTime: this.MsgTime,
            HeroLikeNum: this.HeroLikeNum,
            MsgInfo: this.MsgInfo
        }
    }

    public getNextMsgId() {
        return this.nextMsgId++
    }
}

const discussIdMap: Map<number, DiscussArea> = new Map()

export function GetDiscuss(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const parsedArgs = TGetDiscussArg.decode(args).toJSON()
    const id = parsedArgs.Htid
    let discuss
    if (discussIdMap.has(id)) {
        discuss = discussIdMap.get(id)!
    } else {
        discuss = new DiscussArea(id)
        discussIdMap.set(id, discuss)
    }
    const resData = TGetDiscussRet.create(discuss.getDiscuss())
    socket.write(createResponsePacket("discuss.GetDiscuss", TGetDiscussRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}

export function Discuss(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TDiscussArg.decode(args).toJSON()
    const id = parsedArgs.Htid
    let discuss
    if (discussIdMap.has(id)) {
        discuss = discussIdMap.get(id)!
    } else {
        discuss = new DiscussArea(id)
        discussIdMap.set(id, discuss)
    }
    discuss.MsgInfo.push({
        Name: player.getUname(),
        Msg: parsedArgs.Msg,
        LikeNum: 0,
        MsgID: discuss.getNextMsgId(),
        LikeTime: 0,
        IsLiked: 0,
        IsDisLiked: 0,
        Level: 1
    })
    discuss.saveDiscuss()
    const resData = TGetDiscussRet.create(discuss.getDiscuss())
    socket.write(createResponsePacket("discuss.GetDiscuss", TGetDiscussRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}

export function Like(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("discuss.Like", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}
