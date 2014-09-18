/**
 * Created by King Lee on 14-9-16.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onFeedback = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var content = req.body["content"];
    var result = { error: "" };
    db.addFeedback(uid,content,function(err){
        if(err){
            console.log(err);
            result.err = err;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};