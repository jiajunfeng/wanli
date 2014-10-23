// mysql CRUD
var operater = module.exports;
var todayInfo = require('../todayInfo.js');
var log = require('../../common').log;
var mysqlClient = require('./mysqlclient').init();
var user = require("../user.js");
var common = require("../../common.js");


var teststr = "{ \"a\":\"test value\",\"b\":32}";
var testval = JSON.parse(teststr);


function fixNum(maxNum, baseNum) {
    return ((8 * baseNum - 64) / 114 + maxNum - 8).toFixed(1);
}

function fixStar(star) {
    if (star > 9) {
        star = 1;
    }
    if (star < 1) {
        star = 9;
    }
    return star;
}

operater.addUser = function(info,cb){
    var sql = "insert into user_table(user_id, name, sex, birthday,staryear, birthAddress, regAddress,regTime,passwd,viplevel,flystar,sjWs,birthWs,yueNum,yangSum,clockWs,gz,ts,sp,queNum,sjIndex) values('"
        + info.uid + "','" + info.name + "'," + info.sex + ",'" + info.birthday + "','" + user.getStarYear(new Date(info.birthday.substr(0, 4) + "/" + info.birthday.substr(4, 2) + "/" + info.birthday.substr(6, 2))).substr(2, 2) + "'," + info.birthAddress + ","
        + info.registAddress + ",'" + info.regTime + "','" + info.password + "'," + info.vipLevel + ",'" + info.flystar + "'," + (info.sjWS ? "1" : "0") + "," + info.birthWS + ","
        + info.starNum + "," + info.yangSum + "," + (info.clockWS ? "1" : "0") + ",'" + info.gz + "','" + info.ts + "','" + info.sp + "','" + info.queNum + "'," + info.sjIndex + ");";

    console.log(sql);

    mysqlClient.insert(sql, null, function (err) {
		if(cb){
			cb.call(err);
		}
	});
}

operater.ModifyUser = function (info, cb) {
    var values = [info.name, info.sex, info.birthday, user.getStarYear(new Date(info.birthday.substr(0, 4) + "/" + info.birthday.substr(4, 2) + "/" + info.birthday.substr(6, 2))).substr(2, 2),
        info.birthAddress, info.password, info.flystar, (info.sjWS ? "1" : "0"), info.birthWS, info.starNum, info.yangSum, (info.clockWS ? "1" : "0"), info.gz, info.ts, info.sp, info.queNum, info.sjIndex, info.uid];
    var sql = "update user_table set name= ? ,sex= ? ,birthday= ? ,staryear= ? ,birthAddress= ? ,passwd= ? ,flystar= ? ,sjWs= ? ,birthWs= ? ,yueNum= ? ,yangSum= ? ,clockWs= ? ,gz= ? ,ts= ? ,sp= ?,queNum= ? ,sjIndex= ? where user_id= ?;"

        //"(user_id, name, sex, birthday,staryear, birthAddress, regAddress,regTime,passwd,viplevel,flystar,sjWs,birthWs,yueNum,yangSum,clockWs,gz,ts,sp,queNum,sjIndex) values('"+ info.sjIndex + ");"
        //+ info.uid + "','" + info.name + "'," + info.sex + ",'" + info.birthday + "','" + user.getStarYear(new Date(info.birthday.substr(0, 4) + "/" + info.birthday.substr(4, 2) + "/" + info.birthday.substr(6, 2))).substr(2, 2) + "'," + info.birthAddress + ","
        //+ info.registAddress + ",'" + info.regTime + "','" + info.password + "'," + info.vipLevel + ",'" + info.flystar + "'," + (info.sjWS ? "1" : "0") + "," + info.birthWS + ","
        //+ info.starNum + "," + info.yangSum + "," + (info.clockWS ? "1" : "0") + ",'" + info.gz + "','" + info.ts + "','" + info.sp + "','" + info.queNum + "'," + info.sjIndex + ");";

    mysqlClient.update(sql, values, function (err) {
        if (err) {
            console.log(sql);
            console.log(err);
        }
        if (cb) {
            cb.call(err);
        }
    });
}

