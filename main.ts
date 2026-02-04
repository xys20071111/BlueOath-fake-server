console.log('运行假的更新服务器')
new Worker(import.meta.resolve('./server/updateServer.ts'), { type: 'module' })

console.log('创建所需文件夹')
await Deno.mkdir('./serverData/', {
    recursive: true
})

console.log('运行模拟的逻辑服务器')
new Worker(import.meta.resolve('./server/logicServer.ts'), { type: 'module' })
