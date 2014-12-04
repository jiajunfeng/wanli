/**
 * Created by King Lee on 14-12-3.
 */
var analysis = require('./module/analysis');
var consts = require('./util/consts');

exports.onPushForIndex = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var push_message = [];
    var result = { error: "" };
    analysis.getInfo(uid,function(info){
        var today_energy = analysis.getScore(info,consts.TYPE_TIME.TYPE_TIME_TODAY,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,new Date());
        var today_luck = analysis.getScore(info,consts.TYPE_TIME.TYPE_TIME_TODAY,consts.TYPE_SCORE.TYPE_SCORE_LUCK,new Date());
        if(today_energy[0] < 60){
            push_message.push("今日能量较低，请速速补种福田，增幅转运。");
        }
        else if(today_luck[0] < 60){
            push_message.push("今日运程较低，请速速补种福田，增幅转运。");
        }
        else if(today_energy[0] > 85){
            push_message.push("今日能量较高，可以为友送福。");
        }
        if(0 == push_message.length){
            analysis.getLuck2(uid,consts.TYPE_TIME.TYPE_TIME_TODAY,consts.TYPE_SCORE.TYPE_SCORE_LUCK,function(answer){
                push_message.push(answer);
                result.push_message = push_message;
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(result));
            });
        }
        else{
            result.push_message = push_message;
            console.log(result);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        }
    });
};