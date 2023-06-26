var mysql = require('mysql'); // Copyrigth by @miya0v0 
var TelegramBot = require('node-telegram-bot-api'); // Copyrigth by @miya0v0 
var TronWeb = require('tronweb') // Copyrigth by @miya0v0 
var request = require('request-promise'); // Copyrigth by @miya0v0 
var moment = require('moment'); // Copyrigth by @miya0v0 

/*配置区域 */
var pool = mysql.createPool({
    port: 3306, //mysql端口
    user: 'root', //mysql用户名
    password: 'root', //mysql密码
    database: 'mi_sd', //mysql数据库
    multipleStatements: true //不要改这个
});
var token = "" //机器人token
var address = "" //收款地址
var centeraddress = "" //转账地址
var trxPrivateKey = ""; //私钥
var cunbiaddress = "" //存币地址(不识别这个地址的转账)
var minCount_USDT = 1;//usdt起兑金额
var adminid = 6264268800 //管理员的id
var successqunid = [-1001896014157]; //兑换成功播报的群id
var yuzhimenkan = 1000; //单位TRX
var yuzhiamount = 20; //预支的TRX数量
var lirun = 0.25  //百分比
/*配置区域 */


newordertimestamp_trx = Math.round(new Date()); // Copyrigth by @miya0v0 
apiURL = [
    {
        //trx: `https://api.trongrid.io/v1/accounts/${address}/transactions`, TRX兑换USDT才需要配置
        usdt: `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?limit=20&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`, //这里没有加入APIKEY，如果需要加入APIKEY，请自行修改
    },
],
keyboard = [
    [{ text: "🌐立即兑换" }, { text: "💰TRX预支" }],
    [{ text: "💹实时U价" }, { text: "🌐实时汇率" }],
    [{ text: "✳️租赁能量" }, { text: "🏠个人中心" }],
],
start_inline_keyboard = [
    [{ text: "💁在线客服", url: 'https://t.me/imessage115' }, { text: "🐧官方频道", url: 'https://t.me/MCG_TRX' }],
    [{ text: "✳️租赁能量", url: 'https://t.me/BuyEnergysBot' }, { text: "🎈秒开TG会员", url: 'https://t.me/BuySvipBot' }],
],
sendad_inline_keyboard = [
    [{ text: "🚀开始闪兑", url: 'https://t.me/ConvertTrxBot?start=start' }, { text: "🙎‍♀️私聊老板", url: 'https://t.me/imessage115' }],
    [{ text: "✳️租赁能量", url: 'https://t.me/BuyEnergysBot' }, { text: "🎈秒开TG会员", url: 'https://t.me/BuySvipBot' }],
],

bot = new TelegramBot(token, { polling: true });
var urlArray = apiURL[0];
var tronWeb = new TronWeb("https://api.trongrid.io", "https://api.trongrid.io", "https://api.trongrid.io", trxPrivateKey);

// 设置定时器，每隔3秒执行一次
setInterval(function () {
    listenUSDT(urlArray['usdt']);
    calculateDuihuanbili_TRX()
}, 3000)

bot.on('text', (msg) => {
    pool.getConnection(function (err, connection) {
        if (err) return err;
        connection.query(`SELECT * FROM users where telegramid = "${msg.from.id}"`, (error, result) => {
            if (error) return error;
            if (!result[0]) {
                var inviter_telegramid = msg.text.split(" ")[1];
                if (!inviter_telegramid || parseInt(inviter_telegramid) % 1 != 0) {
                    inviter_telegramid = "无邀请人"
                }
                connection.query(`Insert into users (username,nickname,telegramid,register_time,inviter_telegramid) values ("${(msg.from.username ? msg.from.username : "")}","${utf16toEntities((msg.from.first_name ? msg.from.first_name : "") + (msg.from.last_name ? msg.from.last_name : ""))}","${msg.from.id}",now(),"${inviter_telegramid}");`, (error, _result) => {
                    connection.destroy();
                    if (error) return error;
                    main(msg);
                });
            } else {
                connection.query(`update users set username =  "${(msg.from.username ? msg.from.username : "")}",nickname = "${utf16toEntities((msg.from.first_name ? msg.from.first_name : "") + (msg.from.last_name ? msg.from.last_name : ""))}" where telegramid =  "${msg.from.id}";`, (error, _result) => {
                    connection.destroy();
                    if (error) return error;
                    main(msg);
                });
            }
        })
    })
});


