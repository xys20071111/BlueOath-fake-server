import { createServer } from 'node:net'
import protobuf from 'protobufjs'
import { eventBus } from './logicEventBus.ts'
import { socketPlayerMap, socketSeqMap } from './utils/socketMaps.ts'

const pb = protobuf.loadSync('./raw-protobuf/net_type.proto')
const TRequest = pb.lookupType('net_type.TRequest')

const server = createServer((socket) => {
    socketSeqMap.set(socket, 0)
    socket.on('error', (e) => {
        socketPlayerMap.delete(socket)
    })
    socket.on('close', () => {
        socketPlayerMap.delete(socket)
    })
    socket.on('data', (data) => {
        let reqData: any = null
        // Gemini告诉我，第四位是确定数据包带不带校验哈希
        // 在这里检查一下
        const flagOfHash = data[4]
        if (flagOfHash === 1) {
            reqData = TRequest.decode(new Uint8Array(data.buffer.slice(21)))
        } else {
            reqData = TRequest.decode(new Uint8Array(data.buffer.slice(5)))
        }
        // 解析失败直接踢掉
        if (!reqData || !reqData.Method) {
            console.warn('无法解析数据')
            socket.destroy()
            return
        }
        console.log(`接收到数据，方法：${reqData.Method}`)
        //发送到事件总线上去
        eventBus.emit(
            reqData.Method,
            socket,
            reqData.Args,
            reqData.CallbackHandler,
            reqData.Token,
        )
    })
})

server.addListener('listening', () => {
    console.log('逻辑服务器正在运行，监听端口30008')
})

server.listen(30008)
