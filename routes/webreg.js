var crypto = require('crypto');
var db = require('./mysql/dboperator')
var mysqlClient = require('./mysql/mysqlclient.js')
var tools = require('./tools/tools')
var user = require('./user.js');
var jsconverter = require('./tools/calendar-converter.js');
var converter = new jsconverter();


//测试函数，用于生成轴向数据
var aList = ['中央','正东','东北','正北','西北','正西','西南','正南','东南'];
var sexList = ['女','男'];
var tgList = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var clockList = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var gz = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
var sjStr = ['木', '火', '金', '水', '土'];
var strFlyStarWx = [ '衰', '中','旺'];




//用户企图获取注册页面
exports.reg = function (req, res) {
    console.log("Recieve webReg get Message!");
	res.render('reg', { title: '用户注册' });
};
exports.onPostReg1 = function(req,res){
	//解析生日
	var strDate = req.body['birthday'];
	var result = /(\d+).*?(\d+).*?(\d+).*?(\d+)\:(\d+)/g.exec(strDate);
	//
	res.end(converter.lunar2solar(new Date(parseInt(result[1]),parseInt(result[2])-1,parseInt(result[3])),false));
}


//当用户点击注册按钮时被触发
exports.onPostReg = function (req, res) {
    console.log("Recieve webReg Post Message!");

    

	//解析生日
	var strDate = req.body['birthday'];
	var result = /(\d+).*?(\d+).*?(\d+).*?(\d+)\:(\d+)/g.exec(strDate);
	
	
	//测试功能
	var reqData = {
		name:			req.body['username'],
		sex:			parseInt(req.body['sex']),
		registAddress:	parseInt(req.body['registaddress'])-1,
		birthAddress:	parseInt(req.body['birthaddress'])-1,
		year:			parseInt(result[1]),
		month:			parseInt(result[2]),
		day:			parseInt(result[3]),
		clock:			parseInt(result[4])
	}

	var userInfo = user.getUserInfo(reqData);
	
	
	reqData.clock = (reqData.clock + 1) % 24;
	reqData.clock = Math.floor(reqData.clock / 2);


    //查询数据库，获得吉凶值
	db.getUserLastJxScore(userInfo, function (jxScore) {
	    userInfo.hightScore = (70 * (jxScore + userInfo.wxBaseScore)).toFixed(0);

        //  fix userInfo.wxBaseScore
        /*
        特殊规定如下：1、3颗财星，不足80分，统一调整80分。
              2、4颗财星，不足85分，统一调整85分。
              3、5颗财星，不足92分，统一调整92分。
        */
        var wealth_stars = userInfo.wealth_stars;
        var wealth_stars_three_scores = 80;
        var wealth_stars_four_scores = 85;
        var wealth_stars_five_scores = 92;
        if(wealth_stars == 3){
            if(userInfo.wxBaseScore < wealth_stars_three_scores){
                userInfo.wxBaseScore = wealth_stars_three_scores;
            }
        }else if(wealth_stars == 4){
            if(userInfo.wxBaseScore < wealth_stars_four_scores){
                userInfo.wxBaseScore = wealth_stars_four_scores;
            }
        }else if(wealth_stars == 5){
            if(userInfo.wxBaseScore < wealth_stars_five_scores){
                userInfo.wxBaseScore = wealth_stars_five_scores;
            }
        }
	    res.render('dateresult', {
	        title: '日期结果',
	        registAddress: aList[reqData.registAddress],			//注册地
	        birthAddress: aList[reqData.birthAddress],          //出生地
	        birthWS: (userInfo.birthWS > 0 ? "旺" : userInfo.birthWS < 0 ? "衰" : "平"),
	        sjWS: (userInfo.sjWS ? "旺" : "衰"),
	        scWS: (userInfo.scWS ? "旺" : "衰"),
	        username: reqData.name,                             //姓名
	        sex: sexList[reqData.sex],                               //性别
	        birthday: reqData.year + "年" + reqData.month + "月" + reqData.day + "日",       //生日
	        clock: clockList[reqData.clock],                                                //出生时辰
	        //干支
	        ngz: userInfo.ngz,
	        ygz: userInfo.ygz,
	        rgz: userInfo.rgz,
	        sgz: userInfo.sgz,
	        //运数
	        bigyun: userInfo.bigyun,
	        smallyun: userInfo.smallyun,
	        nianyun: userInfo.nianyun,
	        yueyun: userInfo.yueyun,
	        riyun: userInfo.riyun,
	        shiyun: userInfo.shiyun,
	        //太岁	
	        niants: userInfo.niants,
	        yuets: userInfo.yuets,
	        rits: userInfo.rits + "日",
	        shits: userInfo.shits + "时",
	        //岁破
	        niansp: userInfo.niansp,
	        yuesp: userInfo.yuesp,
	        risp: userInfo.risp + "日",
	        shisp: userInfo.shisp + "时",
	        //星(月)数
	        starNum: userInfo.starNum,
	        //阳和数
	        yangSum1: userInfo.yangSum1,
	        yangSum2: userInfo.yangSum2,
	        yangSum3: userInfo.yangSum3,
	        //缺数
	        queNum: userInfo.queNum,

	        flystar: userInfo.flystar,
	        wealth_stars: userInfo.wealth_stars,
	        bwxNum: userInfo.bwxNum,
	        scwxNum: userInfo.scwxNum,
	        wwxNum: userInfo.wwxNum,
	        dwwxNum: userInfo.dwwxNum,
	        wxBaseScore: userInfo.wxBaseScore,
	        yuanWxScore: userInfo.yuanWxScore,
	        hightScore: userInfo.hightScore,
	        //基础助运分
	        baseZyScore: userInfo.baseZyScore,
	        sjIndex: sjStr[userInfo.sjIndex],
	        flyStarWx: strFlyStarWx[userInfo.flyStarWx]

	    });
	});
};