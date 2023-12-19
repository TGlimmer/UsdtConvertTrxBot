## 关于本项目

 Telegram USDT自动化兑换TRX机器人源码，本项目基于 `Nodejs` ， 这只是简易版本，但是我相信也比市面上的要好一些，请自行体验。

## 开始

请仔细查看源码配置区域的备注进行配置

**如有任何问题 请进交流群自行询问，或动手能力强的自行研究。**

### 安装环境
项目运行基于`Nodejs`+`Mysql`，你需要先安装必要的环境，不会安装 自行Google

推荐使用宝塔`Nodejs`管理器 + `Supervisor`进程守护插件

`Nodejs`官网：https://nodejs.org/


### 安装依赖

我习惯使用 `npm`

> npm install

### 导入数据库

导入 `mi_sd.sql` 推荐版本 `Mysql5.7`

### 运行

+ 直接运行
    > node ./app.js
+ 后台运行
    > nohup node ./app.js &

**推荐使用宝塔的`Supervisor`进程守护插件进行运行**

## 实现逻辑

1. 24小时轮询监控收款地址
2. 成功监听到交易
3. 获取实时币价 * 利润
4. 发起支付计算后的TRX金额
5. 通知，兑换成功

## 技术交流/意见反馈

+ MCG技术交流群 https://t.me/MCG_Club

## AD -- 免费领取国际信用卡
>免费领取VISA卡，万事达卡，充值USDT即可随便刷  
可绑微信、支付宝、美区AppStore消费  
24小时自助开卡充值 无需KYC  
无需人工协助，用户可自行免费注册，后台自助实现入金、开卡、绑卡、销卡、查询等操作，支持无限开卡、在线接码。  
✅支持 OpenAi 人工智能 chatGPT PLUS 开通   
✅支持 开通Telegram飞机会员  
➡️➡️➡️ [点击领取你的国际信用卡]([https://t.me/EKaPayBot?start=FV6S5XHT9H](https://gpt.fomepay.com/#/pages/login/index?d=O179F9))

## AD -- 机器人推广

24小时自动发卡机器人：[自动发卡](https://t.me/fakatestbot)
> 24小时自动发卡机器人 对接独角

兑币机 - TRX自动兑换：[兑币机](https://t.me/ConvertTrxBot)
> 自用兑币机，并不是开源版机器人！！！

波场能量机器人：[波场能量机器人](https://t.me/BuyEnergysBot)
> 波场能量租用，有能量时转账USDT不扣TRX，为你节省50-70%的TRX

TG会员秒开机器人：[TG会员秒开-全自动发货](https://t.me/BuySvipBot)
> 24小时自动开通Telegram Premium会员，只需一个用户名即可开通。

## 私有定制

如需定制机器人或其他业务,请联系[@Miya](https://t.me/SendToMeMessageBot)

## 许可证

根据 MIT 许可证分发。打开 [LICENSE.txt](/LICENSE.txt) 查看更多内容。


<p align="right">(<a href="#top">返回顶部</a>)</p>
