/**
 * Created by King Lee on 14-12-10.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var colour_json = require('../config/colour');
var user = require("./user.js");

exports.onGetColour = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var info = new userInfo();
    info.uid = uid;
    var result = { error: "" };
    db.getUserBaseInfo(info,function (err){
        if (err) {
            result.err = err;
            console.log(err + " getUserBaseInfo");
        }
        var year_star = parseInt(info["flystar"].charAt(2));
        var sex = info.sex;
        result.day_star = user.getDayStar(new Date());
        var colours = [];
        colours.push({"自我本色":colour_json[sex][0][year_star-1]});
        colours.push({"旺运色":colour_json[sex][1][year_star-1]});
        colours.push({"旺财色":colour_json[sex][2][year_star-1]});
        colours.push({"旺桃花色":colour_json[sex][3][year_star-1]});
        result.colours = colours;
        console.log(result);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });
};