/**
 * Created by King Lee on 14-9-10.
 */
var segment = require("nodejieba");
var keywords = require('../config/keywords');
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var analysis = require('./module/analysis');
var consts = require('./util/consts');

exports.onVoiceQuery = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var voice_content = req.body["voice_content"];
    var version = req.body["version"];
    console.log("onVoiceQuery uid=%d",uid);
    var word_list = segment.cutSync(voice_content);
    // just for tutorial, this is always be true
    if (word_list.constructor == Array)
    {
        word_list.forEach(function(word) {
            console.log(word);
        });
    }
    //  keyword match: target time type style
    var word_match = [];
    word_list.forEach(function(word) {
        for(var i = 0; i < keywords.length; ++i){
            for(var j = 0; j < keywords[i].length; ++j){
                if(word == keywords[i][j]){
                    word_match.push(keywords[i][j]);
                }
            }
        }
    });
    var is_futher_time = false;
    var time_type = consts.TYPE_TIME.TYPE_TIME_TODAY;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "今天" || word_match[m] == "今日"|| word_match[m] == "本日"|| word_match[m] == "当日"){
            time_type = consts.TYPE_TIME.TYPE_TIME_TODAY;
        }else if(word_match[m] == "今月" || word_match[m] == "这月"|| word_match[m] == "本月"|| word_match[m] == "当月"){
            time_type = consts.TYPE_TIME.TYPE_TIME_THIS_MONTH;
        }else if(word_match[m] == "今年" || word_match[m] == "这年"|| word_match[m] == "本年"|| word_match[m] == "当年"){
            time_type = consts.TYPE_TIME.TYPE_TIME_THIS_YEAR;
        }else if(word_match[m] == "当时" || word_match[m] == "现在"|| word_match[m] == "这时"|| word_match[m] == "本时"|| word_match[m] == "此时"){
            time_type = consts.TYPE_TIME.TYPE_TIME_HOUR;
        }
    }
    var futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_TIME_TODAY;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "哪天" || word_match[m] == "那日"){
            futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_FUTURE_TIME_TODAY;
            is_futher_time = true;
        }else if(word_match[m] == "哪月" || word_match[m] == "那月"){
            futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_FUTURE_TIME_MONTH;
            is_futher_time = true;
        }else if(word_match[m] == "哪年" || word_match[m] == "那年"){
            futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_FUTURE_TIME_YEAR;
            is_futher_time = true;
        }
    }
    var find = false;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "运程"){
            find = true;
            try{
                analysis.getLuck2(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LUCK,function(answer){
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    var result = { answer:answer};
                    console.log(answer);
                    res.end(JSON.stringify(result));
                });
            }
            catch(e){
                console.log(e.name  + ":" +  e.message);
            }
            break;
        }else if(word_match[m] == "做事"){
            find = true;
            analysis.getWork(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WORK,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "能量"){
            find = true;
            analysis.getEnergy(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "旅行"){
            find = true;
            analysis.getTravel(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "健康" || word_match[m] == "身体"){
            find = true;
            analysis.getHealth(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "财富" || word_match[m] == "钱财"){
            find = true;
            analysis.getWealth(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "败财" || word_match[m] == "破财"){
            find = true;
            analysis.getWealthLose(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LOST_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "逛街" || word_match[m] == "购物"){
            find = true;
            analysis.getShopping(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LOST_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "学业" || word_match[m] == "学习" || word_match[m] == "考试"){
            find = true;
            analysis.getStudy(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "事业" || word_match[m] == "工作"){
            find = true;
            analysis.getCareer(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "求财" || word_match[m] == "挣钱" || word_match[m] == "谈事"){
            find = true;
            analysis.getPrayForWealth(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "情感" || word_match[m] == "约会" || word_match[m] == "情绪" ){
            find = true;
            analysis.getEmotion(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_EMOTION,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "会友" || word_match[m] == "朋友" ){
            find = true;
            analysis.getConfrere(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_EMOTION,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "情变" || word_match[m] == "感情" ){
            find = true;
            analysis.getFeeling(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "桃花" || word_match[m] == "动情" ){
            find = true;
            analysis.getPeach(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "追求" || word_match[m] == "约会" ){
            find = true;
            analysis.getChase(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "方向" || word_match[m] == "位置"){
            find = true;
            var type = 0;
            for(var n = 0; n < word_match.length; ++n){
                if(word_match[m] == "运程" || word_match[m] == "逛街" || word_match[m] == "购物"){
                    type = consts.TYPE_COMPASS.TYPE_COMPASS_LUCK;
                    break;
                }else if(word_match[m] == "财富" || word_match[m] == "钱财" || word_match[m] == "求财" || word_match[m] == "挣钱" || word_match[m] == "打牌"){
                    type = consts.TYPE_COMPASS.TYPE_COMPASS_WEALTH;
                    break;
                }else if(word_match[m] == "能量"|| word_match[m] == "旅行" || word_match[m] == "出游"){
                    type = consts.TYPE_COMPASS.TYPE_COMPASS_ENERGY;
                    break;
                }else if(word_match[m] == "桃花" || word_match[m] == "约会"){
                    type = consts.TYPE_COMPASS.TYPE_COMPASS_PEACH;
                    break;
                }
            }
            analysis.getCompassMaxScore(uid,type,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else {

        }
    }
    if(!find){
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        var answer = "此问题暂不支持查询,目前仅支持运程,做事,能量,旅行,健康,财富,败财,逛街,学业,事业,求财,情感,会友,情变,桃花,追求,罗盘(我这天逛街向那个方向最顺),请亲换一个!";
        var result = { answer:answer};
        console.log(answer);
        res.end(JSON.stringify(result));
    }
};