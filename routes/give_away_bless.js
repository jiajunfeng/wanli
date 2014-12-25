/**
 * Created by King Lee on 14-12-11.
 */
var db = require('./mysql/dboperator');

exports.onGiveAwayBless = function(req,res){
    var result = { error: "" };
    var uid = req.body['uid'];
    var name = req.body['name'];
    var target_uid = req.body['target_uid'];
    var bless = parseInt(req.body['bless']);
    db.GiveAwayBless(uid,name,target_uid,bless,function(err){
        if(err){
            result.err = err;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};