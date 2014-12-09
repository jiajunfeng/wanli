/**
 * Created by King Lee on 14-12-9.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onAttention = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var attention_uid = parseInt(req.body["attention_uid"]);
    var type = req.body["type"];
    var result = { error: "" };
    if("add" == type){
        db.addToAttention(uid,attention_uid,function(err){
            if(err){
                console.log(err);
                result.err = err;
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }else if("del" == type){
        db.delAttention(uid,attention_uid,function(err){
            if(err){
                console.log(err);
                result.err = err;
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }else if("get" == type){
        db.getAttentions(uid,function(err,attentions){
            if(err){
                console.log(err);
                result.err = err;
            }
            result.attentions = attentions;
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }
};