operater.getMaxId = function (cb) {
    var sql = "select max(cast(user_id as signed)) as curId from user_table;";
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select max(user_id) from user_table;");
            console.log(err);
        }
        else {
            var curId = 0;
            if (res[0]["curId"]) {
                curId = parseInt(res[0]["curId"]);
            }
            cb.call(null,err, curId);
                
        }
    });
}

operater.userLogin = function (info, cb) {
    var sql = "select * from user_table where user_id='" + info.uid + "' and passwd='" + info.password + "';";
    //log(sql);
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select userinfo from user_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null, "用户名密码错误");
            }
            else {
                //info.name = res[0]['name'];
                //info.sex = res[0]['sex'];
                //info.birthday = res[0]['birthday'];
                //info.regTime = res[0]['regTime'];
                //info.registAddress = res[0]['regAddress'];
                //info.birthAddress = res[0]['birthAddress'];
                //log("user login who's user_id = " + info.uid);
                cb.call(null, false);
            }
        }
    });
}


operater.getUserInfo = function(info, cb){
    var sql = "select * from user_table where user_id='" + info.uid + "';";
    //log(sql);
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error:1 ocuor when select userinfo from user_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null, "没有这个账号");
            }
            else {
                info.name = res[0]['name'];
                info.sex = res[0]['sex'];
                info.birthday = res[0]['birthday'];
                info.regTime = res[0]['regTime'];
                info.registAddress = res[0]['regAddress'];
                info.birthAddress = res[0]['birthAddress'];
                info.vipLevel = res[0]['viplevel'];
                info.flystar = res[0]['flystar'];
                info.birthWS = res[0]['birthWs'];
                info.sjWS = res[0]['sjWs'];
                info.clockWS = res[0]['clockWs'];
                info.gz = res[0]['gz'];
                info.ts = res[0]['ts'];
                info.sp = res[0]['sp'];
                info.starNum = res[0]['starNum'];
                info.yangSum = res[0]['yangSum'];
                info.queNum = res[0]['queNum'];
                info.colour = res[0]['colour'];

                //注册信息获取完毕，获取其他信息
                operater.getBaseNum(info, cb);
            }
        }
    });
}

operater.getUserBaseInfo = function(info, cb){
    var sql = "select * from user_table where user_id='" + info.uid + "';";
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error:1 ocuor when select userinfo from user_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null, "没有这个账号");
            }
            else {
                info.name = res[0]['name'];
                info.sex = res[0]['sex'];
                info.birthday = res[0]['birthday'];
                info.regTime = res[0]['regTime'];
                info.registAddress = res[0]['regAddress'];
                info.birthAddress = res[0]['birthAddress'];
                info.vipLevel = res[0]['viplevel'];
                info.flystar = res[0]['flystar'];
                info.birthWS = res[0]['birthWs'];
                info.sjWS = res[0]['sjWs'];
                info.clockWS = res[0]['clockWs'];
                info.gz = res[0]['gz'];
                info.ts = res[0]['ts'];
                info.sp = res[0]['sp'];
                info.starNum = res[0]['starNum'];
                info.yangSum = res[0]['yangSum'];
                info.queNum = res[0]['queNum'];
                cb(err);
            }
        }
    });
}

operater.getFlyStarsByUID = function(uid,cb){
    var sql = "select flystar from user_table where user_id='" + uid + "';";
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error:1 ocuor when select flystar from user_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null, "没有这个账号");
            }
            else {
                cb(err,res[0]['flystar']);
            }
        }
    });
};

