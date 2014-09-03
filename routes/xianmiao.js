var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var user = require('./user');
var todayInfo = require('./todayInfo.js');
var userManager = require('./userManager.js');

var userInfo = require('./userInfo.js').userInfo;

//当用户要求仙妙信息时触发
exports.onXianMiao = function (req, res) {
    
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    //检验ID
    result = { error: "" };
    if(!req.body['uid']){
        result.error = '请输入您的ID';
        res.end(JSON.stringify(result));
        return;
    }
    
    //这里是加时辰
    var now = new Date();
    var clock = (now.getHours() + 1) % 24;
    clock = Math.floor(clock / 2) + 1;

    var three = parseInt(req.body['num0']) + parseInt(req.body['num1']) + clock;
    three = three % 6;
    if (three == 0) {
        three = 6;
    }

    log("Recieve XianMiao info: " + req.body['num0'] + "," + req.body['num1'] + "," + three);
    db.getXianMiao(req.body['uid'], req.body['xmtype'], req.body['num0'] + req.body['num1'] + three, function (err, desc) {
    //db.getXianMiao(dataInfo, req.body['xmtype'], '112', function (err, desc) {
        if (err) {
            res.end(JSON.stringify({ error: err }));
        }
        else {
            var info = {};
            info.desc = desc;
            console.log(JSON.stringify(info));
            res.end(JSON.stringify(info));
        }
    });

    //log("dateInfo.sjIndex=" + dataInfo.sjIndex);

    //log("Recieve XianMiao info: " + req.body['num0'] + "," + req.body['num1'] + "," + req.body['num2']);
};