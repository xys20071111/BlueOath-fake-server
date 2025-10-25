import { EventEmitter } from "node:events";
import { Socket } from "node:net"
import { socketUserMap } from "./utils/socketMaps.ts";
import { GetUserList, Login } from "./logic/login.ts";
import { GetUserInfo, UserLogin } from "./logic/user.ts"
import { GetBarrageById } from "./logic/chat.ts";
import { PlotReward } from "./logic/guide.ts";

class EventBus extends EventEmitter {
    // 重写一下emit函数，检查socket是不是已经登录了
    public override emit(eventName: string, socket: Socket, ...args: unknown[]): boolean {
        if (eventName === 'player.Login') {
            // player.Login除外，因为这个是负责登录的函数
            return super.emit(eventName, socket, ...args)
        } else {
            const user = socketUserMap.get(socket)
            if (!user) {
                socket.destroy()
                return false
            }
            return super.emit(eventName, socket, ...args)
        }
    }
}

export const eventBus = new EventBus()

eventBus.on("player.Login", Login)
eventBus.on("player.GetUserList", GetUserList)
eventBus.on("user.UserLogin", UserLogin)
eventBus.on("user.GetUserInfo", GetUserInfo)

eventBus.on("chat.GetBarrageById", GetBarrageById)

eventBus.on("guide.PlotReward", PlotReward)