//获得基础数据
operater.getBaseNum = function(info,cb){
    var flystar = info.flystar;

    var key = "basenum1";
    if (info.birthWS > 0  && info.sjWS && info.clockWS) {
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
    
    
    var sql = "select " + key + ",jxNum from ming_table where flystar ='" + flystar + "' and sex=" + info.sex + ";";
    //console.log(sql);
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select basenum from ming_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null, "没有找到基础数据");
            }
            else {
                info.baseNum = res[0][key];
                info.jxNum = res[0]['jxNum'];
                log("key=" + key + " baseNum=" + info.baseNum + " flystar=" + flystar + " and sex=" + info.sex);
                //cb.call(null, false);
                operater.getRsjy(info, cb);
            }
        }
    });
}

//获得人生谏言
operater.getRsjy = function (info, cb) {
    var sql = "select jianyan from jianyan_table where nianstar =" + info.flystar.substr(2,1) + " and sex=" + info.sex + ";";
    //console.log(sql);
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select jianyan from jianyan_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null, "没有找到谏言数据");
            }
            else {
                info.rsjy = res[0]['jianyan'];
                operater.getBaseXg(info, cb);
            }
        }
    });
}



//获得基本性格
operater.getBaseXg = function (info, cb) {
    var sql = "select basexg,otherxg from basexg_table where (yangsum1 =" + info.yangSum + " or yangsum1 = " + info.yangSum.toString().split("").reverse().join("").toString() + ") and yearstar=" + info.flystar.substr(2, 1) + " and monthstar = " + info.flystar.substr(3, 1) + ";";
    //log(sql);
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select basexg from basexg_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                log(sql);
                log("没有找到基本性格数据");
                cb.call(null, "没有找到基本性格数据");
            }
            else {
                info.baseXg = res[0]['basexg'];
                info.buchongXg = res[0]['otherxg'];  //补充性格
                operater.getOtherXg(info, cb);
            }
        }
    });
}

//获得其他性格
operater.getOtherXg = function (info, cb) {
    var queNum = info.queNum.replace(",", "");
    if (!queNum) {
        queNum = "0";
    }
    var sql = "select mainbz,otherxg,otherbz from otherxg_table where quenum =" + queNum + ";";
    //log(sql);
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select * from otherxg_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                log(sql);
                log("没有找到其他性格数据");
                cb.call(null, "没有找到其他性格数据");
            }
            else {
                info.td = res[0]['otherxg'];
                info.mainBz = res[0]['mainbz'];
                info.qd = res[0]['otherbz'];
                cb.call(null, false);
                //operater.getCurNum(info, cb);
            }
        }
    });
}

