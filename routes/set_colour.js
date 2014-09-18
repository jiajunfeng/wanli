/**
 * Created by King Lee on 14-9-16.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onSetColour = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var colour = parseInt(req.body["colour"]);
    var result = { error: "" };
    db.setColour(uid,colour,function(err){
        if(err){
            console.log(err);
            result.err = err;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};