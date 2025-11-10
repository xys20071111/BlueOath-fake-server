import { Socket } from "node:net";
import protobuf from "protobufjs"
import { sendResponsePacket } from "../utils/createResponsePacket.ts";
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
    sendResponsePacket(socket, "building.UpdateHeroAddition", EMPTY_UINT8ARRAY, callbackHandler, token)
}

export function SaveTactic(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TSaveBuildingTacticArg.decode(args).toJSON()
    console.log(parsedArgs.TacticList)
    if (parsedArgs.TacticList) {
        const id = parsedArgs.TacticList[0].BuildingId
        player.getUserBuilding().setBuildingTactics(id, parsedArgs.TacticList)
    }
    sendResponsePacket(socket, "building.SaveTactic", EMPTY_UINT8ARRAY, callbackHandler, token)
}

export function AddBuilding(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TAddBuildingArg.decode(args).toJSON()
    const BuildingId = player.getUserBuilding().addBuilding(parsedArgs.Tid, parsedArgs.Index)
    const resData = TAddBuildingRet.create({
        BuildingId
    })
    sendResponsePacket(socket, "building.AddBuilding", TAddBuildingArg.encode(resData).finish(), callbackHandler, token)
    // 发送新的基建信息
    sendResponsePacket(socket, "building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token)
}

export function SetHero(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TSetHeroArg.decode(args).toJSON()
    player.getUserBuilding().buildingSetHero(parsedArgs.BuildingId, parsedArgs.HeroIdList)
    sendResponsePacket(socket, "building.SetHero", EMPTY_UINT8ARRAY, callbackHandler, token)
    // 发送新的基建信息
    sendResponsePacket(socket, "building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token)
}

export function UpgradeBuilding(socket: Socket, args: Uint8Array, callbackHandler: number, token: string) {
    const player = socketPlayerMap.get(socket)!
    const parsedArgs = TUpgradeBuildingArg.decode(args).toJSON()
    player.getUserBuilding().buildingUpgrade(parsedArgs.BuildingId)
    sendResponsePacket(socket, "building.UpgradeBuilding", EMPTY_UINT8ARRAY, callbackHandler, token)
    // 发送新的基建信息
    sendResponsePacket(socket, "building.custom.UpdateBuildingInfo", encoder.encode(JSON.stringify(player.getUserBuilding().getBuildingInfo())), callbackHandler, token)
}

export function EmptyReceive(socket: Socket, method: string, callbackHandler: number, token: string) {
    const resData = TReceiveRet.create({
        ItemInfo: []
    })
    sendResponsePacket(socket, method, TReceiveRet.encode(resData).finish(), callbackHandler, token)
}