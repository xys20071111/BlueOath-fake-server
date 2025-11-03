import { Socket } from "node:net";
import protobuf from "protobufjs"
import { createResponsePacket } from "../utils/createResponsePacket.ts";
import { getSeq, socketPlayerMap } from "../utils/socketMaps.ts";
import { EMPTY_UINT8ARRAY } from "../utils/placeholder.ts";

const encoder = new TextEncoder()

const pb = protobuf.loadSync("./raw-protobuf/building.proto")
const TSaveBuildingTacticArg = pb.lookupType("building.TSaveBuildingTacticArg")
const TAddBuildingArg = pb.lookupType("building.TAddBuildingArg")
const TAddBuildingRet = pb.lookupType("building.TAddBuildingRet")
const TUpgradeBuildingArg = pb.lookupType("building.TUpgradeBuildingArg")
const TReceiveRet = pb.lookupType("building.TReceiveRet")
const TSetHeroArg = pb.lookupType("building.TSetHeroArg")

export function UpdateHeroAddition(socket: Socket, _args: Uint8Array, callbackHandler: number, token: string) {
    socket.write(createResponsePacket("building.UpdateHeroAddition", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

export function SaveTactic(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TSaveBuildingTacticArg.decode(args).toJSON()
    console.log(parsedArgs.TacticList)
    if (parsedArgs.TacticList) {
        const id = parsedArgs.TacticList[0].BuildingId
        player.getUserBuilding().setBuildingTactics(id, parsedArgs.TacticList)
    }
    socket.write(createResponsePacket("building.SaveTactic", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
}

export function AddBuilding(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TAddBuildingArg.decode(args).toJSON()
    const BuildingId = player.getUserBuilding().addBuilding(parsedArgs.Tid, parsedArgs.Index)
    const resData = TAddBuildingRet.create({
        BuildingId
    })
    socket.write(createResponsePacket("building.AddBuilding", TAddBuildingArg.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
    // 发送新的基建信息
    socket.write(createResponsePacket("building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token, getSeq(socket)))
}

export function SetHero(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TSetHeroArg.decode(args).toJSON()
    player.getUserBuilding().buildingSetHero(parsedArgs.BuildingId, parsedArgs.HeroIdList)
    socket.write(createResponsePacket("building.SetHero", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    // 发送新的基建信息
    socket.write(createResponsePacket("building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token, getSeq(socket)))
}

export function UpgradeBuilding(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TUpgradeBuildingArg.decode(args).toJSON()
    player.getUserBuilding().buildingUpgrade(parsedArgs.BuildingId)
    socket.write(createResponsePacket("building.UpgradeBuilding", EMPTY_UINT8ARRAY, callbackHandler, token, getSeq(socket)))
    // 发送新的基建信息
    socket.write(createResponsePacket("building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token, getSeq(socket)))
}

export function EmptyReceive(socket: Socket, method: string, callbackHandler: number, token: string) {
    const resData = TReceiveRet.create({
        ItemInfo: []
    })
    socket.write(createResponsePacket(method, TReceiveRet.encode(resData).finish(), callbackHandler, token, getSeq(socket)))
}