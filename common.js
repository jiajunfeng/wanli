
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
        //�����ӽ���
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

//��ö����������ݽṹ
exports.getJqData = function () {
    return jqData;
}

//������õ����ݽṹ
exports.getDataJson = function () {
    return dataJson;
}

//������õ����ݽṹ
exports.getScoreJson = function () {
    return scoreJson;
}

//������л�����ֵ���ݽṹ
exports.getWxBaseScoreJson = function () {
    return wxBaseScoreJson;
}

exports.init = init;