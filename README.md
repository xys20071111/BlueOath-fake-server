用来绕过《苍蓝誓约》的版本更新和别的什么验证的服务器程序  
配合[国服补丁](https://github.com/xys20071111/BlueOath-lua-modified/tree/net)或[日服补丁](https://github.com/xys20071111/BlueOath-lua-modified-jp/tree/net)使用
需要`Deno`作为运行环境  
使用步骤：
- 运行前先将server.crt安装到`受信任的根证书颁发机构`里，或者使用[这个补丁](https://github.com/AraiShia/Hook-BlueOath-Local-JP-Server/releases/tag/main)(我没测试过这个好不好用)  
- （使用补丁无视这一步）通过修改hosts（不一定好使）或者自己用`Pi-Hole`啥的建一个dns服务器，将`mapishipgirl.zuiyouxi.com`（日服是`mapijpshipgirl.blueoath.com`）解析到`127.0.0.1`  
- 最后克隆仓库，运行`deno run --watch --allow-read --allow-write --allow-net --unstable-kv main.ts`  
现在运行游戏应该就能看到进入登录界面了

贴吧里的大佬RuoLin制作了整合包，发布到了夸克网盘，以下是分享信息
```
我用夸克网盘给你分享了「日服」等3项，点击链接或复制整段内容，打开「夸克APP」即可获取。
/~c54339hnga~:/
链接：https://pan.quark.cn/s/c03f57f5a894
```

同时我将整合包传到了IPFS上，CID是`QmZc9ZEeLb7Zp4XAxsZRKf64Jx1Yj4NsGVSYCFS8m1Vr3p`  
如果可能的话，请考虑安装一个IPFS网关然后从自己的网关上获取，帮我分担一下做种压力
