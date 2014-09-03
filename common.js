
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
    var inData = fs.readFileSync("./jqData.json");
    jqData = JSON.parse(inData);
    

    inData = fs.readFileSync("./scores.json");
    scoreJson = JSON.parse(inData);
    

    inData = fs.readFileSync("./data.json");
    dataJson = JSON.parse(inData);

    inData = fs.readFileSync("./wxbasescore.json");
    wxBaseScoreJson = JSON.parse(inData);
    
   

    console.log("jsons loaded!");

    if (!isChild_Process) {
        //创建子进程
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