async function main(msg) {
    if (msg.text.search("/start") == 0) {
        start(msg)
    } else if (msg.text == "🌐立即兑换") {
        duihuan(msg)
    } else if (msg.text == "🌐实时汇率") {
        let duihuanbili_TRX = await calculateDuihuanbili_TRX();
        bot.sendMessage(msg.chat.id, `<b>实时汇率：</b>\n100 USDT = ${(duihuanbili_TRX * 100).toFixed(2)} TRX\n\n自动兑换地址：\n<code>${address}</code> (点击地址自动复制)`, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });
    } else if (msg.text == "💹实时U价") {
        huilv(msg)
    } else if (msg.text == "💰TRX预支") {
        yuzhi(msg)
    } else if (msg.text == "🏠个人中心") {
        usercenter(msg)
    } else if (msg.text == "✳️租赁能量") {
        bot.sendMessage(msg.chat.id, `租赁能量能够节省 <b>70%</b> 日常USDT转账的手续费\n\n点击下方链接立即租赁: \nhttps://t.me/BuyEnergysBot`, {
            parse_mode: 'HTML',
            reply_to_message_id: msg.message_id
        });
    } else if (msg.text == "/admin" && msg.chat.id == adminid) {
        admin(msg)
    } else if (msg.text.search("预支") == 0) {
        bangdingaddress(msg)
    } else if (tronWeb.isAddress(msg.text)) {
        bot.sendMessage(msg.chat.id, '请稍等，正在查询中', {

        })
            .then(res => {
                request(`https://apilist.tronscanapi.com/api/new/token_trc20/transfers?limit=20&start=0&sort=-timestamp&count=true&filterTokenValue=1&relatedAddress=${msg.text}`)
                    .then((body) => {
                        tornPayList = JSON.parse(body).token_transfers;
                        var usdtlist = ""
                        for (let a = 0; a < tornPayList.length; a++) {
                            usdtlist += `${moment(tornPayList[a].block_ts).format("MM-DD HH:mm:ss")} | ${(tornPayList[a].from_address == msg.text) ? "转出" : "转入"} |  ${tornPayList[a].quant / 1000000} USDT\n`
                        }

                        request(`https://apilist.tronscanapi.com/api/accountv2?address=${msg.text}`)
                            .then((body) => {
                                var userList = JSON.parse(body).withPriceTokens;
                                var trxbalance = 0;
                                var usdtbalance = 0;
                                for (let index = 0; index < userList.length; index++) {
                                    if (userList[index].tokenAbbr == "trx") {
                                        trxbalance = userList[index].amount;
                                    }
                                    if (userList[index].tokenId == "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t") {
                                        usdtbalance = userList[index].balance / 1000000;
                                    }

                                }
                                bot.editMessageText(`|            时间            |   类型   |      金额\n<code>${usdtlist}</code>\n\nTRX(可用) :  <code>${trxbalance}</code>\nUSDT :  <code>${usdtbalance}</code>`, {
                                    chat_id: res.chat.id,
                                    message_id: res.message_id,
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{ text: "🔗 查看链上详细数据", url: `https://tronscan.org/#/address/${msg.text}` }],
                                        ]
                                    }
                                });
                            })
                    })
                    .catch(err => {
                        console.log(err)
                        bot.editMessageText(`请求失败，请稍后尝试！`, {
                            chat_id: res.chat.id,
                            message_id: res.message_id,
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "🔗 查看链上详细数据", url: `https://tronscan.org/#/address/${msg.text}` }],
                                ]
                            }
                        });
                    })
            })
    }

}

