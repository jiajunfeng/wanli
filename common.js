
/**
 * Module dependencies.
 */
var jqData = null;
var fs = require('fs');
var dataJson = null;
var scoreJson = null;
var wxBaseScoreJson = null;
var child_process = require('child_process');

var worker = null;

function init(isChild_Process) {
    if (jqData) {
        return;
    }
    var inData = fs.readFileSync("./config/jqData.json");
    jqData = JSON.parse(inData);
    

    inData = fs.readFileSync("./config/scores.json");
    scoreJson = JSON.parse(inData);
    

    inData = fs.readFileSync("./config/data.json");
    dataJson = JSON.parse(inData);

    inData = fs.readFileSync("./config/wxbasescore.json");
    wxBaseScoreJson = JSON.parse(inData);
    
   

    console.log("jsons loaded!");

    if (!isChild_Process) {
        //�����ӽ��
        worker = child_process.fork('./routes/child_process.js');
        worker.on('message', function (m) {
            console.log('PARENT got message:', m);
        });

        worker.send({ cmd: 'start'});
    }
    //worker.kill('SIGHUP');
}

exports.log = function (msg) {
    console.log(msg);
}

//获得冬夏至的数据结构
exports.getJqData = function () {
    return jqData;
}

//获得配置的数据结构
exports.getDataJson = function () {
    return dataJson;
}

//获得配置的数据结构
exports.getScoreJson = function () {
    return scoreJson;
}

//获得五行基础分值数据结构
exports.getWxBaseScoreJson = function () {
    return wxBaseScoreJson;
}

exports.init = init;