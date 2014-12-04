/**
 * Created by King Lee on 14-12-4.
 */
var analysis = require('./module/analysis');
var consts = require('./util/consts');
var db = require('./mysql/dboperator');

exports.onPushForLogin = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var push_message = [];
    var result = { error: "" };
    analysis.getInfo(uid,function(info){
        var login_count = info.login_count;
        switch (login_count){
            case 0:{
                analysis.getInfoAll(uid,function(info){
                    result.push_message = info.baseXg;
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });

                break;
            }
            case 1:{
                analysis.getFixationLuckInThePast(uid,consts.TYPE_FIXATION.TYPE_FIXATION_LUCK_LAST_TEN_YEARS,function(answer){
                    result.push_message = answer;
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });
                break;
            }
            case 2:{
                analysis.getFixationLuckInThePast(uid,consts.TYPE_FIXATION.TYPE_FIXATION_LUCK_LAST_TEN_YEARS,function(answer){
                    result.push_message = answer;
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });
                break;
            }
            case 3:{
                analysis.getFixationBless(uid,consts.TYPE_FIXATION.TYPE_FIXATION_BLESS,function(answer){
                    result.push_message = answer;
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });
                break;
            }
            case 4:{
                analysis.getFixationWealth(uid,consts.TYPE_FIXATION.TYPE_FIXATION_WEALTH,function(answer){
                    result.push_message = answer;
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });
                break;
            }
            case 5:{
                analysis.getFixationPeach(uid,consts.TYPE_FIXATION.TYPE_FIXATION_PEACH,function(answer){
                    result.push_message = answer;
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });
                break;
            }
            default :{
                analysis.getFixationPeach(uid,consts.TYPE_FIXATION.TYPE_FIXATION_PEACH,function(answer){
                    result.push_message = [];
                    console.log(result);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(result));
                });
            }
        }
        login_count++;
        db.setLoginCount(uid,login_count);
    });
};