function bangdingaddress(msg) {
    var address = msg.text.split("预支")[1]
    if (tronWeb.isAddress(address)) {
        pool.getConnection(function (err, connection) {
            if (err) return err;
            connection.query(`select * from users where trxaddress = '${address}' ;`, (error, result) => {
                if (error) return error;
                connection.destroy();
                if (!result[0]) {
                    pool.getConnection(function (err, connection) {
                        if (err) return err;
                        connection.query(`update users set trxaddress = "${address}" where telegramid = '${msg.from.id}' ;`, (error, _result) => {
                            if (error) return error;
                            connection.destroy();
                            bot.sendMessage(msg.chat.id, `✅绑定成功\n新地址：<code>${address}</code> `, {
                                parse_mode: "HTML"
                            })
                        });
                    });
                } else {
                    bot.sendMessage(msg.chat.id, `❌该地址已被其他用户绑定，请更换地址尝试 `, {
                        parse_mode: "HTML"
                    })
                }

            });
        });
    } else {
        bot.sendMessage(msg.chat.id, `❌地址格式有误，请更换地址尝试 `, {
            parse_mode: "HTML"
        })
    }
}

async function calculateDuihuanbili_TRX() {
    try {
        const body = await request(`https://www.okx.com/priapi/v5/market/candles?instId=TRX-USDT`);
        return (1 / parseFloat(JSON.parse(body).data[0][2])) * lirun;
    } catch (error) {
       // console.error(error);
        return null; 
    }
}

async function duihuan(msg) {
    bot.sendMessage(msg.chat.id, '数据更新中，请稍等...', {
        parse_mode: 'HTML'
    }).then(function (sentMsg) {
        // Copyrigth by @miya0v0 
        request(`https://apilist.tronscanapi.com/api/accountv2?address=${centeraddress}`)
            .then(async (body) => {
                var userList = JSON.parse(body).withPriceTokens;
                var trxbalance = 0;
                var usdtbalance = 0;
                for (let index = 0; index < userList.length; index++) {
                    if (userList[index].tokenAbbr == "trx") {
                        trxbalance = userList[index].amount;
                    }
                    if (userList[index].tokenId == "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t") {
                        usdtbalance = userList[index].balance / 1000000;
                    }
                }
                // Copyrigth by @miya0v0 
                // Fetch real-time exchange rates
                let duihuanbili_TRX = await calculateDuihuanbili_TRX();

                bot.editMessageText(`<b>中心钱包余额: </b>\n🔴 <code>${parseFloat(trxbalance).toFixed(2)}</code> TRX\n🔵 <code>${parseFloat(usdtbalance).toFixed(2)}</code> USDT\n\n<b>USDT-TRX汇率：</b>\n100 USDT = <code>${(duihuanbili_TRX * 100).toFixed(2)}</code> TRX\n\n<b>千万要看清最后一条：</b>\n1️⃣进U秒返TRX,  <code>${minCount_USDT}</code>  USDT起兑\n2️⃣如您的TRX不足,请联系客服预支!\n3️⃣<b>千万别用中心化钱包转账,丢失自负!</b>\n\n<b>【单击自动复制地址】</b>\n<code>${address}</code>\n\n⚠️⚠️⚠️ 兑换前注意中心钱包余额再进行兑换!!!` ,{
                    chat_id: msg.chat.id,
                    message_id: sentMsg.message_id,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: start_inline_keyboard
                    }
                });
            })
    });
}

function start(msg) {
    bot.sendMessage(msg.chat.id, `<b>✋${(msg.from.first_name ? msg.from.first_name : "") + (msg.from.last_name ? msg.from.last_name : "")}，欢迎使用闪兑机器人</b>`, {
        parse_mode: "HTML",
        reply_markup: {
            keyboard: keyboard,// Copyrigth by @miya0v0 
            resize_keyboard: true
        }
    })
        .then(async _res => {
            let duihuanbili_TRX = await calculateDuihuanbili_TRX();
            bot.sendMessage(msg.chat.id, `<b>实时兑换汇率:</b>\n100 USDT = ${(duihuanbili_TRX * 100).toFixed(2)} TRX\n\n<b>自动兑换地址:</b>\n<code>${address}</code>  (点击地址自动复制)\n
🔺往上方方地址转USDT,会5秒内自动回你TRX
🔹进U即兑,全自动返TRX,5U起兑;进TRX返U,100TRX起兑
🔸转账前务必请确认地址是否无误
🔸⚠请勿使用交易所或中心化钱包转账，丢失自负！
🔻 建议加入通知频道，避免错过重要通知
💰 如果TRX余额不足以转帐,可自助预支一次转账用的TRX
🌐 交易需要三次区块确认, 预计3分钟内完成闪兑
🎈 有任何问题,请私聊联系老板,双向用户可以私聊机器人

‼注意:请勿使用交易所或中心化钱包转账兑换,丢失自负`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: start_inline_keyboard
                }
            })
        })
}

