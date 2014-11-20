/**
 * Created by King Lee on 14-11-20.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onUserQueryForWeChat = function(req,res){
    var result = { error: "" };
    db.getUserIdByOpenId(req.body['openid'],function(err,user_id){
        var info = new userInfo();
        info.uid = user_id;
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
    });
};