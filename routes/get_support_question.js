/**
 * Created by King Lee on 14-12-11.
 */
var support_question_json = require('../config/support_question');
exports.onGetSupportQuestion = function(req,res){
    var result = { error: "" };
    result.support_question = support_question_json;
    console.log(result);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
};