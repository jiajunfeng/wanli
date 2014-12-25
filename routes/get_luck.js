/**
 * Created by King Lee on 14-12-23.
 */
var analysis = require('./module/analysis');
var consts = require('./util/consts');

exports.onGetLuck = function(req,res){
    var result = { error: "" };
    var uid = req.body['uid'];
    analysis.getLuck2(uid,consts.TYPE_TIME.TYPE_TIME_TODAY,consts.TYPE_SCORE.TYPE_SCORE_LUCK,function(answer){
        result.score = answer.score;
        result.level = answer.level;
        result.desc = answer.desc;
        console.log(result);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};