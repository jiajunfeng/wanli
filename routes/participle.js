/**
 * Created by King Lee on 14-9-5.
 */
var segment = require("nodejieba");
segment.loadDict("./node_modules/nodejieba/dict/jieba.dict.utf8", "./node_modules/nodejieba/dict/hmm_model.utf8");
exports.onParticiple = function(req,res){
    console.log(req.body.content);
    var wordList = segment.cutSync(req.body.content);
    if (wordList.constructor == Array) // just for tutorial, this is always be true
    {
        wordList.forEach(function(word) {
            console.log(word);
        });
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    var result = { wordList: wordList };
    res.end(JSON.stringify(result));
};