//获得年运描述
operater.getYearYun = function (info, star, cb) {
    
    if (info.version > 0) {

        var sql = "select sex,flystar from user_table where user_id='" + info.uid + "';";
        log(sql);
        mysqlClient.query(sql, null, function (err, res) {
            if (err) {
                console.log("Error:1 ocuor when select userinfo from user_table;");
                console.log(err);
                cb.call(null, err);
            }
            else {
                if (res.length <= 0) {
                    cb.call(null, "没有这个账号");
                }
                else {
                    info.sex = res[0]['sex'];
                    var flystar = res[0]['flystar'];
                    var birthYearStar = parseInt(flystar.substr(2, 1));

                    //首先计算运程相关的
                    //计算当其旺衰
                    var dataJson = common.getDataJson();
                    var curDate = new Date();
                    var yearStar = user.getYearStar(curDate);
                    var smallStar = user.getSmallStar(curDate);

                    if (info.sex == 0) {
                        yearStar = user.getNvYun(yearStar);
                        smallStar = user.getNvYun(smallStar);
                    }

                    var dqws = (dataJson.yun.dqws[info.sex][yearStar - 1].indexOf(smallStar.toString()) >= 0);
                    var yearYun = new Object();
                    info.yearYun = yearYun;
                    var array = new Array();
                    yearYun[yearStar.toString()] = array; //第一层子，标志为当前的年飞星

                    var ycYun = new Array();
                    var descJson = dataJson.yun.desc[info.sex][birthYearStar - 1][yearStar - 1];
                    ycYun.push(descJson.yc[dqws ? 0 : 1]); //运程
                    ycYun.push(descJson.jk);
                    array.push(ycYun);

                    var cfYun = new Array();
                    cfYun.push(descJson.sy);
                    cfYun.push(descJson.qc);
                    array.push(cfYun);

                    var thYun = new Array();
                    thYun.push(descJson.qb);
                    thYun.push(descJson.th);
                    array.push(thYun);
                    cb.call(null, false);
                }
            }
        });
    }
    else {
        var sql = "select * from nianyun_table a,user_table b where a.curyear=" + star + " and a.sex=" + info.sex + " and  a.birthyear = CONVERT( b.staryear , SIGNED ) and b.user_id='" + info.uid + "';";
        log(sql);
        mysqlClient.query(sql, null, function (err, res) {
            if (err) {
                console.log("Error ocuor when select * from nianyun_table;");
                log(sql);
                console.log(err);
                cb.call(null, err);
            }
            else {
                if (res.length <= 0) {
                    cb.call(null, "没有找到年运数据");

                    console.log(null, "没有找到年运数据 star=" + star + " sex=" + info.sex);
                    console.log(sql);
                }
                else {
                    var nlg = JSON.parse(res[0]['nlhight']);
                    var nlz = JSON.parse(res[0]['nlmid']);
                    var nld = JSON.parse(res[0]['nllower']);
                    var syg = JSON.parse(res[0]['syhight']);
                    var syz = JSON.parse(res[0]['symid']);
                    var syd = JSON.parse(res[0]['sylower']);
                    var qgg = JSON.parse(res[0]['qghight']);
                    var qgz = JSON.parse(res[0]['qgmid']);
                    var qgd = JSON.parse(res[0]['qglower']);

                    info.yearYun = new Object();
                    info.yearYun[star.toString()] = [[nlg, nlz, nld], [syg, syz, syd], [qgg, qgz, qgd]];
                    cb.call(null, false);
                    //operater.getTodayYun(info, cb);
                }
            }
        });
    }
}


//获得当日运气描述
operater.getMonthYun = function (info, star, cb) {

    if (info.version > 0) {
        var sql = "select sex,flystar from user_table where user_id='" + info.uid + "';";
        //log(sql);
        mysqlClient.query(sql, null, function (err, res) {
            if (err) {
                console.log("Error:1 ocuor when select userinfo from user_table;");
                console.log(err);
                cb.call(null, err);
            }
            else {
                if (res.length <= 0) {
                    cb.call(null, "没有这个账号");
                }
                else {
                    info.sex = res[0]['sex'];
                    var flystar = res[0]['flystar'];
                    var birthYearStar = parseInt(flystar.substr(2, 1));

                    //首先计算运程相关的
                    //计算当其旺衰
                    var dataJson = common.getDataJson();
                    var curDate = new Date();


                    //计算日运
                    var dayStar = user.getDayStar(curDate);
                    var monthStar = user.getMonthStar(curDate);

                    if (info.sex == 0) {
                        dayStar = user.getNvYun(dayStar);
                        monthStar = user.getNvYun(monthStar);
                    }
                    
                    var dqws = (dataJson.yun.dqws[info.sex][birthYearStar - 1].indexOf(monthStar.toString()) >= 0);
                    var dayYun = new Object();
                    info.dayYun = dayYun;
                    var array = new Array();
                    dayYun[dayStar.toString()] = array; //第一层子，标志为当前的年飞星

                    var ycYun = new Array();
                    descJson = dataJson.yun.desc[info.sex][birthYearStar - 1][dayStar - 1];
                    ycYun.push(descJson.yc[dqws ? 0 : 1]); //运程
                    ycYun.push(descJson.jk);
                    array.push(ycYun);

                    var cfYun = new Array();
                    cfYun.push(descJson.sy);
                    cfYun.push(descJson.qc);
                    array.push(cfYun);

                    var thYun = new Array();
                    thYun.push(descJson.qb);
                    thYun.push(descJson.th);
                    array.push(thYun);

                    cb.call(null, false);
                }
            }
        });
    }
    else {

        //var sql = "select nl" + gzd + ",sy" + gzd + ",qg" + gzd + " from riyun_table where sex=" + info.sex + " and birthyear=" + info.birthday.substr(2, 2) + " and curmonth=" + 1 + " and curday=" + 1 + ";";
        var sql = "select * from riyun_table a,user_table b where a.sex=" + info.sex + " and a.birthyear = CONVERT( b.staryear , SIGNED )  and a.curmonth=" + star + " and b.user_id = " + info.uid + ";";
        log(sql);
        mysqlClient.query(sql, null, function (err, res) {
            if (err) {
                console.log("Error ocuor when select * from riyun_table;");
                console.log(err);
                log(sql);
                cb.call(null, err);
            }
            else {
                if (res.length <= 0) {
                    console.log("没有找到日运数据");
                    console.log(sql);
                    cb.call(null, "没有找到日运数据");
                }
                else {
                    info.monthYun = new Object();
                    var obj = new Object();
                    info.monthYun[star.toString()] = obj;
                    for (var i = 0 ; i < res.length; i++) {
                        var nlg = JSON.parse(res[i]['nlhight']);
                        var nlz = JSON.parse(res[i]['nlmid']);
                        var nld = JSON.parse(res[i]['nllower']);
                        var syg = JSON.parse(res[i]['syhight']);
                        var syz = JSON.parse(res[i]['symid']);
                        var syd = JSON.parse(res[i]['sylower']);
                        var qgg = JSON.parse(res[i]['qghight']);
                        var qgz = JSON.parse(res[i]['qgmid']);
                        var qgd = JSON.parse(res[i]['qglower']);
                        obj[res[i]["curday"].toString()] = [[nlg, nlz, nld], [syg, syz, syd], [qgg, qgz, qgd]];
                    }
                    cb.call(null, false);
                    //operater.getTodayYun(info, cb);
                }
            }
        });
    }
}

