/**
 * Created by King Lee on 14-12-3.
 */
var db = require('./mysql/dboperator');
var analysis = require('./module/analysis');
var consts = require('./util/consts');
var async = require('async');

exports.onPushForFriend = function (req, res) {
    var uid = parseInt(req.body["uid"]);
    var result = { error: "" };
    db.getContract(uid, function (err, contracts) {
        if (err) {
            result.error = err;
            console.log(result);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
            return;
        }
        async.parallel([
            function (callback) {
                var contracts_uid = contracts ? (contracts[0] ? contracts[0][0] : 0) : 0;
                if(contracts_uid){
                    analysis.getInfo(contracts_uid, function (info) {
                        callback(null, info);
                    });
                }else{
                    callback(null, null);
                }
            },
            function (callback) {
                var contracts_uid = contracts ? (contracts[1] ? contracts[1][0] : 0) : 0;
                if(contracts_uid){
                    analysis.getInfo(contracts_uid, function (info) {
                        callback(null, info);
                    });
                }else{
                    callback(null, null);
                }
            },
            function (callback) {
                var contracts_uid = contracts ? (contracts[2] ? contracts[2][0] : 0) : 0;
                if(contracts_uid){
                    analysis.getInfo(contracts_uid, function (info) {
                        callback(null, info);
                    });
                }else{
                    callback(null, null);
                }
            },
            function (callback) {
                var contracts_uid = contracts ? (contracts[2] ? contracts[2][0] : 0) : 0;
                if(contracts_uid){
                    analysis.getInfo(contracts_uid, function (info) {
                        callback(null, info);
                    });
                }else{
                    callback(null, null);
                }
            },
            function (callback) {
                var contracts_uid = contracts ? (contracts[4] ? contracts[4][0] : 0) : 0;
                if(contracts_uid){
                    analysis.getInfo(contracts_uid, function (info) {
                        callback(null, info);
                    });
                }else{
                    callback(null, null);
                }
            }
        ],
            // optional callback
            function (err, results) {
                // the results array will equal ['one','two'] even though
                // the second function had a shorter timeout.
                if(err){
                    console.log(err);
                }
                var push_message = [];
                for (var i = 0; i < results.length; ++i) {
                    if (results[i]) {
                        var today_energy = analysis.getScore(results[i], consts.TYPE_TIME.TYPE_TIME_TODAY, consts.TYPE_SCORE.TYPE_SCORE_ENERGY, new Date());
                        var today_luck = analysis.getScore(results[i], consts.TYPE_TIME.TYPE_TIME_TODAY, consts.TYPE_SCORE.TYPE_SCORE_LUCK, new Date());
                        var message = null;
                        if (today_energy[0] < 60) {
                            message = "今日好友" + results[i].name + "运程较低，请速速为友送福，增幅转运。";
                        } else if (today_luck[0] < 60) {
                            message = "今日好友" + results[i].name + "能量较低，请速速为友送福，增幅转运。";
                        }
                        if (message) {
                            push_message.push(message);
                        }
                    }
                }
                result.push_message = push_message;
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(result));
            });
    });
};