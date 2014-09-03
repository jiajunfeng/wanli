var crypto = require('crypto');
var db = require('./mysql/dboperator')
var tools = require('./tools/tools')
var log = require('../common').log;
var Class = require('./class.js').Class;

var info = Class.extend({
    uid: '',
    name: '',
    password: '',
    birthday: '',
    regTime:'',
    sex: 1,
    registAddress: 0,
    birthAddress: 1
});

exports.userInfo = info;