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
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "运程"){
            analysis.getLuck2(uid,time_type,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
        }else if(word_match[m] == "做事"){
            analysis.getWork(uid,time_type,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
        }else if(word_match[m] == "能量"){
            analysis.getEnergy(uid,time_type,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
        }else if(word_match[m] == "旅行"){
            analysis.getTravel(uid,time_type,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
        }else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            var answer = "此问题暂不支持查询，请亲换一个!";
            var result = { answer:answer};
            console.log(answer);
            res.end(JSON.stringify(result));
        }
    }
};