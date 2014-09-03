var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var userInfo = require('./userInfo.js').userInfo;
var userManager = require('./userManager.js');
var login = require('./login.js');
var user = require('./user.js');

//客户端接到推送服务器的通知时调用
exports.onPostId = function (req, res) {
    log("---- user deviceid sended ------");

    var userid = req.body["uid"];
    var token = req.body["token"];

    var info = new userInfo();
    info.uid = req.body["uid"];
    info.token = req.body["token"];
    info.os = req.body["os"];

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    db.setUserDeviceId(info, function (err) {
        result = { error: "" };
        if (err) {
            console.log("a error ocurr when set device id");
            console.log(err);
            result.error = err;
        }
        else {
            result.uid = info.uid;
        }
        res.end(JSON.stringify(result));
    });
};