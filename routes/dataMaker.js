var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var fs = require('fs');

//测试函数，用于生成轴向数据
var aList = ['中央','正东','东北','正北','西北','正西','西南','正南','东南'];
var sexList = ['女','男'];
var tgList = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
var clockList = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var gz = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未","甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳","甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯","甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑","甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"];
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
			retStr = retStr + i;
		}
	}
	return retStr;
}


//根据用户的生日，构建轴向数据
function buildData(start, end) {
    var rtnObj = new Object();
    var starty = tools.year2Ayear(start);
    var endy = tools.year2Ayear(end);

    //年循环
    for (var i = starty ; i < endy ; i++) {
        var y = tools.year2Ayear(i);
        var nianli = tools.nianLiHTML(y) + tools.nianLiHTML(y + 1);
        var curN = y;
        var key = y.toString();
        var pos = 0;
        var jq = "";
        var lastYue = 0;

        rtnObj[key] = new Array();
        //节气循环
        for (var j = 0 ; j < jqList.length ; j++) {
            var info = new Object();
            rtnObj[key].push(info);

            var index = nianli.indexOf(jqList[j],pos);
            if (index < 0) {
                console.log("Error:year+"+curN + " notfound " + jqList[j] + " in nianli= " + nianli + " \n\n\n");
                break;
            }
            pos = index + 2;
            var yue = parseInt(nianli.substr(index + 2, 2));
            var ri = parseInt(nianli.substr(index + 5, 2));

            if (yue < lastYue) {
                curN++;
            }
            lastYue = yue;

            info.date = curN + "/" + yue + "/" + ri;
            //冬夏至，还要计算离着最近的甲子日和其后第一个子日
            if (j == 9 || j == 21) {

                var preObj = new Object();
                var jd = tools.JD.JD(tools.year2Ayear(curN), yue, ri + 0.5);
                var preDayGz = tools.obb.mingLiBaZi(jd - tools.J2000, 0, preObj); //冬至或者夏至的干支
                var preGzIndex = getGzIndex(preObj.bz_jr);
                var preStartDate = new Date();
                if (preGzIndex == 0) {
                    preStartDate = new Date(curN + "/" + yue + "/" + ri);
                }
                //else if (preGzIndex >= 30) {
                    preStartDate.setTime((new Date(curN + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (60 - preGzIndex));
                //}
                //else {
                //    preStartDate.setTime((new Date(curN + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (-preGzIndex));
                //}

                var preDzIndex = getDizhiIndex(preObj.bz_jr.substr(1, 1));
                var preJrDate = new Date();
                if (preDzIndex == 0) {
                    preJrDate = new Date(curN + "/" + yue + "/" + ri);
                }
                else {
                    preJrDate.setTime((new Date(curN + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (12 - preDzIndex));
                }

                info.jiazi = preStartDate.getFullYear() + "/" + (preStartDate.getMonth() + 1) + "/" + preStartDate.getDate(),  //离着最近的甲子日
                info.ziri = preJrDate.getFullYear() + "/" + (preJrDate.getMonth() + 1) + "/" + preJrDate.getDate()  //第一个子日
            }
        }
    }

    /*
    while (starty <= endy) {
        var nianli = tools.nianLiHTML(starty); //取24节气的字符串
        var pos = 0;
        var index = nianli.indexOf("冬至", pos);
        if (index < 0) {
            console.log(nianli);
            console.log("Error:1" + starty);
            break;
        }

        pos = index + 2;
        var yue = parseInt(nianli.substr(index + 2, 2));
        var ri = parseInt(nianli.substr(index + 5, 2));
        var key = (starty - 1).toString();
        

        var preObj = new Object();
        jd = tools.JD.JD(tools.year2Ayear(key), yue, ri + 0.5);
        var preDayGz = tools.obb.mingLiBaZi(jd - tools.J2000, 0, preObj); //冬至或者夏至的干支
        var preGzIndex = getGzIndex(preObj.bz_jr);
        var preStartDate = new Date();
        if (preGzIndex == 0) {
            preStartDate = new Date(key + "/" + yue + "/" + ri);
        }
        else if (preGzIndex >= 30) {
            preStartDate.setTime((new Date(key + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (60 - preGzIndex));
        }
        else {
            console.log("dongzhi date=" + starty + "/" + yue + "/" + ri);
            preStartDate.setTime((new Date(key + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (- preGzIndex));
        }
        
        var preDzIndex = getDizhiIndex(preObj.bz_jr.substr(1, 1));
        var preJrDate = new Date();
        if (preDzIndex == 0) {
            preJrDate = new Date(key + "/" + yue + "/" + ri);
        }
        else {
            preJrDate.setTime((new Date(key + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (12 - preDzIndex));
        }

        if (key in rtnObj) {
            rtnObj[key].d = {
                date: key + "/" + yue + "/" + ri,
                jiazi: preStartDate.getFullYear() + "/" + (preStartDate.getMonth() + 1) + "/" + preStartDate.getDate(),  //第一个甲子日
                ziri: preJrDate.getFullYear() + "/" + (preJrDate.getMonth() + 1) + "/" + preJrDate.getDate()  //第一个子日
            };
        }


        index = nianli.indexOf("夏至", pos);
        if (index < 0) {
            console.log("Error:2" + starty);
            break;
        }
        pos = index + 2;
        yue = parseInt(nianli.substr(index + 2, 2));
        ri = parseInt(nianli.substr(index + 5, 2));

        jd = tools.JD.JD(tools.year2Ayear(starty), yue, ri + 0.5);
        preDayGz = tools.obb.mingLiBaZi(jd - tools.J2000, 0, preObj); //冬至或者夏至的干支
        preGzIndex = getGzIndex(preObj.bz_jr);
        preStartDate = new Date();
        if (preGzIndex == 0) {
            preStartDate = new Date(starty + "/" + yue + "/" + ri);
        }
        else if (preGzIndex >= 30) {
            preStartDate.setTime((new Date(starty + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (60 - preGzIndex));
        }
        else {
            preStartDate.setTime((new Date(starty + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (- preGzIndex));
            console.log("xiazhi date=" + starty + "/" + yue + "/" + ri);
        }

        preDzIndex = getDizhiIndex(preObj.bz_jr.substr(1, 1));
        preJrDate = new Date();
        if (preDzIndex == 0) {
            preJrDate = new Date(starty + "/" + yue + "/" + ri);
        }
        else {
            preJrDate.setTime((new Date(starty + "/" + yue + "/" + ri)).getTime() + 1000 * 60 * 60 * 24 * (12 - preDzIndex));
        }

        
        rtnObj[starty.toString()] = new Object();
        rtnObj[starty.toString()].x = {
            date: starty + "/" + yue + "/" + ri,
            jiazi: preStartDate.getFullYear() + "/" + (preStartDate.getMonth() + 1) + "/" + preStartDate.getDate(), //第一个甲子日
            ziri: preJrDate.getFullYear() + "/" + (preJrDate.getMonth() + 1) + "/" + preJrDate.getDate()  //第一个子日
        };
       
        starty++;
    }*/
    fs.writeFileSync("./jqData.json", JSON.stringify(rtnObj,"",2));

}

exports.makeData = function(start,end){
   buildData(start, end);
}

