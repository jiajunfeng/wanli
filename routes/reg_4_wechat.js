/**
 * Created by King Lee on 14-11-19.
 */
var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var userInfo = require('./userInfo.js').userInfo;
var userManager = require('./userManager.js');
var login = require('./login.js');
var user = require('./user.js');

//当用户点击登陆按钮时被触发
exports.onRegForWeChat = function(req,res){
    log("---- user reg ------");

    var info = new userInfo();
    info.uid = userManager.GetInstance().getCurUserId();
    info.openid = req.body['openid'];
    info.name = "";
    info.password = "";
    info.birthday = "1990010101";
    info.regTime = "1990010101";
    info.sex = 1;
    info.registAddress = 1;
    info.birthAddress = 1;
    info.vipLevel = 0;

    //构建轴向数据
    var dateStr = info.birthday;
    var clock = parseInt(dateStr.substr(8, 2));
    //如果是忘记时辰，就给默认成子时
    if (clock > 11 || clock == 0) {
        clock = 0;
    }
    else {
        clock = clock * 2 - 1;
    }

    var reqData = {
        sex: parseInt(info.sex),
        registAddress: parseInt(info.registAddress),
        birthAddress: parseInt(info.birthAddress),
        year: parseInt(info.birthday.substr(0, 4)),
        month: parseInt(info.birthday.substr(4, 2)),
        day: parseInt(info.birthday.substr(6, 2)),
        clock: parseInt(clock)
    }

    dataInfo = user.getUserInfo(reqData);


    info.flystar = dataInfo.bigyun.toString() + dataInfo.smallyun + dataInfo.nianyun + dataInfo.yueyun + dataInfo.riyun + dataInfo.shiyun;
    info.birthWS = dataInfo.birthWS;
    info.sjWS = dataInfo.sjWS;
    info.clockWS = dataInfo.scWS;
    info.gz = dataInfo.ngz+dataInfo.ygz + dataInfo.rgz + dataInfo.sgz;
    info.ts = dataInfo.niants + dataInfo.yuets + dataInfo.rits + dataInfo.shits;
    info.sp = dataInfo.niansp + dataInfo.yuesp + dataInfo.risp + dataInfo.shisp;
    info.starNum = dataInfo.starNum;
    info.yangSum = dataInfo.yangSum1;
    info.queNum = dataInfo.queNum;
    info.sjIndex = dataInfo.sjIndex;

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    db.addUser(info, function (err) {
        result = { error: "" };
        if (err) {
            console.log("a error ocurr when add user:");
            console.log(err);
            result.error = err;
        }
        else {
            log("user:" + info.name + " regist with password:" + info.password);
            result.uid = info.uid;
        }
        res.end(JSON.stringify(result));
    });
};