var getXianMiaoFromDB = function (colKey, aType,aNum, cb) {
    var sql = "select " + colKey + " from gua_table where guanum='" + aNum + "';";

    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select " + colKey + " from gua_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                console.log(sql);
                console.log("没有找到仙妙数据");
                cb.call(null, "没有找到仙妙数据");
            }
            else {
                if (aType != 3) {
                    cb.call(null, false, res[0][colKey]);
                }
                else {
                    cb.call(null, false, (res[0][colKey] == 1 ? "男" : "女"));
                }
            }
        }
    });
}

//获得仙妙描述
operater.getXianMiao = function (uid,aType,aNum,cb) {
    var colKey = "";
    switch (parseInt(aType)) {
        case 0:
            {
                colKey = 'qg';
            }
            break;
        case 1:
            {
                colKey = 'cx';
            }
            break;
        case 2:
            {
                colKey = 'qc';
            }
            break;
        case 3:
            {
                colKey = 'sex';
                //求男女，直接查找，不涉及四季五行
                getXianMiaoFromDB(colKey, aType, aNum, cb);
            }
            break;
        case 4:
            {
                colKey = 'qz';
            }
            break;
        case 5:
            {
                colKey = 'yr';
            }
            break;
    }

    if (aType != 3) {
        var wx = user.getWx(new Date());
        
        switch (wx) {
            case 0:
                {
                    colKey = colKey + "chun";
                }
                break;
            case 1:
                {
                    colKey = colKey + "xia";
                }
                break;
            case 2:
                {
                    colKey = colKey + "qiu";
                }
                break;
            case 3:
                {
                    colKey = colKey + "dong";
                }
                break;
            case 4:
                {
                    colKey = colKey + "tu";
                }
                break;
        }
        console.log("colKey = " + colKey);
        getXianMiaoFromDB(colKey, aType, aNum, cb);
    }
}

