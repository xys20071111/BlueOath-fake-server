import { Application } from '@oak/oak'

const app = new Application()

// 反推自 https://github.com/crazytuzi/LuaFramework/blob/64d5c497bd5089ad494ee84df49ffe8a0bed85ea/%E6%94%BE%E5%BC%80%E9%82%A3%E4%B8%89%E5%9B%BD/ui/login/CheckVerionLogic.lua#L30
// 将applereview和getversion的信息融合了一下
app.use(async (ctx) => {
    ctx.response.status = 200
    ctx.response.body = {
        error_id: 200,
        'errornu': '0',
        'errordesc': '',
    }
    // console.log('----请求信息----')
    // console.log(ctx.request.url)
    // console.log(await ctx.request.body.text())
})

app.addEventListener('listen', () => {
    console.log('假的更新服务器正在运行')
})

// 启动假更新服务器
app.listen({
    port: 443,
    key: await Deno.readTextFile('./server.key'),
    cert: await Deno.readTextFile('./server.crt'),
})
