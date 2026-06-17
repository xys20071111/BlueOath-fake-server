import { existsSync } from 'node:fs'
import { DB } from 'sqlite'

console.log('准备运行所需的数据库')
if (!existsSync('./serverData/userInfo.db')) {
    console.log('没有找到用户信息数据库，开始创建')
    const userInfoMainDb = new DB('./serverData/userInfo.db')
    userInfoMainDb.query(`
CREATE TABLE user_info(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uname TEXT NOT NULL,
    secretary_id INT NOT NULL
);
    `)
    userInfoMainDb.close()
}

console.log('运行假的更新服务器')
new Worker(import.meta.resolve('./server/updateServer.ts'), { type: 'module' })

console.log('创建所需文件夹')
await Deno.mkdir('./serverData/', {
    recursive: true
})

console.log('运行模拟的逻辑服务器')
new Worker(import.meta.resolve('./server/logicServer.ts'), { type: 'module' })
