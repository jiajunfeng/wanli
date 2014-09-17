/**
 * Created by King Lee on 14-9-16.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onFeedback = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var content = parseInt(req.body["content"]);
    var result = { error: "" };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
};