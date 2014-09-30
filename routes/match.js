/**
 * Created by King Lee on 14-9-30.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var analysis = require('./module/analysis');

exports.onMatch = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var target_uid = parseInt(req.body["target_uid"]);
    var type = parseInt(req.body["type"]);
    var result = { error: "" };
    analysis.getMatch(uid,target_uid,type,function(answer){
        result.answer = answer;
        console.log(answer);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};