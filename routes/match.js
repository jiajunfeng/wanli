/**
 * Created by King Lee on 14-9-30.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var analysis = require('./module/analysis');
var consts = require('./util/consts');

exports.onMatch = function(req,res){
    var result = { error: "" };
    var input_type = parseInt(req.body["input_type"]);
    var uid = parseInt(req.body["uid"]);
    var type = parseInt(req.body["type"]);
    if(consts.TYPE_MATCH_INPUT.TYPE_MATCH_UID == input_type){
        var target_uid = parseInt(req.body["target_uid"]);
        analysis.getMatch(uid,target_uid,type,function(answer){
            result.answer = answer;
            console.log(answer);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }else if(consts.TYPE_MATCH_INPUT.TYPE_MATCH_USER_INFO == input_type){
        var birthday = parseInt(req.body["birthday"]);
        var birthplace = parseInt(req.body["birthplace"]);
        var sex = parseInt(req.body["sex"]);
        analysis.getMatch2(uid,birthday,birthplace,sex,type,function(answer){
            result.answer = answer;
            console.log(answer);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }
};