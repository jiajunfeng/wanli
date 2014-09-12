/**
 * Created by King Lee on 14-9-12.
 */
var db = require('../mysql/dboperator');
var userInfo = require('../userInfo.js').userInfo;
var common = require("../../common.js");
var anylysis = module.exports;
var user = require("../user.js");
var consts = require('../util/consts');

anylysis.getLuck = function(uid,luck_type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getYearsLuck");
        }
        else {
            var birthYearStar = parseInt(info.flystar.substr(2, 1));
            //首先计算运程相关的
            //计算当其旺衰
            var dataJson = common.getDataJson();
            var curDate = new Date();
            var descJson = {};
            var dqws = true;
            var hourStar = user.getClockStar(curDate);
            var dayStar = user.getDayStar(curDate);
            var monthStar = user.getMonthStar(curDate);
            var yearStar = user.getYearStar(curDate);
            var smallStar = user.getSmallStar(curDate);
            if (info.sex == 0) {
                hourStar = user.getNvYun(hourStar);
                dayStar = user.getNvYun(dayStar);
                monthStar = user.getNvYun(monthStar);
                yearStar = user.getNvYun(yearStar);
                smallStar = user.getNvYun(smallStar);
            }
            //  default is today 's previous star
            var star_of_query = dayStar;
            var previous_star_of_query = monthStar;
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == luck_type){
                previous_star_of_query = monthStar;
                star_of_query = dayStar;

            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == luck_type){
                previous_star_of_query = yearStar;
                star_of_query = monthStar;
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == luck_type){
                previous_star_of_query = smallStar;
                star_of_query = yearStar;
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == luck_type){
                previous_star_of_query = dayStar;
                star_of_query = hourStar;
            }
            //  当其旺衰
            dqws = (dataJson.yun.dqws[info.sex][birthYearStar - 1].indexOf(previous_star_of_query.toString()) >= 0);
            descJson = dataJson.yun.desc[info.sex][birthYearStar - 1][star_of_query - 1];
            var answer = {};
            answer.luck = descJson.yc[dqws ? 0 : 1];
            answer.health = descJson.jk;
            answer.career = descJson.sy;
            answer.wealth = descJson.qc;
            answer.emotions = descJson.qb;
            answer.luck_of_peach = descJson.th;
            cb(answer);
        }
    });
};
