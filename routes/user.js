var crypto = require('crypto');
var db = require('./mysql/dboperator');
var tools = require('./tools/tools')
var log = require('../common').log;
var comm = require('../common');
 
//测试函数，用于生成轴向数据
var aList = ['中央','正东','东北','正北','西北','正西','西南','正南','东南'];
var sexList = ['女','男'];
var tgList = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var clockList = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var gz = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
var jqList = new Array('立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒');
var yueYunList = [{key:'子午卯酉',val:[8,7,6,5,4,3,2,1,9,8,7,6]},{key:'辰戌丑未',val:[5,4,3,2,1,9,8,7,6,5,4,3]},{key:'寅申巳亥',val:[2,1,9,8,7,6,5,4,3,2,1,9]}]
	
//出生地旺衰表
var wsList = [["345","01268","7"],["02567","148","3"],["1238","457","06"],["1378","45","026"],["0267","1458","3"],["023456","7","18"],["02456","37","18"],["01267","458","3"],["178","0236","45"]];
//四季旺衰表
//1，冬季、秋季旺，其余衰；                                                
//2，3月、6月、9月、12月旺，其余衰；                                         
//3，春季、冬季旺，其余衰；                                                          
//4，春季、冬季旺，其余衰；                                                      
//5、夏季旺，其余衰；                                                      
//6，秋末、初冬旺，其余衰；                                                          
//7，秋季、夏末旺，其余衰；                                                            
//8，夏季、初春旺，其余衰；                                                           
//9，夏季、春季旺，其余衰。 
var sjwsList = [[7,8,9,10,11,12],
				[3,6,9,12],
				[1,2,3,10,11,12],
				[1, 2, 3, 10, 11, 12],
				[4,5,6],
				[9,10],
				[6,7,8,9],
				[1,4,5,6],
				[1, 2, 3, 4, 5, 6]];
//时辰旺衰
//1 - 子时、亥时、丑时、酉时、申时、戌时，旺；其余衰。
//2 - 辰时、戌时、丑时、未时、巳时、午时，旺；其余衰。
//3 - 寅时、卯时、辰时、子时、亥时、丑时，旺；其余衰。
//4 - 寅时、卯时、辰时、子时、亥时、丑时，旺；其余衰。
//5 - 辰时、戌时、丑时、未时、巳时、午时，旺；其余衰。
//6 - 辰时、戌时、丑时、未时、酉时、申时，旺；其余衰。
//7 - 辰时、戌时、丑时、未时、酉时、申时，旺；其余衰。
//8 - 辰时、戌时、丑时、未时、巳时、午时，旺；其余衰。
//9 - 寅时、卯时、辰时、未时、巳时、午时，旺；其余衰。

var scwsList = [[0, 11, 1, 9, 8, 10],
[4, 10, 1, 7, 5, 6],
[2, 3, 4, 0, 11, 1],
[2, 3, 4, 0, 11, 1],
[4, 10, 1, 7, 5, 6],
[4, 10, 1, 7, 9, 8],
[4, 10, 1, 7, 9, 8],
[4, 10, 1, 7, 5, 6],
[2, 3, 4, 7, 5, 6]];

var m_wzsPos = [99, 79, 59, 39]; //基础数值的高中低

//根据男的运数，获得女的运数
var nvYunList = [5,4,3,2,1,9,8,7,6];
function getNvYun(aNanYun){
	return nvYunList[aNanYun - 1];
}

exports.getNvYun = getNvYun;

//获得干支的索引				
function getGzIndex(aGz){
	for(var i=0 ; i<gz.length ; i++){
		if(gz[i] == aGz){
			return i;
		}
	}
	console.log("Error: 企图获得错误的干支序号:"+aGz);
	return -1;
}
exports.getGzIndex = getGzIndex;
//获得地支索引
function getDizhiIndex(aGz){
	for(var i=0 ; i<clockList.length ; i++){
		if(clockList[i] == aGz){
			return i;
		}
	}
	console.log("Error: 企图获得错误的地支序号:"+aGz);
	return -1;
}
exports.getDizhiIndex = getDizhiIndex;
//获得天干索引
function getTianganIndex(aGz){
	for(var i=0 ; i<tgList.length ; i++){
		if(tgList[i] == aGz){
			return i;
		}
	}
	console.log("Error: 企图获得错误的天干序号:"+aGz);
	return -1;
}
exports.getTianganIndex = getTianganIndex;
//获得大运数
function getBigStar(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if(jqData < (new Date(info[0].date))){
        key --;
    }
    var ydelta = key - 1924;
    return ((Math.floor(ydelta / 60) + 1) % 9) + 1;
}
exports.getBigStar = getBigStar;
//获得小运数
function getSmallStar(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if(jqData < (new Date(info[0].date))){
        key --;
    }
    var ydelta = key - 1924;
    return ((Math.floor(ydelta / 20) + 3) % 9) + 1;
}
exports.getSmallStar = getSmallStar;

//获得飞星年
function getStarYear(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (aDate < (new Date(info[0].date))) {
        key--;
    }
    return key.toString();
}
exports.getStarYear = getStarYear;