function yuzhi(msg) {
    pool.getConnection(function (err, connection) {
        if (err) return err;
        connection.query(`SELECT * FROM users where telegramid = '${msg.from.id}' ;`, (error, result) => {
            if (error) return error;
            var userinfo = result[0]
            connection.destroy();
            if (result[0].trxaddress == "未绑定地址") {
                bot.sendMessage(msg.chat.id, `<b>❌请先发送"预支"+你的TRC20地址至机器人</b>`, {
                    parse_mode: "HTML",
                    reply_to_message_id: msg.message_id
                })
            } else if (result[0].balance < 0) {
                bot.sendMessage(msg.chat.id, `<b>❌您当前仍有预支的 ${0 - result[0].balance}TRX 未归还</b>`, {
                    parse_mode: "HTML",
                    reply_to_message_id: msg.message_id
                })
            } else if (result[0].zongliushui < yuzhimenkan) {
                bot.sendMessage(msg.chat.id, `<b>❌您当前累计闪兑小于${yuzhimenkan}TRX,无法使用预支功能</b>`, {
                    parse_mode: "HTML",
                    reply_to_message_id: msg.message_id
                })
            } else {
                tronWeb.trx.sendTransaction(result[0].trxaddress, parseInt(yuzhiamount * 1000000))
                    .then(res => {
                        pool.getConnection(function (err, connection) {
                            if (err) throw err;
                            connection.query(`update users set balance = balance - ${yuzhiamount} where telegramid = "${msg.from.id}";insert into yuzhi (telegramid,amount,address,time) values ("${userinfo.telegramid}",${yuzhiamount},"${userinfo.trxaddress}",now())`, (error, _result) => {
                                if (error) throw error;
                                connection.destroy();
                                bot.sendMessage(adminid, `<b>✅<a href="https://t.me/${userinfo.username}">${userinfo.nickname}</a>预支${yuzhiamount}TRX成功</b>\n\n地址：<code>${userinfo.trxaddress}</code>`, {
                                    parse_mode: 'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{ text: "查看详情", url: `https://tronscan.org/#/transaction/${res.txid}` }]
                                        ]
                                    }
                                });
                                bot.sendMessage(msg.from.id, `<b>✅预支${yuzhiamount}TRX成功,请查收~</b>`, {
                                    parse_mode: 'HTML',
                                    reply_to_message_id: msg.message_id,
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{ text: "查看详情", url: `https://tronscan.org/#/transaction/${res.txid}` }]
                                        ]
                                    }
                                });
                            });
                        }) // Copyrigth by @miya0v0 
                    })
                    .catch(_e => {
                        bot.sendMessage(adminid, `<b>❌预支${yuzhiamount}TRX失败</b>\n\n地址：<code>${userinfo.trxaddress}</code>`, {
                            parse_mode: 'HTML',
                        });
                        bot.sendMessage(msg.from.id, `<b>❌预支${yuzhiamount}TRX失败</b>\n\n地址：<code>${userinfo.trxaddress}</code>\n\n交易哈希：<code>${res.txid}</code>`, {
                            parse_mode: 'HTML',
                        });

                    })
            }

        });
    });
}

function usercenter(msg) {
    pool.getConnection(function (err, connection) {
        if (err) return err;
        connection.query(`SELECT * FROM users where telegramid = '${msg.from.id}' ;`, (error, result) => {
            if (error) return error;
            connection.destroy();
            bot.sendMessage(msg.chat.id, `用户账号：<code>${result[0].telegramid}</code>\n累计闪兑：<code>${result[0].zongliushui}</code> TRX\n当前预支：<code>${(0 - result[0].balance)}</code> TRX\n预支地址：<code>${result[0].trxaddress}</code>`, {
                parse_mode: "HTML",
                reply_to_message_id: msg.message_id
            })
        });
    });
}

