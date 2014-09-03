
var user = require('./user');
var lastDay = new Date(2013, 11, 10);
var flystar = {
    year: 2013,
    month: 11,
    day: 10,
    clock: 0,
    yearyun: 0,     //当前年运 --
    monthyun: 0,    //当前月运 --
    dayyun: [],     //日运列表
    clockyun: [],   //当前时运
}

var getTodayFlyStar = function () {
    var now = new Date();
    var clock = now.getHours();
    clock = (clock + 1) % 24;
    clock = Math.floor(clock / 2);

    //如果不等于了，就更新
    if (now.getFullYear() != flystar.year ||
        now.getMonth() + 1 != flystar.month||
        now.getDate() != flystar.day ||
        clock != flystar.clock) {

        flystar.year = now.getFullYear();
        flystar.month = 1 + now.getMonth();
        flystar.day = now.getDate();
        flystar.clock = clock;

        flystar.dayyun = [];
        flystar.clockyun = [];
        flystar.yearyun = user.getYearStar(now);
        flystar.monthyun = user.getMonthStar(now);
        var tempDate = new Date();
        var nowTime = now.getTime();
        for (var i = -4 ; i < 5 ; i++) {
            tempDate.setTime(nowTime + i * (1000 * 60 * 60 * 24));
            flystar.dayyun.push(user.getDayStar(tempDate));
        }

        for (var i = -4 ; i < 5 ; i++) {
            tempDate.setTime(nowTime + i * (1000 * 60 * 60 * 2));
            flystar.clockyun.push(user.getClockStar(tempDate));
        }
    }    
    return flystar;
};


//当用户要求当时的飞星时触发
exports.onGetInfo = function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    result = { error: "" };
    res.end(JSON.stringify(getTodayFlyStar()));
};

exports.getTodayFlyStar = getTodayFlyStar;