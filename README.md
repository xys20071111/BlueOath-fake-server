用来绕过《苍蓝誓约》的版本更新和别的什么验证的服务器程序  
配合[国服补丁](https://github.com/xys20071111/BlueOath-lua-modified/tree/net)或[日服补丁](https://github.com/xys20071111/BlueOath-lua-modified-jp/tree/net)使用
需要`Deno`作为运行环境  
使用步骤：
- 运行前先将server.crt安装到`受信任的根证书颁发机构`里，或者使用[这个补丁](https://github.com/AraiShia/Hook-BlueOath-Local-JP-Server/releases/tag/main)(我没测试过这个好不好用)  
- （使用补丁无视这一步）通过修改hosts（不一定好使）或者自己用`Pi-Hole`啥的建一个dns服务器，将`mapishipgirl.zuiyouxi.com`（日服是`mapijpshipgirl.blueoath.com`）解析到`127.0.0.1`  
- 最后克隆仓库，运行`deno run --watch --allow-read --allow-write --allow-net --unstable-kv main.ts`  
现在运行游戏应该就能看到进入登录界面了