function admin(msg) {
    request(`https://apilist.tronscanapi.com/api/accountv2?address=${address}`)
        .then((body) => {
            var userList = JSON.parse(body).withPriceTokens;
            var trxbalance = 0;
            var usdtbalance = 0;
            for (let index = 0; index < userList.length; index++) {
                if (userList[index].tokenAbbr == "trx") {
                    trxbalance = userList[index].amount;
                }
                if (userList[index].tokenId == "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t") {
                    usdtbalance = userList[index].balance / 1000000;
                }

            }
            query(`SELECT * FROM exchange WHERE state = 0 limit 15;SELECT * FROM exchange WHERE state = 1 limit 15;`).then(result => {
                var faillist = ""
                for (let index = 0; index < result[0].length; index++) {
                    faillist += `<code>${result[0][index].to_amount}${result[0][index].to_coin}</code> <code>${result[0][index].to_address}</code>\n`;
                }
                var successlist = ""
                for (let index = 0; index < result[1].length; index++) {
                    successlist += `<code>${result[1][index].to_amount}${result[1][index].to_coin}</code> <code>${result[1][index].to_address}</code>\n`;
                }
                bot.sendMessage(msg.chat.id, `TRX:  <code>${trxbalance}</code>\nUSDT :  <code>${usdtbalance}</code>\n\n失败记录：\n${faillist}\n\n成功记录：\n${successlist}`, {
                    parse_mode: 'HTML',
                });
            })
        })
}

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    if (callbackQuery.data.search("huilvbuy_") != -1) {
        changehuilvbuy(callbackQuery)
    }
    if (callbackQuery.data.search("huilvsell_") != -1) {
        changehuilvsell(callbackQuery)
    }
    if (callbackQuery.data == "back") { // Copyrigth by @miya0v0
        backhuilv(callbackQuery)
    }
});

bot.on('error', (error) => {
    console.log("监听到普通错误：" + error);
});
bot.on('polling_error', (error) => {
    console.log("监听到轮循错误：" + error);
});
bot.on('webhook_error', (error) => {
    console.log("监听到webhook错误：" + error);
});


function changehuilvbuy(msg) {
    var method = msg.data.split("huilvbuy_")[1]
    request({
        url: `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=sell&paymentMethod=${method}&userType=blockTrade&showTrade=false&receivingAds=false&showFollow=false&showAlreadyTraded=false&isAbleFilter=false&urlId=2`, //aliPay wxPay
    }, (error, response, body) => {
        if (!error || response.statusCode == 200) {
            var sendvalue, yhk = "银行卡", zfb = "支付宝", wx = "微信", all = "所有"
            if (method == "bank") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【银行卡实时购买汇率】</b>\n\n";
                yhk = "✅银行卡"
            } else if (method == "aliPay") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【支付宝实时购买汇率】</b>\n\n";
                zfb = "✅支付宝"
            } else if (method == "wxPay") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【微信实时购买汇率】</b>\n\n";
                wx = "✅微信"
            } else if (method == "all") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【实时购买汇率】</b>\n\n";
                all = "✅所有"
            }


            var allprice = 0
            for (let index = 0; index < 10; index++) {
                const element = JSON.parse(body).data.sell[index];
                sendvalue = `${sendvalue}${element.nickName}  ${element.price}\n`
                allprice += parseFloat(element.price)
            }
            sendvalue = `${sendvalue}\n实时价格：1 USDT * ${(allprice / 10).toFixed(5)} = ${((allprice / 10)).toFixed(2)}`
            bot.editMessageText(sendvalue, {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: all, callback_data: "huilvbuy_all" }, { text: wx, callback_data: "huilvbuy_wxPay" }, { text: zfb, callback_data: "huilvbuy_aliPay" }, { text: yhk, callback_data: "huilvbuy_bank" }],
                        [{ text: "返回", callback_data: "back" }],
                    ]
                },
                parse_mode: "HTML",
                disable_web_page_preview: true
            })
        }
    })
}

function backhuilv(msg) {
    bot.editMessageText('<b>选择查看价格类别👇</b>', {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
        reply_markup: {
            inline_keyboard: [
                [{ text: "购买价格", callback_data: "huilvbuy_all" }, { text: "出售价格", callback_data: "huilvsell_all" }]
            ]
        },
        parse_mode: "HTML"
    })
}

