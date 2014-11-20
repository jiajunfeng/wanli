var crypto = require('crypto');
var mysqlConfig = require('../config/mysql');
var db = require('./mysql/dboperator');
var tools = require('./tools/tools')
var log = require('../common').log;
var common = require("../common");
var user = require('./user');
var todayInfo = require('./todayInfo.js');
var userManager = require('./userManager.js');
var apn = require('apn');
var userInfo = require('./userInfo.js').userInfo;
var Push = require('./baidu_pushserver.js');
var log4js = require('log4js');
var log_json = require('../config/log.json');
log4js.configure(log_json);
var push_logger = log4js.getLogger('push-logger');

var child_process = require('child_process');
var apn = require('apn');
var CronJob = require('cron').CronJob;
var wxIndex = -1;
var monthStar = 0;
var dayStar = 0;
var monthGZ = "";
var dayGZ = "";
var isMonthStar = false;


process.on('message', function (m) {
    console.log('CHILD got message:', m.cmd);

    if (m.cmd == "start") {
        common.init(true);
        //console.log("[" + process.env.TZ + "]");
        startwork();
    }
    //process.send({ foo: 'bar' });
});

function startwork() {
    //每天九点发布，cron表达式
    //new CronJob('0 0 9 * * *', function () {
    //    //console.log('You will see this message every day 9 clock');
    //    pushMsgToUsers();
    //}, null, true, "China/Beijing");

    pushMsgToUsers();
}

//Android 发送推送通知
function pushMsg(client) {
    var msg = {
        //android必选，ios可选
        title: "hello",
        description: "hello world"
    };

    var opt = {
        push_type: 3,
        user_id: id0,
        message_type: 1,
        messages: JSON.stringify(msg),
        msg_keys: "msg_key"
        //messages: JSON.stringify(["hello, push0", "hello, push1", "hello, push2"]),
        //msg_keys: JSON.stringify(["key0", "key1"])
    }
    client.pushMsg(opt, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
    })
}

