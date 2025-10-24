import { Socket } from "node:net";

export const socketSeqMap: Map<Socket, number> = new Map()
export const socketUserMap: Map<Socket, string> = new Map()

export function getSeq(socket: Socket): number {
    if (socketSeqMap.has(socket)) {
        const seq = socketSeqMap.get(socket) as number
        socketSeqMap.set(socket, seq + 1)
        return seq
    }
    console.warn(`出现了未知的socket`)
    socketSeqMap.set(socket, 0)
    return 0
}