function changehuilvsell(msg) {
    var method = msg.data.split("huilvsell_")[1]
    request({
        url: `https://www.okx.com/v3/c2c/tradingOrders/books?quoteCurrency=CNY&baseCurrency=USDT&side=buy&paymentMethod=${method}&userType=blockTrade`, //aliPay wxPay
    }, (error, response, body) => {
        if (!error || response.statusCode == 200) {
            var sendvalue, yhk = "银行卡", zfb = "支付宝", wx = "微信", all = "所有"
            if (method == "bank") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【银行卡实时出售汇率】</b>\n\n";
                yhk = "✅银行卡"
            } else if (method == "aliPay") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【支付宝实时出售汇率】</b>\n\n";
                zfb = "✅支付宝"
            } else if (method == "wxPay") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【微信实时出售汇率】</b>\n\n";
                wx = "✅微信"
            } else if (method == "all") {
                sendvalue = "<b><a href='https://www.okx.com/cn/p2p-markets/cny/buy-usdt'>🐻OKX欧意</a>【实时出售汇率】</b>\n\n";
                all = "✅所有"
            }
            var allprice = 0
            try {
                for (let index = 0; index < 10; index++) {
                    const element = JSON.parse(body).data.buy[index];
                    sendvalue = `${sendvalue}${element.nickName}  ${element.price}\n`
                    allprice += parseFloat(element.price)
                }
                sendvalue = `${sendvalue}\n实时价格：1 USDT * ${(allprice / 10).toFixed(5)} = ${((allprice / 10)).toFixed(2)}`
                bot.editMessageText(sendvalue, {
                    chat_id: msg.message.chat.id,
                    message_id: msg.message.message_id,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: all, callback_data: "huilvsell_all" }, { text: wx, callback_data: "huilvsell_wxPay" }, { text: zfb, callback_data: "huilvsell_aliPay" }, { text: yhk, callback_data: "huilvsell_bank" }],
                            [{ text: "返回", callback_data: "back" }],
                        ]
                    },
                    parse_mode: "HTML",
                    disable_web_page_preview: true
                })
            } catch (e) {
                return
            }
        }
    })
}


function huilv(msg) {
    bot.sendMessage(msg.chat.id, `<b>选择查看价格类别👇</b>`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "购买价格", callback_data: "huilvbuy_all" }, { text: "出售价格", callback_data: "huilvsell_all" }]
            ]
        },
        parse_mode: "HTML"
    });
}


function utf16toEntities(str) {
    const patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则
    str = str.replace(patt, (char) => {
        let H;
        let L;
        let code;
        let s;

        if (char.length === 2) {
            H = char.charCodeAt(0); // 取出高位
            L = char.charCodeAt(1); // 取出低位
            code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法
            s = `&#${code};`;
        } else {
            s = char;
        }

        return s;
    });

    return str;
}

function entitiestoUtf16(strObj) {
    const patt = /&#\d+;/g;
    const arr = strObj.match(patt) || [];

    let H;
    let L;
    let code;

    for (let i = 0; i < arr.length; i += 1) {
        code = arr[i];
        code = code.replace('&#', '').replace(';', '');
        // 高位
        H = Math.floor((code - 0x10000) / 0x400) + 0xD800;
        // 低位
        L = ((code - 0x10000) % 0x400) + 0xDC00;
        code = `&#${code};`;
        const s = String.fromCharCode(H, L);
        strObj = strObj.replace(code, s);
    }
    return strObj;
}