//获得年运数
function getYearStar(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if(aDate < (new Date(info[0].date))){
        key --;
    }
    var ydelta = key - 1924;
    return 8 - ((ydelta + 5) % 9) + 1;
}
exports.getYearStar = getYearStar;
//获得月运数
function getMonthStar(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (aDate < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    var yue = 0;
    //判断是几月份的
    for (var i = 1 ; i < 24 ; i++) {
        if ((new Date(info[i].date)) > aDate) {
            break;
        }
    }
    yue = Math.floor((i - 1) / 2) + 1;

    var ydelta = key - 1924;
    var mdelta = ydelta * 12 + yue;
    return 8 - ((mdelta) % 9) + 1;
}
exports.getMonthStar = getMonthStar;
//获得日运数
function getDayStar(aDate) {
    var yearStar = 0;
    var isAdd = true;
    var yearNum = aDate.getFullYear()
    var info = comm.getJqData()[yearNum];


    var tempDate = new Date(info[21].jiazi);
    if (aDate < tempDate) { //如果在冬至之前，就找当年夏至
        isAdd = !isAdd;
        tempDate = new Date(info[9].jiazi);
        if (aDate < tempDate) { //如果在夏至之前，就找前一年冬至
            isAdd = !isAdd;
            info = comm.getJqData()[yearNum-1];
            tempDate = new Date(info[21].jiazi);
            if (aDate < tempDate) { //如果在冬至之前，，就找前一年夏至
                isAdd = !isAdd;
                tempDate = new Date(info[9].jiazi);
            }
        }
    }

    //获得时间差
    var ydelta = tools.GetDateDiff(tempDate, aDate, "day");
    if (isAdd) {
        yearStar = (ydelta % 9) + 1;
    }
    else {
        yearStar = 9 - (ydelta % 9);
    }
    return yearStar;
}
exports.getDayStar = getDayStar;
//获得时运数
function getClockStar(aDate) {
    //23点要换成0点
    if (aDate.getHours() == 23) {
        aDate.setHours(0);
    }
    var yearStar = 0;
    var isAdd = true;
    var yearNum = aDate.getFullYear()
    var info = comm.getJqData()[yearNum];

    var tempDate = new Date(info[21].ziri);
    if (aDate < tempDate) { //如果在冬至之前，就找当年夏至
        isAdd = !isAdd;
        tempDate = new Date(info[9].ziri);
        if (aDate < tempDate) { //如果在夏至之前，就找前一年冬至
            isAdd = !isAdd;
            info = comm.getJqData()[yearNum-1];
            tempDate = new Date(info[21].ziri);
            if (aDate < tempDate) { //如果在冬至之前，，就找前一年夏至
                isAdd = !isAdd;
                tempDate = new Date(info[9].ziri);
            }
        }
    }

    //获得时间差
    var ydelta = Math.floor((tools.GetDateDiff(tempDate, aDate, "hour") -1)/ 2); //和子日1点的差距，是时辰差

    if (isAdd) {
        yearStar = ((ydelta+1) % 9) + 1;
    }
    else {
        yearStar = 9 - ((ydelta+1) % 9);
    }
    return yearStar;
}
exports.getClockStar = getClockStar;
//获得一年的第一天
function getFirstDayOfYear(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (jqData < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    return (new Date(info[0].date));
}
exports.getFirstDayOfYear = getFirstDayOfYear;
//获得年月的字符串
function getYearMonth(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (jqData < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    var yue = 0;
    //判断是几月份的
    for (var i = 1 ; i < 24 ; i++) {
        if ((new Date(info[i].date)) > aDate) {
            break;
        }
    }
    yue = Math.floor((i - 1) / 2) + 1;

    return key.toString() + yue.toString();
}
exports.getYearMonth = getYearMonth;
//获得年
function getYear(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (jqData < (new Date(info[0].date))) {
        key--;
    }
    return key;
}
exports.getYear = getYear;
//获得月
function getMonth(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (jqData < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    var yue = 0;
    //判断是几月份的
    for (var i = 1 ; i < 24 ; i++) {
        if ((new Date(info[i].date)) > aDate) {
            break;
        }
    }
    yue = Math.floor((i - 1) / 2) + 1;

    return yue;
}
exports.getMonth = getMonth;


//是否是月的第一天
//获得月
function isMonthStart(aDate) {
    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (jqData < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    var yue = 0;
    //判断是几月份的
    for (var i = 0 ; i < 24 ; i += 2) {
        var tempDate = (new Date(info[i].date));
        if (tempDate.getFullYear() == aDate.getFullYear() &&
            tempDate.getMonth() == aDate.getMonth() &&
            tempDate.getDate() == aDate.getDate()) {
            return true;
        }
    }

    return false;
}

exports.isMonthStart = isMonthStart;

//构建某日的八字，也就是天干地支，时辰不准
function buildBZ(date){
	var ob=new Object();
	var t = tools.timeStr2hour("11:25:30");
	var jd=tools.JD.JD(tools.year2Ayear(date.getFullYear()), parseInt(date.getMonth()+1), parseInt(date.getDate())+t/24);
	
	tools.obb.mingLiBaZi( jd-tools.J2000, 0, ob ); //八字计算
	return ob;
}
exports.buildBZ = buildBZ;
//获得阳和数
function getYangSum(){
	//如果只有一位了，就直接返回
	if(arguments.length == 1 && (arguments[0] == "" || parseInt(arguments[0]).toString().length == 1)){
		return "";
	}
	var sum = 0;
	for(var i=0 ; i<arguments.length ; i++){
		var cell = parseInt(arguments[i]).toString();
		for(var j=0 ; j<cell.length ; j++){
			sum += parseInt(cell.charAt(j));
		}
	}
	return sum;
}

//获得缺数
function getQueNum(){
	var numList = [false,false,false,false,false,false,false,false,false,false,];
	
	for(var i=0 ; i<arguments.length ; i++){
		if(arguments[i] != ""){
			var cell = parseInt(arguments[i]).toString();
			for(var j=0 ; j<cell.length ; j++){
				numList[parseInt(cell.charAt(j))] = true;
			}
		}
	}
	var retStr = "";
	for(var i=1 ; i<numList.length ; i++){
		if(!numList[i]){
			retStr = retStr + i;
		}
	}
	return retStr;
}

//获得四季旺衰
function getSJWS(yearStar,aDate) {

    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (jqData < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    

    var startDay;
    var days;
    var sjws = false;
    switch (yearStar) {
        //飞星1白，立秋后72日，立冬后72日，旺，其余衰。
        case 1:
            {
                startDay = new Date(info[12].date);
                days = tools.GetDateDiff(startDay, aDate, "day");
                if (days >= 0 && days <= 72) {
                    sjws = true;
                }
                else {
                    startDay = new Date(info[18].date);
                    days = tools.GetDateDiff(startDay, aDate, "day");
                    if (days >= 0 && days <= 72) {
                        sjws = true;
                    }
                }
            }
            break;
        case 2:
        case 5:
        case 8:
            {
                //飞星2黑，立春、立夏、立秋、立冬前18日，立夏后72日，旺，其余衰。
                //飞星5土，立春、立夏、立秋、立冬前18日，立夏后72日，旺，其余衰。
                //飞星8土，立春、立夏、立秋、立冬前18日，立夏后72日，旺，其余衰。；
                startDay = new Date(info[0].date);
                days = tools.GetDateDiff(aDate,startDay, "day");
                if (days >= 0 && days <= 18) {
                    sjws = true;
                }
                else {
                    startDay = new Date(info[6].date);
                    days = tools.GetDateDiff(aDate, startDay, "day");
                    if (days >= 0 && days <= 18) {
                        sjws = true;
                    }
                    else{
                        days = tools.GetDateDiff(startDay,aDate,"day");
                        if (days >= 0 && days <= 72) {
                            sjws = true;
                        }
                        else {
                            startDay = new Date(info[12].date);
                            days = tools.GetDateDiff(aDate, startDay, "day");
                            if (days >= 0 && days <= 18) {
                                sjws = true;
                            }
                            else {
                                startDay = new Date(info[18].date);
                                days = tools.GetDateDiff(aDate, startDay, "day");
                                if (days >= 0 && days <= 18) {
                                    sjws = true;
                                }
                            }
                        }
                    }
                }
            }
            break;
        case 3:
        case 4:
            {
                //飞星3木，立春后72日，立冬后72日，旺，其余衰。  
                //飞星4木，立春后72日，立冬后72日，旺，其余衰。
                startDay = new Date(info[0].date);
                days = tools.GetDateDiff(startDay, aDate, "day");
                if (days >= 0 && days <= 72) {
                    sjws = true;
                }
                else {
                    startDay = new Date(info[18].date);
                    days = tools.GetDateDiff(startDay, aDate, "day");
                    if (days >= 0 && days <= 72) {
                        sjws = true;
                    }
                }
            }
            break;
        case 6:
        case 7:
            {
                //飞星6金，立春、立夏、立秋、立冬前18日，立秋后72日，旺，其余衰。 
                //飞星7金，立春、立夏、立秋、立冬前18日，立秋后72日，旺，其余衰。；  
                startDay = new Date(info[0].date);
                days = tools.GetDateDiff(aDate, startDay, "day");
                if (days >= 0 && days <= 18) {
                    sjws = true;
                }
                else {
                    startDay = new Date(info[6].date);
                    days = tools.GetDateDiff(aDate, startDay, "day");
                    if (days >= 0 && days <= 18) {
                        sjws = true;
                    }
                    else {
                        startDay = new Date(info[12].date);
                        days = tools.GetDateDiff(aDate, startDay, "day");
                        if (days >= 0 && days <= 18) {
                            sjws = true;
                        }
                        else {
                            days = tools.GetDateDiff(startDay, aDate, "day");
                            if (days >= 0 && days <= 72) {
                                sjws = true;
                            }
                            else {
                                startDay = new Date(info[18].date);
                                days = tools.GetDateDiff(aDate, startDay, "day");
                                if (days >= 0 && days <= 18) {
                                    sjws = true;
                                }
                            }
                        }
                    }
                }
            }
            break;
        case 9:
            {
                //飞星9火，立春后72日，立夏后72日，旺，其余衰。
                startDay = new Date(info[0].date);
                days = tools.GetDateDiff(startDay, aDate, "day");
                if (days >= 0 && days <= 72) {
                    sjws = true;
                }
                else {
                    startDay = new Date(info[6].date);
                    days = tools.GetDateDiff(startDay, aDate, "day");
                    if (days >= 0 && days <= 72) {
                        sjws = true;
                    }
                }
            }
            break;
        
    }
    return sjws;
}

//获得四季五行
function getWx(aDate) {

    //如果小于本年立春，就是上一年的
    var jqData = comm.getJqData();
    var key = aDate.getFullYear();
    var info = jqData[key.toString()];
    if (aDate < (new Date(info[0].date))) {
        key--;
        info = jqData[key.toString()];
    }
    var yue = 0;
    //判断是几月份的
    for (var i = 1 ; i < 24 ; i++) {
        if ((new Date(info[i].date)) > aDate) {
            break;
        }
    }
    yue = Math.floor((i - 1) / 2) + 1;

    //季节
    var sjIndex = Math.floor((yue -1)/ 3);
    //看看生日离着立春，夏，秋，冬的天数
    var sjStart = new Date(info[sjIndex*6].date);
    var days = tools.GetDateDiff(sjStart, aDate, "day");
    if (days >= 72) {
        sjIndex = 4;
    }
    return sjIndex;
}

exports.getWx = getWx;


//根据用户的生日，构建轴向数据
function buildData(reqData,userInfo){
	var date = null;
	var clock = reqData.clock;
	var bigyun = 0;
	var smallyun = 0;
	var taisui = "";
	var suipo = "";
	var nianyun = 0;
	var yueyun = 0;
	var riyun = 0;
	var shiyun = 0;
	var yuets = "";
	var yuesp = "";
	var baIndex = reqData.birthAddress;
	
	//获得八字
	var ob = new Object();
	if (clock >= 23) {
	    clock = 0;
	}

	var t = tools.timeStr2hour(clock + ":30:30");
	var jd=tools.JD.JD(tools.year2Ayear(reqData.year), reqData.month, reqData.day+t/24);
	
	tools.obb.mingLiBaZi( jd-tools.J2000, 0, ob ); //八字计算
	taisui = ob.bz_jn.substr(1,1); //太岁 年地支
	suipo = clockList[(getDizhiIndex(taisui) + 6) % 12]; //岁破 和年地支对着的那个地支
	
	//时辰
	date = new Date(reqData.year + "/" + reqData.month + "/" + reqData.day + " " + clock + ":00:00");
	clock = (clock + 1) % 24;
	clock = Math.floor(clock/2);
	
	//大小运数 //60年一大运，20年一小运 从1924年2月4日开始 大运2，小运4
	bigyun = getBigStar(date);
	smallyun = getSmallStar(date);
	nianyun = getYearStar(date);
	
	//月运数
	yueyun = getMonthStar(date);
	riyun = getDayStar(date);
	shiyun = getClockStar(date);

    //四季五行 0春1夏2秋3冬4土
	sjIndex = getWx(date);

	//求本年一月份的月干支
	var startDay = getFirstDayOfYear(date);
	var startBZ = buildBZ(startDay);
	var bzIndex = getGzIndex(startBZ.bz_jy); //开始日的月干支索引
	//一年中，含有太岁的干支值就是太岁，含有岁破的干支值，就是岁破
	//从开始日往后找12个干支值
	for(var i=0 ; i<12 ; i++){
		if(gz[(i+bzIndex)%60].indexOf(taisui) >= 0){
			yuets = gz[(i+bzIndex)%60]; //月太岁
		}
		else if(gz[(i+bzIndex)%60].indexOf(suipo) >=0){
			yuesp = gz[(i+bzIndex)%60]; //月岁破
		}
	}

	//男女运数区别
	if(reqData.sex == 0){
		bigyun = getNvYun(bigyun);
		smallyun = getNvYun(smallyun);
		nianyun = getNvYun(nianyun);
		yueyun = getNvYun(yueyun);
		riyun = getNvYun(riyun);
		shiyun = getNvYun(shiyun);
	}
    //出生地旺衰
	var birthWS = 0;
	if(wsList[nianyun-1][0].search(baIndex.toString()) >= 0){
	    birthWS = 1;
	}
	else if(wsList[nianyun-1][1].search(baIndex.toString()) >= 0){
	    birthWS = -1;
	}
    //四季旺衰
	//var yue = getMonth(date);
	var sjWS = getSJWS(nianyun, date);//(sjwsList[nianyun - 1].indexOf(yue) >= 0);
    //时辰旺衰
	var scWS = (scwsList[nianyun - 1].indexOf(clock) >= 0);
	
	//星(月)数
	var starNum = 0;
	
	if(date >= new Date(reqData.year + "/3/21") && date <= new Date(reqData.year + "/4/19")){
		starNum = 1;
	}
	else if(date >= new Date(reqData.year + "/4/20") && date <= new Date(reqData.year + "/5/20")){
		starNum = 2;
	}
	else if(date >= new Date(reqData.year + "/5/21") && date <= new Date(reqData.year + "/6/19")){
		starNum = 3;
	}
	else if(date >= new Date(reqData.year + "/6/22") && date <= new Date(reqData.year + "/7/22")){
		starNum = 4;
	}
	else if(date >= new Date(reqData.year + "/7/23") && date <= new Date(reqData.year + "/8/22")){
		starNum = 5;
	}
	else if(date >= new Date(reqData.year + "/8/22") && date <= new Date(reqData.year + "/9/22")){
		starNum = 6;
	}
	else if(date >= new Date(reqData.year + "/9/23") && date <= new Date(reqData.year + "/10/23")){
		starNum = 7;
	}
	else if(date >= new Date(reqData.year + "/10/24") && date <= new Date(reqData.year + "/11/22")){
		starNum = 8;
	}
	else if(date >= new Date(reqData.year + "/11/23") && date <= new Date(reqData.year + "/12/21")){
		starNum = 9;
	}
	else if(date >= new Date(reqData.year + "/12/22") || date <= new Date(reqData.year + "/1/19")){
		starNum = 10;
	}
	else if(date >= new Date(reqData.year + "/1/20") && date <= new Date(reqData.year + "/2/18")){
		starNum = 11;
	}
	else if(date >= new Date(reqData.year + "/2/19") && date <= new Date(reqData.year + "/3/20")){
		starNum = 12;
	}
	
	//阳和数，缺数
	var yangSum1 = "";
	var yangSum2 = "";
	var yangSum3 = "";
	var queNum = "";
	
	yangSum1 = getYangSum(reqData.year,reqData.month,reqData.day);
	yangSum2 = getYangSum(yangSum1);
	yangSum3 = getYangSum(yangSum2);
	
	queNum = getQueNum(reqData.year,reqData.month,reqData.day,yangSum1,yangSum2,yangSum3,nianyun);
	
	//结果输出
	userInfo.birthWS = birthWS;
	userInfo.sjWS = sjWS;
	userInfo.scWS = scWS;
	userInfo.clock= clock;                                                //出生时辰
	//干支
	userInfo.ngz= ob.bz_jn;
	userInfo.ygz= ob.bz_jy;
	userInfo.rgz = ob.bz_jr;
	userInfo.sgz = ob.bz_js;
	//运数
	userInfo.bigyun= bigyun;
	userInfo.smallyun= smallyun;
	userInfo.nianyun= nianyun;
	userInfo.yueyun= yueyun;
	userInfo.riyun= riyun;
	userInfo.shiyun= shiyun;
	//太岁	
	userInfo.niants= taisui;
	userInfo.yuets= yuets;
	userInfo.rits= taisui;
	userInfo.shits= taisui;
	//岁破
	userInfo.niansp= suipo;
	userInfo.yuesp= yuesp;
	userInfo.risp= suipo;
	userInfo.shisp= suipo;
	//星(月)数
	userInfo.starNum= starNum;
	//阳和数
	userInfo.yangSum1= yangSum1;
	userInfo.yangSum2= yangSum2;
	userInfo.yangSum3= yangSum3;
	//缺数
	userInfo.queNum = queNum;
    //四季五行
	userInfo.sjIndex = sjIndex;
	userInfo.birthAddress = baIndex;
}

exports.getUserInfo = function(reqData){
	var userInfo = {
		//出生地旺衰，四季,时辰旺衰
		birthWS: 	0,
		sjWS: true,
        scWS: true,
		//干支
		ngz: '',
		ygz: '',
		rgz: '',
		sgz: '',
		//运数
		bigyun: 0,
		smallyun: 0,
		nianyun: 0,
		yueyun: 0,
		riyun: 0,
		shiyun: 0,
		//太岁	
		niants: '',
		yuets: '',
		rits: '',
		shits: '',
		//岁破
		niansp: '',
		yuesp: '',
		risp: '',
		shisp: '',
		//星(月)数
		starNum: 0,
		//阳和数
		yangSum1: 0,
		yangSum2: 0,
		yangSum3: 0,
		//缺数
		queNum: '',
        sjIndex:0
	};
	
	buildData(reqData, userInfo);

    //新版数据
	userInfo.sex = reqData.sex;
	userInfo.flystar = userInfo.bigyun.toString() + userInfo.smallyun + userInfo.nianyun + userInfo.yueyun + userInfo.riyun + userInfo.shiyun;
	userInfo.fxscore = getFxScore(userInfo,true);
	userInfo.scwxNum = getScwxNum(userInfo); //生成五行
	userInfo.bwxNum = getWxNum(userInfo, 2);   //本五行
	userInfo.wwxNum = getWwxNum(userInfo);
	userInfo.fxscore = getFxScore(userInfo, false);
	userInfo.dwwxNum = getWwxNum(userInfo);

	userInfo.flyStarWx = getFlyStarWx(userInfo);

    //根据本五行基础分值，确定五行基础分值
	var wxBaseScoreJson = comm.getWxBaseScoreJson();
	userInfo.wxBaseScore = wxBaseScoreJson[parseInt(userInfo.sex)][userInfo.flystar.substr(0, 3)][userInfo.bwxNum.toString()];
	userInfo.yuanWxScore = wxBaseScoreJson[parseInt(userInfo.sex)][userInfo.flystar.substr(0, 3)]["0"];
    return userInfo;
}



function getGzdIndex(baseNum)//获得高中低的索引 0高，1中，2低
{
    var m_gzd = 0;
    
    if(baseNum < m_wzsPos[2])
    {
        m_gzd = 2;
    }
    else if(baseNum < m_wzsPos[1])
    {
        m_gzd = 1;
    }
    else
    {
        m_gzd = 0;
    }
    return m_gzd;
}


var getScoreByDate = function (userInfo, aType, aTType, aDate) {
    var sex = userInfo["sex"];
    var yearStar = 0;
    var isAdd = true;
    var yearNum = aDate.getFullYear()
    var info = comm.getJqData()[yearNum];



    if (aType == 3) {
        //年月相反，日时冬至后不反，夏至后反(飞星逆顺，冬夏至前后甲子日)
        //看看飞星逆顺
        if (aTType == 2 || aTType == 3) {
            var tempDate = new Date(info[21].jiazi);
            if (aDate < tempDate) { //如果在冬至之前，就找当年夏至
                isAdd = !isAdd;
                tempDate = new Date(info[9].jiazi);
                if (aDate < tempDate) { //如果在夏至之前，就找前一年冬至
                    isAdd = !isAdd;
                    info = comm.getJqData()[yearNum - 1];
                    tempDate = new Date(info[21].jiazi);
                    if (aDate < tempDate) { //如果在冬至之前，，就找前一年夏至
                        isAdd = !isAdd;
                        tempDate = new Date(info[9].jiazi);
                    }
                }
            }
        }
        ///////////
        if (aTType == 0 || aTType == 1 || !isAdd) {
            sex = (sex + 1) % 2;
        }
    }

    var m_ScoresJson = comm.getScoreJson();

    //根据类型，确定不同对象
    var val = m_ScoresJson[aType.toString()];
    //根据男女，确定不同的对象
    val = val[sex];

    //获得飞星以及前一级的飞星
    var star, prestar;
    switch (aTType) {
        case 0:
            {
                prestar = getSmallStar(aDate);
                star = getYearStar(aDate);
            }
            break;
        case 1:
            {
                prestar = getYearStar(aDate);
                star = getMonthStar(aDate);
            }
            break;
        case 2:
            {
                prestar = getMonthStar(aDate);
                star = getDayStar(aDate);
            }
            break;
        case 3:
            {
                prestar = getDayStar(aDate);
                star = getClockStar(aDate);
            }
            break;
        default:
            break;
    }

    //根据当前的飞星，确定查找索引的对象
    var idxVal = val[star - 1];
    //查找索引值
    var index = -1;
    for (var i = 0 ; i < idxVal.length; i++) {
        var objVal = idxVal[i];
        if (objVal["beforstar"] == prestar) {
            index = i;
            break;
        }
    }
    if (index < 0) {
        console.log("Error: not found index in scoresJson");
        return -1;
    }
    //根据出生年飞星确定对象
    var yearstar = parseInt(userInfo["flystar"].charAt(2));
    var scoreVal = val[yearstar - 1];
    scoreVal = scoreVal[index];

    var maxVal = parseInt(scoreVal["scores"][star - 1]) + 1;

    //根据差值算法，算出当前分值
    //获得高中低的索引 0高，1中，2低
    var baseNum = parseFloat(userInfo["baseNum"]);
    var wzs = getGzdIndex(baseNum);

    var score = 0;
    if (wzs == 0) {
        score = 2 * (baseNum - m_wzsPos[1]) / (m_wzsPos[0] - m_wzsPos[1]) + maxVal - 2;
    }
    else if (wzs == 1) {
        score = 2 * (baseNum - m_wzsPos[2]) / (m_wzsPos[1] - m_wzsPos[2]) + maxVal - 4;
    }
    else if (wzs == 2) {
        score = 2 * (baseNum - m_wzsPos[3]) / (m_wzsPos[2] - m_wzsPos[1]) + maxVal - 6;
    }
    return score;
}
var getScore = function(userInfo,aType,aTType,year,month,day,clock)
{
    var aDate = new Date(year + "/" + month + "/" + day + " " + clock + ":00:00");
    return getScoreByDate(userInfo,aType,aTType,aDate);
    
}

exports.getScore = getScore;
exports.getScoreByDate = getScoreByDate;


//获得本五行基础分值
var getBwxBaseNum = function (sex,flyStar) {
    var indexStr = flyStar.substr(0, 3);
    var dataJson = comm.getDataJson();
    return dataJson.bwxbasenum[sex][indexStr];
}
exports.getBwxBaseNum = getBwxBaseNum;

var getDirNum = function (dirIndex) {
    //1 - 正北、2 - 西南、3 - 正东、4 - 东南、5 - 中央、6 - 西北、7 - 正西、8东北、9 - 正南
    var nums = [5, 3, 8, 1, 6, 7, 2, 9, 4];
    return nums[dirIndex];
}

//获得生成五行
var getScwxNum = function (userInfo) {  //基本数值
    //内生成：（年飞星与其它飞星组合）
    //16、61生成：水，5分；
    //27、72生成：火，5分；
    //38、83生成：木，5分；
    //49、94生成：金，5分；
    //外生成：非年飞星组合。 
    //16、61生成：水，3分；
    //27、72生成：火，3分；
    //38、83生成：木，3分；
    //49、94生成：金，3分。
    //内外生成需要累计计算
    var rtn = [0, 0, 0, 0];
    var flyStar = userInfo.flystar;
    var yearstar = parseInt(flyStar.charAt(2));
    //内生成
    var strs = ["49", "38", "16", "27"];
    for(var i=0 ; i<strs.length ; i++){
        var temp = strs[i];
        //首先看看年飞星是否在字符串中
        var pos = temp.indexOf(yearstar);
        if(pos >= 0){
            temp = temp.substr(pos == 0 ? 1:0,1);
            if(flyStar.indexOf(temp) >= 0){
                rtn[i] += 5;
            }
        }
    }
    //外生成
    flyStar = flyStar.substr(0,2) + flyStar.substr(3,3);
    for(var i=0 ; i<strs.length ; i++){
        var temp = strs[i];
        var skip = false;
        for(var j=0 ; j<temp.length ; j++){
            if(flyStar.indexOf(temp.substr(j,1)) < 0){
                skip = true;
                break;
            }
        }
        if(!skip){
            rtn[i] += 3;
        }
    }
    return rtn;
}

exports.getScwxNum = getScwxNum;



//var getScwxNum = function (userInfo) {
//    //生成水，年飞星1、3、4，加生成分值；年飞星9、6、7，减生成分值；年飞星2、5、8，减2分。
//    //生成火，年飞星9、2、5、8，加生成分值；年飞星6、7、3、4，减生成分值；年飞星1，减2分。
//    //生成木，年飞星9、3、4，加生成分值；年飞星1、2、5、8，减生成分值；年飞星6、7，减2分。
//    //生成金，年飞星1、6、7，加生成分值；年飞星2、3、4、5、8，减生成分值；年飞星9，减2分。
//    var flyStar = userInfo["flystar"];
//    var yearstar = parseInt(flyStar.charAt(2));
//    var scwxNum = [0, 0, 0, 0];

//    var scwx = getScwx(flyStar);
    
//    var flys = [["167", "23458", "9"],
//                ["349", "1258", "67"],
//                ["134", "967", "258"],
//                ["9258","3467","1"]];

//    for(var i=0 ; i<4 ; i++){
//        if (flys[i][2].indexOf(yearstar) >= 0) {
//            scwxNum[i] = -2;
//        }
//        else if (flys[i][0].indexOf(yearstar) >= 0) {
//            scwxNum[i] = scwx;
//        }
//        else{
//            scwxNum[i] = -scwx;
//        }
//    }
//    return scwxNum;
//}
//exports.getScwxNum = getScwxNum;


//计算飞星分值
var getFxScore = function (userInfo,isStatic) {
    var scores = [[0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0]];
    var offset = isStatic ? 0 : 2;
    var flystar = userInfo.flystar;
    var dataJson = comm.getDataJson();//.flystarscore[0][userInfo.sex];
    var scoreJson = dataJson.flystarscore[offset + 0][userInfo.sex];
    var deltaJson = dataJson.flystarscore[offset + 1][userInfo.sex];
    for (var i = 0 ; i < 6 ; i++) {
        var curStar = parseInt(flystar.charAt(i)) - 1;
        if (i == 0) {
            scores[0][i] = 52;
            scores[1][i] = 4;
        }
        else {
            var preStar = parseInt(flystar.charAt(i - 1)) - 1;
            if (i != 2) {
                scores[0][i] = scoreJson[curStar][preStar];
            }
            else {
                scores[0][i] = getBwxBaseNum(userInfo.sex, flystar);
            }
            scores[1][i] = deltaJson[curStar][preStar];
        }
    }
    //console.log(scores);
    return scores;
}
exports.getFxScore = getFxScore;


//五行最终分值(加上四季影响，出生地影响)(当index == 2 时是本五行分值)
var getWxNum = function (userInfo,index) {
    var flystar = userInfo.flystar;
    var yearstar = parseInt(flystar.charAt(index));
    var dataJson = comm.getDataJson();
    var fxscore = userInfo.fxscore;

    //1白：逢1、6、7加分；逢2、3、4、5、8减分；逢9不加不减。
    //2黑：逢2、5、8、9加分；逢3、4、6、7减分；逢1不加不减。
    //3木：逢1、3、4加分；逢6、7、9减分；逢2、5、8不加不减。
    //4木：逢1、3、4加分；逢6、7、9减分；逢2、5、8不加不减。
    //5土：逢2、5、8、9加分；逢3、4、6、7减分；逢1不加不减。
    //6金：逢2、5、8、6、7加分；逢1、9减分；逢3、4不加不减。
    //7金：逢2、5、8、6、7加分；逢1、9减分；逢3、4不加不减。
    //8土：逢2、5、8、9加分；逢3、4、6、7减分；逢1不加不减。
    //9火：逢3、4、9加分；逢1、2、5、8减分；逢6、7不加不减。
    //1逢1加双倍，2逢2类同

    var flags = [
                    ["167", "23458", "9"],
                    ["2589", "3467", "1"],
                    ["134", "679", "258"],
                    ["134", "679", "258"],
                    ["2589", "3467", "1"],
                    ["25678", "19", "34"],
                    ["25678", "19", "34"],
                    ["2589", "3467", "1"],
                    ["349", "1258", "67"],
    ];
    var flag = flags[yearstar - 1];
    
    var rtn = fxscore[0][index];  //本五行基础分值
    for (var i = 0 ; i < 6 ; i++) {
        if (i != index) {
            var star = flystar.charAt(i);
            if (flag[0].indexOf(star) >= 0) {
                rtn += fxscore[1][i];
                //1逢1加双倍，2逢2类同
                if (parseInt(star) == yearstar) {
                    rtn += fxscore[1][i];
                }
            }
            else if (flag[1].indexOf(star) >= 0) {
                rtn -= fxscore[1][i];
            }
            else {
            }
        }
    }
    //四季影响
    var sjIndex = userInfo.sjIndex;
    rtn += dataJson.sjscore[yearstar - 1][sjIndex];
    //出生地影响
    rtn += dataJson.csdscore[yearstar - 1][getDirNum(userInfo.birthAddress) - 1];


    //if (index == 2) {
        //生成五行影响
        //生成金，年飞星1、6、7，加生成分值；年飞星2、3、4、5、8，减生成分值；年飞星9，减2分。
        //生成木，年飞星9、3、4，加生成分值；年飞星1、2、5、8，减生成分值；年飞星6、7，减2分。
        //生成水，年飞星1、3、4，加生成分值；年飞星9、6、7，减生成分值；年飞星2、5、8，减2分。
        //生成火，年飞星9、2、5、8，加生成分值；年飞星6、7、3、4，减生成分值；年飞星1，减2分。
        var flys = [["167", "23458", "9"],
                    ["349", "1258", "67"],
                    ["134", "967", "258"],
                    ["9258", "3467", "1"]];

        var scwxNum = userInfo.scwxNum;

        for (var i = 0 ; i < 4 ; i++) {
            if (scwxNum[i] > 0) {
                if (flys[i][2].indexOf(yearstar) >= 0) {
                    rtn += -2;
                }
                else if (flys[i][0].indexOf(yearstar) >= 0) {
                    rtn += scwxNum[i];
                }
                else {
                    rtn += -scwxNum[i];
                }
            }
        }
    //}
    
    return rtn;
}
exports.getWxNum = getWxNum;

//外五行的分值（考虑出生地和四季影响)
var getWwxNum = function (userInfo) {
    var flystar = userInfo.flystar;
    var scores = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(var i=0 ; i<6 ; i++){
        if (i != 2) {
            var index = parseInt(flystar.charAt(i)) - 1;
            var score = getWxNum(userInfo, i);
            if (score > scores[index]) {
                scores[index] = score;
            }
        }
    }
    return scores;
}
exports.getWwxNum = getWwxNum;


/*在服务器在设置一个栏目，飞星五行。男士255、266、377，最终数值58分以上，为旺；251最终数值45分以下，269最终数值44分以下，374最终数值43分以下，为衰。其余为中。
女士411、499、388，最终数值58分以上，为旺；384最终数值45分以下，496最终数值44分以下，385最终数值43分以下，为衰。其余为中。
共有旺、中、衰3档。*/
var getFlyStarWx = function(userInfo){
    var score = userInfo.bwxNum;
    var level = 1; //中
    var fly = userInfo.flystar.substr(0, 3);
    if (userInfo.sex == 1) {
        if (score > 58 && (fly == "255" || fly == "266" || fly == "377")) {
            level = 2;
        }
        if ((score < 45 && fly == "251") || (score < 44 && fly == "269") || (score < 43 && fly == "374")) {
            level = 0;
        }
    }
    else {

        if (score > 58 && (fly == "411" || fly == "499" || fly == "388")) {
            level = 2;
        }
        if ((score < 45 && fly == "384") || (score < 44 && fly == "496") || (score < 43 && fly == "385")) {
            level = 0;
        }
    }

    return level;
}
exports.getFlyStarWx = getFlyStarWx;
