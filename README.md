用来绕过《苍蓝誓约》的版本更新和别的什么验证的服务器程序  
需要`Deno`作为运行环境，或者下载Release里已经打包好的版本  
运行前先将server.crt安装到`受信任的根证书颁发机构`里，然后克隆仓库，运行`deno run --allow-net --allow-read=./ ./main.ts`
之后通过修改hosts（不一定好使）或者自己用`Pi-Hole`啥的建一个dns服务器，将`mapishipgirl.zuiyouxi.com`解析到`127.0.0.1`  
现在运行游戏应该就能看到进入登录界面了