/**
 * Created by King Lee on 14-12-11.
 */
var db = require('./mysql/dboperator');

exports.onGetBless = function(req,res){
    var result = { error: "" };
    var uid = req.body['uid'];
    db.GetBless(uid,function(err,give_away_bless){
        if(err){
            result.err = err;
        }
        result.give_away_bless = give_away_bless;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};