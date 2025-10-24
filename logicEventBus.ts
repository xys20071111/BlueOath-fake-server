import { EventEmitter } from "node:events";
import { playerGetUserList, playerLogin } from "./logic/login.ts";
import { userGetUserInfo, userUserLogin } from "./logic/user.ts"

export const eventBus = new EventEmitter()

eventBus.on("player.Login", playerLogin)
eventBus.on("player.GetUserList", playerGetUserList)
eventBus.on("user.UserLogin", userUserLogin)
eventBus.on("user.GetUserInfo", userGetUserInfo)