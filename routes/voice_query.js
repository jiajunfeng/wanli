/**
 * Created by King Lee on 14-9-10.
 */
var segment = require("nodejieba");
var keywords = require('../config/keywords');
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var analysis = require('./module/analysis');
var consts = require('./util/consts');
var mongodb = require("./nosql/mongodb");

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
                if(word == keywords[i][j])
                {
                    word_match.push(keywords[i][j]);
                }
            }
        }
    });
    var is_futher_time = false;
    var time_type;
    var fixation_time_type;
    var fixation_base_type;
    var fixation_base_embellish;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "今天" || word_match[m] == "今日"|| word_match[m] == "本日"|| word_match[m] == "当日"){
            time_type = consts.TYPE_TIME.TYPE_TIME_TODAY;
            break;
        }else if(word_match[m] == "今月" || word_match[m] == "这月"|| word_match[m] == "本月"|| word_match[m] == "当月" ){
            time_type = consts.TYPE_TIME.TYPE_TIME_THIS_MONTH;
            break;
        }else if(word_match[m] == "今年" || word_match[m] == "这年"|| word_match[m] == "本年"|| word_match[m] == "当年"){
            time_type = consts.TYPE_TIME.TYPE_TIME_THIS_YEAR;
            break;
        }else if(word_match[m] == "当时" || word_match[m] == "现在"|| word_match[m] == "这时"|| word_match[m] == "本时"|| word_match[m] == "此时" || word_match[m] == "当下"){
            time_type = consts.TYPE_TIME.TYPE_TIME_HOUR;
            break;
        }else if(word_match[m] == "这辈子" || word_match[m] == "一生"|| word_match[m] == "先天"|| word_match[m] == "一辈子"|| word_match[m] == "命中" || word_match[m] == "此生" || word_match[m] == "这生" || word_match[m] == "人生"){
            fixation_time_type = consts.FIXATION_TYPE_TIME.TYPE_TIME_THIS_LISE;
            break;
        }else if(word_match[m] == "过去" || word_match[m] == "十年" || word_match[m] == "去年" || word_match[m] == "一年"){
            fixation_time_type = consts.FIXATION_TYPE_TIME.TYPE_TIME_IN_THE_PAST;
            break;
        }else if(word_match[m] == "特点" || word_match[m] == "不足"){
            fixation_base_type = consts.FIXATION_TYPE_BASE.TYPE_TIME_NATURE;
            //break;
        }else if(word_match[m] == "主要"){
            fixation_base_embellish = consts.FIXATION_TYPE_BASE_EMBELLISH.TYPE_TIME_NATURE_EMBELLISH_MAJOR;
            //break;
        }else if( word_match[m] == "次要"){
            fixation_base_embellish = consts.FIXATION_TYPE_BASE_EMBELLISH.TYPE_TIME_NATURE_EMBELLISH_MINOR;
            //break;
        }
    }
    var futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_TIME_TODAY;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "哪天" || word_match[m] == "那日" || word_match[m] == "哪日" || word_match[m] == "那天" || word_match[m] == "何日" || word_match[m] == "何时"){
            futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_FUTURE_TIME_TODAY;
            is_futher_time = true;
            break;
        }else if(word_match[m] == "哪月" || word_match[m] == "那月" || word_match[m] == "何日"){
            futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_FUTURE_TIME_MONTH;
            is_futher_time = true;
            break;
        }else if(word_match[m] == "哪年" || word_match[m] == "那年" || word_match[m] == "何年"){
            futher_time_type = consts.TYPE_FUTURE_TIME.TYPE_FUTURE_TIME_YEAR;
            is_futher_time = true;
            break;
        }
    }
    var find = false;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "运程" && "undefined" !== typeof (time_type)){
            find = true;
            try{
                    analysis.getLuck2(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LUCK,function(answer){
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    var result = { answer:answer};
                    mongodb.voice_query_log(uid,voice_content,answer);
                    res.end(JSON.stringify(result));
                });
            }
            catch(e){
                console.log(e.name  + ":" +  e.message);
            }
            break;
        }else if(word_match[m] == "做事" && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getWork(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WORK,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "能量" && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getEnergy(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if(word_match[m] == "旅行" && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getTravel(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "健康" || word_match[m] == "身体") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getHealth(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "财富" || word_match[m] == "钱财" || word_match[m] == "财运") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getWealth(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "败财" || word_match[m] == "破财") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getWealthLose(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LOST_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "逛街" || word_match[m] == "购物") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getShopping(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LOST_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "学业" || word_match[m] == "学习" || word_match[m] == "考试") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getStudy(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "事业" || word_match[m] == "工作") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getCareer(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "求财" || word_match[m] == "挣钱" || word_match[m] == "谈事") && "undefined" !== typeof (time_type)){
            find = true;
            analysis.getPrayForWealth(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "情感" ||  word_match[m] == "情绪") && "undefined" !== typeof (time_type) ){
            find = true;
            analysis.getEmotion(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_EMOTION,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "会友" || word_match[m] == "朋友") && "undefined" !== typeof (time_type) ){
            find = true;
            analysis.getConfrere(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_EMOTION,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "情变" || word_match[m] == "感情") && "undefined" !== typeof (time_type) ){
            find = true;
            analysis.getFeeling(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "桃花" || word_match[m] == "动情" || word_match[m] == "爱情" || word_match[m] == "婚姻" || word_match[m] == "姻缘") && "undefined" !== typeof (time_type) ){
            find = true;
            analysis.getPeach(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else if((word_match[m] == "追求" || word_match[m] == "约会") && "undefined" !== typeof (time_type) ){
            find = true;
            analysis.getChase(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }/*
        else if(word_match[m] == "方向" || word_match[m] == "位置"){
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
            analysis.getCompassMax(uid,type,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                res.end(JSON.stringify(result));
            });
            break;
        }
        */


        if((word_match[m] == "福报" || word_match[m] == "命" || word_match[m] == "命运" || word_match[m] == "运气" || word_match[m] == "福气"|| word_match[m] == "成就" || word_match[m] == "海拔高度") && "undefined" !== typeof (fixation_time_type)){
            find = true;
            analysis.getFixationBless(uid,consts.TYPE_FIXATION.TYPE_FIXATION_BLESS,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "海拔高度"){
            find = true;
            analysis.getFixationBless(uid,consts.TYPE_FIXATION.TYPE_FIXATION_BLESS,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "能量" && "undefined" !== typeof (fixation_time_type)){
            find = true;
            analysis.getFixationEnergy(uid,consts.TYPE_FIXATION.TYPE_FIXATION_ENERGY,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if((word_match[m] == "运程"|| word_match[m] == "助运") && ("undefined" !== typeof (fixation_time_type) && fixation_time_type == consts.FIXATION_TYPE_TIME.TYPE_TIME_THIS_LISE) ){
            find = true;
            analysis.getFixationLuck(uid,consts.TYPE_FIXATION.TYPE_FIXATION_LUCK,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if((word_match[m] == "财富" || word_match[m] == "财运") /*&& "undefined" !== typeof (fixation_time_type)*/){
            find = true;
            analysis.getFixationWealth(uid,consts.TYPE_FIXATION.TYPE_FIXATION_WEALTH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "桃花" && "undefined" !== typeof (fixation_time_type)){
            find = true;
            analysis.getFixationPeach(uid,consts.TYPE_FIXATION.TYPE_FIXATION_PEACH,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "运程" && ("undefined" !== typeof (fixation_time_type)&& fixation_time_type == consts.FIXATION_TYPE_TIME.TYPE_TIME_IN_THE_PAST)){
            find = true;
            analysis.getFixationLuckInThePast(uid,consts.TYPE_FIXATION.TYPE_FIXATION_LUCK_LAST_TEN_YEARS,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "情感" && "undefined" !== typeof (fixation_time_type)){
            find = true;
            analysis.getFixationMotion(uid,consts.TYPE_FIXATION.TYPE_FIXATION_MOTION,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "忠告"/* && "undefined" !== typeof (fixation_time_type)*/){
            find = true;
            analysis.getInfoAll(uid,function(info){
                var answer = {};
                answer.score = "";
                answer.level = "";
                answer.desc = info.rsjy;
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "性格特点"  && fixation_base_embellish ==consts.FIXATION_TYPE_BASE_EMBELLISH.TYPE_TIME_NATURE_EMBELLISH_MAJOR){
            find = true;
            analysis.getInfoAll(uid,function(info){
                var answer = {};
                answer.score = "";
                answer.level = "";
                answer.desc = info.baseXg;
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if(word_match[m] == "性格特点" && fixation_base_embellish ==consts.FIXATION_TYPE_BASE_EMBELLISH.TYPE_TIME_NATURE_EMBELLISH_MINOR){
            find = true;
            analysis.getInfoAll(uid,function(info){
                var answer = {};
                answer.score = "";
                answer.level = "";
                answer.desc = info.td;
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else  if("undefined" !== typeof (fixation_base_type) && fixation_base_embellish ==consts.FIXATION_TYPE_BASE_EMBELLISH.TYPE_TIME_NATURE_EMBELLISH_MAJOR){
            find = true;
            analysis.getInfoAll(uid,function(info){
                var answer = {};
                answer.score = "";
                answer.level = "";
                answer.desc = info.mainBz;
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }
        else  if("undefined" !== typeof (fixation_base_type)){
            find = true;
            analysis.getInfoAll(uid,function(info){
                var answer = {};
                answer.score = "";
                answer.level = "";
                answer.desc = info.qd;
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                mongodb.voice_query_log(uid,voice_content,answer);
                res.end(JSON.stringify(result));
            });
            break;
        }else {

        }
    }
    if(!find){
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        var answer = {};
        answer.score = "";
        answer.level = "";
        answer.desc = "对不住，这事真不知道。";
        var result = { answer:answer};
        mongodb.voice_query_log(uid,voice_content,answer);
        res.end(JSON.stringify(result));
    }
};