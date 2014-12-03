/**
 * Created by King Lee on 14-9-25.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var analysis = require('./module/analysis');

exports.onSelectDate = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var select_date_type = parseInt(req.body["select_date_type"]);
    var days_type = parseInt(req.body["days_type"]);
    var result = { error: "" };
    analysis.getSelectDate(uid,select_date_type,days_type,function(date){
        result.date = date;
        if(date.length){
            result.desc = "算的真不容易呀！根据你本人的命理，最合适的日期是：";
        }else{
            result.desc = "期间没有合适的日子。";
        }
        console.log(result);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
    });

};