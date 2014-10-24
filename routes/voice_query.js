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
    var find = false;
    for(var m = 0; m < word_match.length; ++m){
        if(word_match[m] == "运程"){
            find = true;
            analysis.getLuck2(uid,time_type,consts.TYPE_SCORE.TYPE_SCORE_LUCK,function(answer){
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                var result = { answer:answer};
                console.log(answer);
                res.end(JSON.stringify(result));
            });
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
        }else if(word_match[m] == "方向" || word_match[m] == "最好" || word_match[m] == "最顺"){
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
        var answer = "此问题暂不支持查询,目前仅支持运程,做事,能量,旅行,罗盘(我这天逛街向那个方向最顺？),请亲换一个!";
        var result = { answer:answer};
        console.log(answer);
        res.end(JSON.stringify(result));
    }
};