// 监听USDT交易
async function listenUSDT(usdturl) {
    console.log("开始监听USDT", usdturl)
    var tornPayList;
    let duihuanbili_TRX = await calculateDuihuanbili_TRX();
    request(usdturl)
        .then((body) => {
            tornPayList = JSON.parse(body).data;
            for (let a = 0; a < tornPayList.length; a++) {
                if (tornPayList[a].type == "Transfer" && tornPayList[a].value / 1000000 >= minCount_USDT && tornPayList[a].block_timestamp + 600000 > Math.round(new Date())) {
                    query(`SELECT * FROM exchange where from_transaction_id = "${tornPayList[a].transaction_id}";`).then(result => {
                        if (!result[0] && tornPayList[a].value && tornPayList[a].to == address && tornPayList[a].to != tornPayList[a].from && cunbiaddress != tornPayList[a].from) {
                            let usdtAmount = tornPayList[a].value / 1000000;
                            let trxTimestamp = tornPayList[a].block_timestamp; // 获取交易时间戳
                            query(`select * from users where trxaddress = "${tornPayList[a].from}";update users set balance = 0 where trxaddress = "${tornPayList[a].from}";INSERT INTO exchange (from_amount,from_coin,from_transaction_id,from_address,to_coin,to_address,timestamp,time) VALUES ("${usdtAmount}","USDT","${tornPayList[a].transaction_id}","${tornPayList[a].from}","TRX","${address}",unix_timestamp(),now() );`)
                                .then(e => {
                                    transferTRX(tornPayList[a].from, (usdtAmount * duihuanbili_TRX) + (e[0][0] ? e[0][0].balance : 0), tornPayList[a].transaction_id, usdtAmount, trxTimestamp) // 传递新的参数
                                })
                        }
                    })
                }
            }
        })
}

// TRX 转账
function transferTRX(trx_address, amount, txID, usdtAmount, trxTimestamp) {
    tronWeb.trx.sendTransaction(trx_address, parseInt(amount * 1000000))
        .then(res => {
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(`select * from users where trxaddress = "${trx_address}";update exchange set to_transaction_id = "${res.txid}",to_amount = "${amount}",state = 1 where from_transaction_id = "${txID}";update users set zongliushui = zongliushui + ${amount} where trxaddress = "${trx_address}";`, (error, result) => {
                    if (error) throw error;
                    connection.destroy();

                    // 更改地址显示格式
                    const modifiedAddress = `${trx_address.slice(0,6)}****${trx_address.slice(-6)}`;

                    // 使用日期对象解析时间戳
                    const dateTimeObj = new Date(trxTimestamp);
                    const date = dateTimeObj.toISOString().split('T')[0];
                    const time = dateTimeObj.toISOString().split('T')[1].split('.')[0];
                    const dateTime = `${date} ${time}`;

                    // 更改通知格式
                    bot.sendMessage(adminid, `<b>✅成功闪兑通知</b>\n\n闪兑地址：<code>${modifiedAddress}</code>\n闪兑金额：<b>${usdtAmount.toFixed(2)} USDT >> ${parseFloat(amount).toFixed(2)} TRX</b>\n闪兑时间：<b>${dateTime}</b>`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "查看详情", url: `https://tronscan.org/#/transaction/${res.txid}` }]
                            ]
                        }
                    });
                    for (var i = 0; i < successqunid.length; i++) {
                        bot.sendMessage(successqunid[i], `<b>✅成功闪兑通知</b>\n\n闪兑地址：<code>${modifiedAddress}</code>\n闪兑金额：<b>${usdtAmount.toFixed(2)} USDT >> ${parseFloat(amount).toFixed(2)} TRX</b>\n闪兑时间：<b>${dateTime}</b>`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "查看详情", url: `https://tronscan.org/#/transaction/${res.txid}` }]
                                ]
                            }
                        });
                    }

                    if (result[0][0]) {
                        bot.sendMessage(result[0][0].telegramid, `<b>✅成功闪兑通知</b>\n\n闪兑地址：<code>${modifiedAddress}</code>\n闪兑金额：<b>${usdtAmount.toFixed(2)} USDT >> ${parseFloat(amount).toFixed(2)} TRX</b>\n闪兑时间：<b>${dateTime}</b>`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "查看详情", url: `https://tronscan.org/#/transaction/${res.txid}` }]
                                ]
                            }
                        });
                    }
                });
            })
        })
        .catch(_e => {
            pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(`update exchange set to_amount = "${amount}",state = 0 where from_transaction_id = "${txID}";`, (error, _result) => {
                    if (error) throw error;
                    connection.destroy();
                    bot.sendMessage(adminid, `<b>❌闪兑 <code>${amount}</code> TRX失败</b>\n\n地址：<code>${trx_address}</code>`, {
                        parse_mode: 'HTML',
                    });
                });
            })

        })
}


function query(sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {

                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}
