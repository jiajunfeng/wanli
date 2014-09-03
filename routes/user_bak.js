var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
 
//测试函数，用于生成轴向数据
var aList = ['中央','正东','东北','正北','西北','正西','西南','正南','东南'];
var sexList = ['女','男'];
var tgList = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var clockList = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var gz = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
var yunList = [	{start: new Date("1944/2/4"),end:new Date("1964/2/3"),big:2,small:5},
				{start: new Date("1964/2/4"),end:new Date("1984/2/3"),big:2,small:6},
				{start: new Date("1984/2/4"),end:new Date("2004/2/3"),big:3,small:7},
				{start: new Date("2004/2/4"),end:new Date("2024/2/3"),big:3,small:8},
				{start: new Date("2024/2/4"),end:new Date("2044/2/3"),big:3,small:9}];
var jqList = new Array('立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒');
var yueYunList = [{key:'子午卯酉',val:[8,7,6,5,4,3,2,1,9,8,7,6]},{key:'辰戌丑未',val:[5,4,3,2,1,9,8,7,6,5,4,3]},{key:'寅申巳亥',val:[2,1,9,8,7,6,5,4,3,2,1,9]}]
	
//出生地旺衰表
var wsList = ["354","6207","183","813","0627","54620","54620","6207","718"];
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
var sjwsList = [[12,13,14,15,16,17,18,19,20,21,22,23],
				[4,5,10,11,16,17,22,23],
				[0,1,2,3,4,5,18,19,20,21,22,23],
				[0,1,2,3,4,5,18,19,20,21,22,23],
				[6,7,8,9,10,11],
				[16,17,18,19],
				[10,11,12,13,14,15,16,17],
				[0,1,6,7,8,9,10,11],
				[0,1,2,3,4,5,6,7,8,9,10,11]];

var yueList = [	{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null},
				{ start: null,end:null,mid:null}];




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




