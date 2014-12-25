/**
 * Created by King Lee on 14-12-11.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var user = require("./user.js");
var analysis = require('./module/analysis');
var consts = require('./util/consts');
exports.onGetEnergy = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var result = { error: "" };
    analysis.getInfo(uid,function(info){
        if(!info){
            console.log("没有这个账号");
            return;
        }
        var scores = analysis.getScore(info,consts.TYPE_TIME.TYPE_TIME_TODAY,consts.TYPE_SCORE.TYPE_SCORE_ENERGY,new Date());
        result.scores = scores[0];
        console.log(result);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};