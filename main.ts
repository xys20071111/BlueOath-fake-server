console.log("运行假的更新服务器")
new Worker(import.meta.resolve('./updateServer.ts'), {type: 'module'})

console.log("创建所需文件夹")
await Deno.mkdir("./serverData/discuss", {
    recursive: true
})

console.log("运行模拟的逻辑服务器")
new Worker(import.meta.resolve('./logicServer.ts'), {type: 'module'})