//创建节气月份数据
function buildNianli(date){
	//var st = new Date();
	var y = tools.year2Ayear(date.getFullYear());
	var nianli = tools.nianLiHTML(y-1) + tools.nianLiHTML(y) + tools.nianLiHTML(y+1);
	//console.log("1:" + ((new Date()).getTime() - st.getTime()));
	//console.log(nianli);
	var curN = y - 1;
	var pos = 0;
	var jq = "";
	var yueIndex = 0;
	var lastYue = 0;
	for(var i=0 ; i<3 ; i++){
		for(var j=0 ; j< jqList.length ; j++){
			
			var index = nianli.indexOf(jqList[j],pos);
			if(index < 0){
				break;
			}
			pos = index + 2;
			var yue = parseInt(nianli.substr(index+2,2));
			var ri = parseInt(nianli.substr(index + 5,2));
			if(yue < lastYue){
				curN ++;
			}
			lastYue = yue;
			
			var start = new Date((curN).toString() + "/" + yue + "/" + ri);
			if(j%2 == 0){	
				yueList[yueIndex].start = start; //当前月的开始日期
				if(yueIndex > 0){ //上个月的结束日期
					var end = new Date();
					end.setTime(start.getTime() - 24 * 60 * 60 * 1000);
					yueList[yueIndex-1].end = end;
					
				}
				yueIndex ++;
			}
			else{
				yueList[yueIndex-1].mid = start;
			}
		}
	}
	//console.log("2:" + ((new Date()).getTime() - st.getTime()));

	
//	for(var j=0 ; j<yueList.length ; j++){
//		var info = yueList[j];
//		if(info.end){
//			console.log(j + ": " + info.start.getFullYear() + "/" + info.start.getMonth() + "/" + info.start.getDate() + "   " + info.end.getFullYear() + "/" + info.end.getMonth() + "/" + info.end.getDate());
//		}
//	}	

}
//构建某日的八字，也就是天干地支，时辰不准
function buildBZ(date){
	var ob=new Object();
	var t = tools.timeStr2hour("11:25:30");
	var jd=tools.JD.JD(tools.year2Ayear(date.getFullYear()), parseInt(date.getMonth()+1), parseInt(date.getDate())+t/24);
	
	tools.obb.mingLiBaZi( jd-tools.J2000, 0, ob ); //八字计算
	return ob;
}

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
	for(var i=0 ; i<numList.length ; i++){
		if(!numList[i]){
			retStr = retStr + i + ",";
		}
	}
	return retStr.replace(/\,$/,"");
}


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
	//var strTime = clock + ":30:30";
	
	var t = tools.timeStr2hour(clock + ":30:30");
	var jd=tools.JD.JD(tools.year2Ayear(reqData.year), reqData.month, reqData.day+t/24);
	
	tools.obb.mingLiBaZi( jd-tools.J2000, 0, ob ); //八字计算
	taisui = ob.bz_jn.substr(1,1); //太岁
	suipo = clockList[(getDizhiIndex(taisui) + 6) % 12]; //岁破
	
	//时辰
	
	date = new Date(reqData.year + "/" + reqData.month + "/" + reqData.day);
	clock = (clock + 1) % 24;
	clock = Math.floor(clock/2);
	
	
	//计算年历
	var nianli = buildNianli(date);
	
	//大小运数
	for( var i=0 ; i<yunList.length ; i++){
		var info = yunList[i];
		if(date >= info.start && date <= info.end){
			bigyun = info["big"];
			smallyun = info["small"];
			break;
		}	
	}
	//年运数
	var offset = (date < new Date(reqData.year + "/2/4")) ? 1 : 0; //以2月4日为分界点
	nianyun = (100 - parseInt(reqData.year.toString().substr(2,2)) + offset) % 9;
	if (nianyun == 0) {
	    nianyun = 9;
	}
	//月运数
	//首先判断他在第几月
	
	for(var i=0 ; i<yueList.length ; i++){
		var info = yueList[i];
		if(info.start <= date && date <= info.end){
			yueyun = i % 12;
			break;
		}
	}
	//然后根据年地支(太岁)和月份确定月运
	for(var i=0 ; i<yueYunList.length ; i++){
		var info = yueYunList[i];
		if(info.key.indexOf(taisui) >=0){
			yueyun = info.val[yueyun];
			break;
		}
	}
	
	//求本年一月份的月干支
	var startDay = yueList[12].start;
	var startJqIndex = 12;
	//小于立春就是上一年的
	if(date < startDay){
	    startDay = yueList[0].start;
	    startJqIndex = 0;
	}
	//console.log("开始日期:" + startDay.getFullYear() + "/" + (startDay.getMonth()+1) + "/" + startDay.getDate());
	var startBZ = buildBZ(startDay);
	var bzIndex = getGzIndex(startBZ.bz_jy); //开始日的月干支索引
	//console.log("开始月干支:" + startBZ.bz_jy + " index= " + bzIndex)
	//从开始日往后找12个干支值
	for(var i=0 ; i<12 ; i++){
		if(gz[(i+bzIndex)%60].indexOf(taisui) >= 0){
			yuets = gz[(i+bzIndex)%60]; //月太岁
		}
		else if(gz[(i+bzIndex)%60].indexOf(suipo) >=0){
			yuesp = gz[(i+bzIndex)%60]; //月岁破
		}
	}
	
	//日运数
	//首先查找落在那个节气后面
	var jqIndex = -1;
	for(var i=0 ; i<yueList.length - 1; i++){
		var info = yueList[i];
		if(date >= info.start && date < info.mid){
			jqIndex = 2*i;
			break;
		}
		else if(date >= info.mid && date < yueList[i+1].start){
			jqIndex = 2*i+1;
			break;
		}
	}
	
    //顺便查查四季五行
    //季节
	var sjIndex = Math.floor((i - startJqIndex) / 6);
    //log("sjIndex =" +  sjIndex);
    //看看生日离着立春，夏，秋，冬的天数
	var sjStart = yueList[startJqIndex + sjIndex * 6].start;
	//log("sjStart = " + sjStart);
	var days = tools.GetDateDiff(sjStart,date, "day");
	//log("days = " + days);
	if (days >= 72) {
	    sjIndex = 4;
	}
	//log("result sjIndex =" + sjIndex);


	jqIndex = jqIndex % 24;
	var gzIndex = getGzIndex(ob.bz_jr);
	if(jqIndex >= 1 && jqIndex < 5){
		riyun = (gzIndex + 7) % 9;
	}
	else if(jqIndex >= 5 && jqIndex < 9){
		riyun = (gzIndex + 4) % 9;
	}
	else if(jqIndex >= 21 || jqIndex < 1){
		riyun = (gzIndex + 1) % 9;
	}
	else if(jqIndex >= 9 && jqIndex < 13){
		riyun = 9 - (gzIndex % 9);
	}
	else if(jqIndex >= 13 && jqIndex < 17){
		riyun = ((11 - (gzIndex % 9)) % 9) + 1;
	}
	else if(jqIndex >= 17 && jqIndex < 21){
		riyun = ((14 - (gzIndex % 9)) % 9) + 1;
	}

	if (riyun == 0) {
	    riyun = 9;
	}


	//时运数
	//首先看看他到底是哪一天的。
	var rgz = ob.bz_jr;
	var sgz = ob.bz_js;
	//if(reqData.clock >= 23){
	//	var yestoday = new Date();
	//	yestoday.setTime(date.getTime() - 1 * 60 * 60 * 1000);
	//	var yestodayGz = buildBZ(yestoday);
	//	rgz = yestodayGz.bz_jr;
	//	//sgz = yestodayGz.bz_js;
	//}
	
	//看看是在冬至后，还是夏至后
	
	var rgzIndex = getDizhiIndex(rgz.substr(1,1));
	//console.log("jqIndex = " + jqIndex + " rgzIndex=" + rgzIndex);
	if(jqIndex >= 9 && jqIndex < 21){ //夏至后
		if((rgzIndex % 3) == 0){
			shiyun = ((8 - (clock % 9)) % 9) + 1;
		}
		else if((rgzIndex % 3) == 1){
			shiyun = ((14 - (clock % 9)) % 9) + 1;
		}
		else{
			shiyun = ((11 - (clock % 9)) % 9) + 1;
		}	
	}
	else{
		if((rgzIndex % 3) == 0){
			shiyun = (1 + clock) % 9;
		}
		else if((rgzIndex % 3) == 1){
			shiyun = (4 + clock) % 9;
		}
		else{
			shiyun = (7 + clock) % 9;
		}
	}
	
	if (shiyun == 0) {
	    shiyun = 9;
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
	var birthWS = (wsList[nianyun-1].search(baIndex.toString()) >= 0);
	//四季旺衰
	var sjWS = (sjwsList[nianyun-1].indexOf(jqIndex) >=0);
	
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
	userInfo.sjWS= sjWS;
	userInfo.clock= clock;                                                //出生时辰
	//干支
	userInfo.ngz= ob.bz_jn;
	userInfo.ygz= ob.bz_jy;
	userInfo.rgz= rgz;
	userInfo.sgz= sgz;
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
}

exports.getUserInfo = function(reqData){
	var userInfo = {
		//出生地旺衰，四季旺衰
		birthWS: 	true,
		sjWS:		true,
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
		queNum: ''
	};
	
	buildData(reqData,userInfo);
	return userInfo;
}