function sendMsg(userInfo, msg) {
    console.log("Send Msg to " + userInfo.userid + " msg=" + msg);

    //var token = '40679ad3 7e38ee2c 2d5c58a0 ce801cad e97e5004 b6043dfc 945ab46f 483ff5fa'; //长度为64的设备Token
    //console.log("token=" + userInfo.token);
    //IOS发送推送通知
    if (userInfo.os == 0) {
        var options = { "gateway": "gateway.sandbox.push.apple.com" },
            apnConnection = new apn.Connection(options),
            device = new apn.Device(userInfo.token),
            note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 60;
        note.badge = 3;
        note.alert = msg;
        note.payload = { 'messageFrom': 'Caroline' };

        apnConnection.pushNotification(note, device);
    }
    else if (userInfo.os == 1) {
        var opt = {
            ak: '6VQ1VXaxYuwf9h4DPLlNgz8Y',
            sk: 'Tn3OpZ2qxfzEOx832wn3XwxDNTAlAsnd'

        };
        var client = new Push(opt);
        
        var message = {
            //android必选，ios可选
            title: "万历提醒",
            description: msg
        };

        var opt = {
            push_type: 3,
            user_id: userInfo.token,
            message_type: 1,
            messages: JSON.stringify(message),
            msg_keys: "msg_key"
        }
        client.pushMsg(opt, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
        })
        
    }
}
/**
@param ttType 检查的类型 1： 月消息 2：日消息
*/
function checkMsg(userInfo,ttType) {
    //检查是否需要发送，首先检查前四项，如果有，发送退出，如果没有，检查后面的(根据生日年飞星，确定对象，男女，确定属性，看看当前四级，是否排除，如果不排除，确定当时和前一个飞星，看看是否排除，如果不排除，那发送)
    var date = new Date();
    //首先检验前四项
    var tsJson = common.getDataJson()["tsdata"]; //推送Json对象
    var mainMsgs = tsJson[0];
    var wxStr = wxIndex.toString();
    var skip = false;

    var ycScore = user.getScoreByDate(userInfo, 0, ttType, date); //当日/月运程
    var nlScore = user.getScoreByDate(userInfo, 3, ttType, date); //当日/月能量
    var pycScore = user.getScoreByDate(userInfo, 0, ttType - 1, date); //当月/年运程
    var pnlScore = user.getScoreByDate(userInfo, 3, ttType - 1, date); //当月/年运程
    //console.log("yx=" + ycScore + " nl=" + nlScore + " pyx=" + pycScore + " pnl=" + pnlScore);

    for (var i = 0, count = mainMsgs.length; i < count; i++) {
        var mainMsg = mainMsgs[i];
        var wxs = mainMsg["wx"];
        //console.log("--->wx = " + wxs + " yearstar=" + userInfo.yearstar + " wx=" + wxs[userInfo.yearstar - 1]);
        //检验五行    
        if (wxs[userInfo.yearstar - 1].indexOf(wxStr) < 0) {
            if ((i == 0 && ycScore >= mainMsg["yc"] && nlScore >= mainMsg["nl"] && pycScore >= mainMsg["pyc"] && pnlScore >= mainMsg["pnl"])
                || (i == 1 && ycScore < mainMsg["yc"] && nlScore < mainMsg["nl"] && pycScore < mainMsg["pyc"] && pnlScore < mainMsg["pnl"])
                || (i == 2 && ycScore >= mainMsg["yc"] && nlScore < mainMsg["nl"] && pycScore >= mainMsg["pyc"] && pnlScore < mainMsg["pnl"])
                || (i == 3 && ycScore < mainMsg["yc"] && nlScore >= mainMsg["nl"] && pycScore < mainMsg["pyc"] && pnlScore >= mainMsg["pnl"])) {

                //概率85%
                if (Math.random() < 0.85) {
                    //这里发送主消息，并返回
                    var msgs = mainMsg["msg"];
                    var msgStr = msgs[Math.floor(Math.random() * msgs.length)];
                    sendMsg(userInfo, msgStr.replace("（日）", "月"));
                    push_logger.debug(msgStr.replace("（日）", "月"));
                    return true;
                }
            }
        }
    }


    //检验后面的

    //首先看看是否岁破
    var sp = "";
    var isSp = false;
    if (ttType == 1) { //月
        sp = userInfo.sp.substr(2, 2);
        isSp = (sp.indexOf(monthGZ) >= 0);
    }
    else {
        sp = userInfo.sp.substr(3, 1);
        isSp = (sp.indexOf(dayGZ) >= 0);
    }
    if (isSp) {
        return false; //岁破时，略过
    }

    //首先根据出生年飞星，确定对象
    var msgs = tsJson[1][userInfo.yearstar - 1];
    //获得当前飞星，确定当前对象
    var star = (ttType == 1 ? user.getMonthStar(date) : user.getDayStar(date));
    if (userInfo.sex == 0) {
        star = user.getNvYun(star);
    }
    var msg = msgs[star - 1];
    var sjStr = msg["sjstr" + userInfo.sex];
    //console.log("--->sjStr=" + sjStr + " wxStr=" + wxStr);
    if (sjStr.indexOf(wxStr) < 0) { //首先用四季排除
        var preStar = (ttType == 1 ? user.getYearStar(date) : user.getMonthStar(date));
        if (userInfo.sex == 0) {
            preStar = user.getNvYun(preStar);
        }
        var starStr = msg["pstar" + userInfo.sex];
        if (starStr.indexOf(preStar) < 0) {

            //计算概率
            var gl = 0.65;

            if (ttType == 1) { //月概率算法
            }
            else { //日概率算法

                //年月日飞星中star的数量  //年月日都是star,+9%,只有两个是+4%
                var starCount = 0;
                for (var j = 2 ; j < 5 ; j++) {
                    if (userInfo.flystar.substr(j, 1) == star.toString()) {
                        starCount++;
                    }
                }
                if (starCount == 3) {
                    gl += 0.09;
                } else if (starCount == 2) {
                    gl += 0.04;
                }

                //太岁  //月日都是太岁 + 8%,只有一个 + 5%
                var tsCount = 0;
                if (userInfo.ts.substr(1, 2) == monthGZ) {
                    tsCount++;
                }
                if (dayGZ.indexOf(userInfo.ts.substr(3, 1)) >= 0) {
                    tsCount++;
                }
                if (tsCount == 2) {
                    gl += 0.08;
                }
                else if (tsCount == 1) {
                    gl += 0.05;
                }

                //本飞星，除年飞星外还含有star +8%
                var otherStar = userInfo.flystar.substr(0, 2) + userInfo.flystar.substr(3, 3);
                if (otherStar.indexOf(star.toString()) >= 0) {
                    gl += 0.08;
                }

                //满足季节条件+8%
                if (msg["sjIndex"].indexOf(wxIndex.toString()) >= 0) {
                    gl += 0.08;
                }
            }


            if (Math.random() < gl) {
                //这里发送消息，并退出
                var msgstrss = msg["msg"];
                var msgStr = msgstrss[Math.floor(Math.random() * msgstrss.length)];
                sendMsg(userInfo, msgStr.replace("（日）", "日"));
                push_logger.debug(msgStr.replace("（日）", "月"));
                return true;
            }
        }
    }
    return false;
}

