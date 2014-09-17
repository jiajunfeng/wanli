
var Class = require('./class.js').Class;
var log = require('../common').log;
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;
var util = require('util');
var ThisMgr = null;

var userManager = Class.extend({
    m_users: {},
    m_maxId: 0,
    init: function () {
        var self = this;
        db.getMaxId(function (err, aId) {
            if (err) {
                console.log("Error: a error ocurr when getMaxId:");
                console.log(err);
            }
            else {
                console.log("The current user_id = " + aId);
                self.m_maxId = aId;
            }
        });
    },

    getUserById: function (aId) {
        if (aId in this.m_users) {
            return this.m_users[aId];
        }
        else {
            return null;
        }
    },

    removeUserById: function (aId) {
        if (aId in this.m_users) {
            delete this.m_users[aId];
        }
    },

    addUserInfo: function (aInfo) {
        if (aInfo.uid == "") {
            this.m_maxId = (parseInt(this.m_maxId) + 1).toString();
            aInfo.uid = this.m_maxId;
        }
        if (aInfo.uid in this.m_users) {
            log("Error: add userinfo to usermanager but it has at here! who's id = " + aInfo.uid);
        }
        else {
            this.m_users[aInfo.uid] = aInfo;
        }
    },
    getCurUserId: function () {
        return ++this.m_maxId;
    }
});



exports.GetInstance = function () {
    if (!ThisMgr) {
        ThisMgr = new userManager;
        ThisMgr.init();
    }

    return ThisMgr;
}

//当用户要用户信息时调用
exports.onGetInfo = function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    result = { error: "" };

    //先不缓存吧，没多少人，如果人多了，也要用memcache之类的，否则内存就爆了
    //如果缓存，可以在这里判断UM中是否有，如果没有查出来后加上

    var info = new userInfo();
    info.uid = req.body['uid'];
    info.sex = req.body['sex'];
    info.version = req.body['v'];
    if (!info.version) {
        info.version = 0;
    }
    else {
        info.version = parseInt(info.version);
    }
    var star = parseInt(req.body['star']);
    
    switch (parseInt(req.body['type'])) {
        case 0:
            {
                db.getUserInfo(info, function (err) {
                    //查询失败
                    if (err) {
                        result.error = err.toString();
                        res.end(JSON.stringify(result));
                    }
                    else {
                        res.end(JSON.stringify(info));
                        console.log("=======BaseInfo==========");
                        console.log(info);
                    }

                });
            }
            break;
        case 1:
            {
                db.getYearYun(info, star, function (err) {
                    //查询失败
                    if (err) {
                        result.error = err.toString();
                        res.end(JSON.stringify(result));
                    }
                    else {
                        res.end(JSON.stringify(info));
                        console.log("=======YearInfo==========");
                        console.log(util.inspect(info, { depth: 10 }));
                    }

                });
            }
            break;
        case 2:
            {
                db.getMonthYun(info, star, function (err) {
                    //查询失败
                    if (err) {
                        result.error = err.toString();
                        res.end(JSON.stringify(result));
                    }
                    else {
                        res.end(JSON.stringify(info));
                        console.log("=======MonthInfo==========star=" + star);
                        //console.log(info);
                        console.log(util.inspect(info, { depth: 10 }));
                    }

                });
            }
            break;
    }
};

