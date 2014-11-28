/**
 * Created by King Lee on 14-11-28.
 */
var mongodb = module.exports;

var mongo = require('mongoskin');
var db = mongo.db("mongodb://115.29.42.238:27017/wanli", {native_parser:true});

mongodb.voice_query_log = function(user_id,question,answer){
    var documents_voice_query = db.collection('documents_voice_query');
    var cur_date = new Date();
    var date = cur_date.getFullYear() + "/" + (cur_date.getMonth() + 1) + "/" + cur_date.getDate() + " " + cur_date.getHours() + ":" + cur_date.getMinutes();
    documents_voice_query.insert({id:user_id,date:date,question:question,answer:answer},function(err,result){
        if(err){
            console.log(err);
        }
        console.log(result);
    });
};