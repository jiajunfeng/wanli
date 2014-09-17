/**
 * Created by King Lee on 14-9-16.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onSetColour = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var colour = parseInt(req.body["colour"]);
    var result = { error: "" };
};