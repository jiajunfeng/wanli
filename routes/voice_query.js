/**
 * Created by King Lee on 14-9-10.
 */
var segment = require("nodejieba");
exports.onVoiceQuery = function(req,res){
    var uid = req.body["uid"];
    var voice_content = req.body["voice_content"];
    var wordList = segment.cutSync(voice_content);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    var result = { answer:"海拔高度5860,较高。这样的高度，命数很不错了，具备做大人物的先天福报，接下来就要看运气和努力程度了。即使运气一般，也不是凡夫走卒。想看一下自己的先天能量吗？  想 "};
    res.end(JSON.stringify(result));
};