operater.onKhfk = function (uid,msg, cb) {
    var sql = "insert into khfk_table(user_id, msg) values('"
        + uid + "','" + msg + "');";
    console.log(sql);
    mysqlClient.insert(sql, null, function (err) {
        if (err) {
            console.log("Error ocuor when insert into khfk_table;");
            console.log(err);
            log(sql);
            cb.call(err);
        }
        else {
            if (cb) {
                cb.call(err);
            }
        }
    });
}


operater.getAllUser = function (cb) {
    var sql = "select a.*,b.basenum1,b.basenum2,b.basenum3,b.basenum4,b.basenum5,b.basenum6,b.basenum7,b.basenum8 from user_table a,ming_table b where a.acceptmsg = true and a.deviceid <> '' and b.flystar = a.flystar and b.sex = a.sex;";
    //log(sql);from ming_table where flystar ='" + flystar + "' and sex=" + info.sex + ";"
    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when select userinfo from user_table;");
            console.log(err);
            cb.call(null, err);
        }
        else {
            if (res.length <= 0) {
                cb.call(null,null, "没有接受推送通知的用户");
            }
            else {
                //console.log(res);
                cb.call(null,res, false);
            }
        }
    });
}

operater.setUserDeviceId = function (info, cb) {
    var sql = "update user_table set deviceid = '" + info.token + "',user_os = " + info.os + " where user_id = '" + info.uid + "'";
    console.log(sql);

    mysqlClient.insert(sql, null, function (err) {
        if (cb) {
            cb.call(err);
        }
    });
}

operater.getUserLastJxScore = function (info, cb) {
    var sql = "select wealth_stars,lastJxScore,baseZyScore from newming_table where sex = " + info.sex + " and flystar = '" + info.flystar + "'";
    

    mysqlClient.query(sql, null, function (err, res) {
        if (err) {
            console.log("Error ocuor when getUserLastJxScore;");
            console.log(sql);
            console.log(err);
        }
        else {
            
            info.wealth_stars = parseFloat(res[0]["wealth_stars"]);
            info.jxScore = parseFloat(res[0]["lastJxScore"]);
            info.baseZyScore = parseFloat(res[0]['baseZyScore']).toFixed(0);
            if (cb) {
                cb.call(null, info.jxScore);
            }
        }
    });
};

/**
 * set user's colour
 * @param uid
 * @param colour
 */
operater.setColour = function(uid,colour,cb){
    var values = [colour,uid];
    var sql = "update user_table set colour= ?  where user_id= ?;"
    console.log(sql);
    mysqlClient.update(sql, values, function (err) {
        if (cb) {
            cb.call(err);
        }
    });
};
/**
 * add feedback
 * @param uid
 * @param content
 * @param cb
 */
operater.addFeedback = function(uid,content,cb){
    var sql = "insert feedback_table(uid,content) value('" + uid + "','" + content + "')";
    console.log(sql);
    mysqlClient.insert(sql, null, function (err) {
        if (cb) {
            cb.call(err);
        }
    });
};

operater.addToContract = function(uid,contracts_uid,contracts_name,cb){
    var sql = "insert contracts_table(uid,contracts_uid,contracts_name) value('" + uid + "','" + contracts_uid + "','" + contracts_name + "');";
    console.log(sql);
    mysqlClient.insert(sql, null, function (err) {
        if (cb) {
            cb.call(err);
        }
    });
};

operater.delFromContract = function(uid,contracts_uid,cb){
    var sql = "delete from contracts_table where uid='" + uid + "' and contracts_uid='" + contracts_uid + "'";
    console.log(sql);
    mysqlClient.delete(sql, null, function (err) {
        if (cb) {
            cb.call(err);
        }
    });
};

operater.getContract = function(uid,cb){
    var sql = "select contracts_uid,contracts_name from contracts_table where uid='" + uid + "'";
    console.log(sql);
    mysqlClient.query(sql, null, function (err,res) {
        var contracts = [];
        for(var i = 0; i < res.length; ++i){
            contracts.push([res[i]["contracts_uid"],res[i]["contracts_name"]]);
        }
        cb(err,contracts)
    });
};