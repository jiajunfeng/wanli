
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var webreg = require('./routes/webreg');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var login = require('./routes/login.js');
var reg = require('./routes/reg.js');
var modifyInfo = require('./routes/modifyInfo.js');
var xianmiao = require('./routes/xianmiao.js');
var maker = require('./routes/dataMaker.js');
var todayInfo = require('./routes/todayInfo.js');
var khfk = require('./routes/khfk.js');
var comm = require('./common.js');
var userManager = require('./routes/userManager.js');
var deviceid = require('./routes/deviceid.js');
var participle = require('./routes/participle.js');
var voice_query = require('./routes/voice_query.js');
var set_colour = require('./routes/set_colour.js');
var feedback = require('./routes/feedback.js');
var contacts = require('./routes/contacts.js');
var compass = require('./routes/compass.js');
var select_date = require('./routes/select_date.js');

var segment = require("nodejieba");
segment.loadDict("./node_modules/nodejieba/dict/jieba.dict.utf8", "./node_modules/nodejieba/dict/hmm_model.utf8");

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride()); //֧�ֶ���http����������Put,delete�ȣ������������֧��
app.use(express.cookieParser('your secret here'));

app.use(express.session());
//app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//��ʼ�����
comm.init();

app.get('/', routes.index);
app.post('/login', login.onLogin);
app.get('/webreg', webreg.reg);
app.post('/webreg', webreg.onPostReg);
app.post('/reg', reg.onReg);
app.post('/deviceid', deviceid.onPostId);
app.post('/modifyInfo', modifyInfo.onModify);
app.post('/xianmiao', xianmiao.onXianMiao);
app.post('/todayinfo', todayInfo.onGetInfo);
app.get('/todayinfo', todayInfo.onGetInfo);
app.post('/userinfo', userManager.onGetInfo);
app.post('/khfk', khfk.onFk);
app.post('/participle', participle.onParticiple);
app.post('/voice_query', voice_query.onVoiceQuery);
app.post('/set_colour', set_colour.onSetColour);
app.post('/feedback', feedback.onFeedback);
app.post('/contacts', contacts.onContract);
app.post('/compass', compass.onCompass);
app.post('/select_date', select_date.onSelectDate);

userManager.GetInstance();

//maker.makeData(1940, 2051);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
