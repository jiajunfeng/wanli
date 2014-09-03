var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var user = require('./user');
var todayInfo = require('./todayInfo.js');
var userManager = require('./userManager.js');

var userInfo = require('./userInfo.js').userInfo;

//当用户点击提交按钮时被触发
exports.onFk = function (req, res) {
    var uid = req.body['uid'];
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

    //检验ID
    result = { error: "" };
    var msg = req.body['msg'];
    console.log(uid + " Fk: " + msg);
    if(!msg){
        result.error = '请输入您的意见/建议';
        res.end(JSON.stringify(result));
    }
    db.onKhfk(uid, msg, function (err) {
        //查询失败
        if (err) {
            result.error = err;
        }
        res.end(JSON.stringify(result));
    });
};