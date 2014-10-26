/**
 * Created by King Lee on 14-9-25.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var analysis = require('./module/analysis');

exports.onCompass = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var type = parseInt(req.body["type"]);
    var result = { error: "" };
    analysis.getCompass(uid,type,function(scores){
        result.scores = scores;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });

};