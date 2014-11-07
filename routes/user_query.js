/**
 * Created by King Lee on 14-11-7.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onUserQuery = function(req,res){
    var result = { error: "" };
    var info = new userInfo();
    info.uid = req.body['uid'];
    db.getUserInfo(info, function (err) {
        if (err) {
            result.error = err.toString();
            res.end(JSON.stringify(result));
        }
        else {
            res.end(JSON.stringify(info));
            console.log(info);
        }

    });
};