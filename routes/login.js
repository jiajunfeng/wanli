var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var user = require('./user');
var todayInfo = require('./todayInfo.js');
var userManager = require('./userManager.js');

var userInfo = require('./userInfo.js').userInfo;

//当用户点击登陆按钮时被触发
exports.onLogin = function(req,res){

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

    //检验ID
    result = { error: "" };
    if(!req.body['uid']){
        result.error = '请输入您的ID';
        res.end(JSON.stringify(result));
    }
    //检查密码
    else if (!req.body['pass']) {
        result.error = '请输入您的密码';
        res.end(JSON.stringify(result));
    }
    else {
        log("user:" + req.body['uid'] + " login with password:" + req.body['pass']);
        var info = new userInfo();
        info.uid = req.body['uid'];
        info.password = req.body['pass'];

        db.userLogin(info, function (err) {
            //查询失败
            if (err) {
                result.error = err;
            }
            res.end(JSON.stringify(result));
        });
    }
    
};