function onRowReady(userInfo) {
    if (!checkMsg(userInfo, 2)) {
        if (isMonthStart) {          //只有开月第一天才检查月信息
            checkMsg(userInfo, 1);
        }
    }
}

function pushMsgToUsers(cb) {
    //首先从数据库中提取所有人的信息，检查是否要发送当日的，如果要，看看上次发到第几条了，++,发送，退出
    //如果不需要，看看是否已经发送了当月的，如果还没有，看看是否发送，如果是，看看发送到第几条了（这个可以考虑用随机函数),++,发送
    //检查是否需要发送，首先检查前四项，如果有，发送退出，如果没有，检查后面的(根据生日年飞星，确定对象，男女，确定对象，看看当前四季，是否排除，如果不排除，确定当前和前一个飞星，看看是否排除，如果不排除，那发送)


    db.getAllUser(function (res, err) {
        //查询失败
        if (err) {
            console.log("Error: pushMsgToUsers " + err);
        }
        else {
            //首先把公用数据计算出来
            var date = new Date();
            wxIndex = user.getWx(date);          //四季索引
            monthStar = user.getMonthStar(date); //当前月飞星
            dayStar = user.getDayStar(date);     //当前日飞星
            isMonthStart = user.isMonthStart(date); //当天是否是一个月的开始

            var bz = user.buildBZ(date); //当日八字
            
            monthGZ = bz.bz_jy;   //月干支
            dayGZ = bz.bz_jr;     //日干支
            //console.log("monthGZ = " + monthGZ + " dayGZ=" + dayGZ);
            //console.log("wx=" + wxIndex + " month=" + monthStar + " day=" + dayStar);

            var userInfo = new Object();
            for (var i = 0, count = res.length; i < count; i++) {
                var row = res[i];
                var info = { birthWS: row["birthWs"], sjWS: row["sjWs"], clockWS: row["clockWs"] };
                var key = "basenum1";
                //处理基础分值
                if (info.birthWS > 0 && info.sjWS && info.clockWS) {
                    key = "basenum1";
                }
                else if (info.birthWS > 0 && info.sjWS && !info.clockWS) {
                    key = "basenum2";
                }
                else if (!info.birthWS > 0 && !info.sjWS && info.clockWS) {
                    key = "basenum3";
                }
                else if (!info.birthWS > 0 && !info.sjWS && !info.clockWS) {
                    key = "basenum4";
                }
                else if (!info.birthWS > 0 && info.sjWS && info.clockWS) {
                    key = "basenum5";
                }
                else if (!info.birthWS > 0 && info.sjWS && !info.clockWS) {
                    key = "basenum6";
                }
                else if (info.birthWS > 0 && !info.sjWS && info.clockWS) {
                    key = "basenum7";
                }
                else if (info.birthWS && !info.sjWS && !info.clockWS) {
                    key = "basenum8";
                }
                userInfo.baseNum = row[key];
                userInfo.userid = row["user_id"];
                userInfo.sex = row["sex"];
                userInfo.flystar = row["flystar"];
                userInfo.token = row["deviceid"];
                userInfo.os = row["user_os"];
                userInfo.sp = row["sp"];
                userInfo.ts = row["ts"];
                userInfo.yearstar = parseInt(userInfo.flystar.charAt(2));
                onRowReady(userInfo);
            }
            push_logger.debug("get push msg user count = " + res.length);
        }

    });

}
