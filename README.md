# BilibiliSponsorBlockPC

空降助手PC版

哔哩哔哩pc客户端跳过广告插件

![](./img/1.png)

[BiliLoader](https://github.com/JoinChang/BiliLoader) https://github.com/JoinChang/BiliLoader 插件

### BiliLoader 新版报错问题解决

哔哩哔哩新版会验证 package.json 文件，不要修改 package.json。

正常使用 `asar e .\app.asar app` 解包文件

将 BiliLoader 文件夹复制到 app 文件夹内。

打开 resources\app\BiliLoader\src\entry.js，删除掉最后一行 `require(require("path").join(process.resourcesPath, "app/index.js"));`

打开 resources\app\index.js，在第一行添加 `require("./BiliLoader/src/entry.js");`
