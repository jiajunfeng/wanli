/**
 * Created by King Lee on 14-9-12.
 */
var db = require('../mysql/dboperator');
var userInfo = require('../userInfo.js').userInfo;
var common = require("../../common.js");
var anylysis = module.exports;
var user = require("../user.js");
var consts = require('../util/consts');
var alteration_index = require('../../config/alteration_index');
var fixation_index = require('../../config/fixation_index');
var scores_new = require('../../config/scores_new');

anylysis.getLuck = function(uid,time_type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getLuck");
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
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                previous_star_of_query = monthStar;
                star_of_query = dayStar;

            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                previous_star_of_query = yearStar;
                star_of_query = monthStar;
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                previous_star_of_query = smallStar;
                star_of_query = yearStar;
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
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

anylysis.getLuck2 = function(uid,time_type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getLuck2");
        }
        else {
            info.sjIndex = user.getWx(new Date());
            info.scwxNum = user.getScwxNum(info);
            info.fxscore = user.getFxScore(info,true);
            info.bwxNum = user.getWxNum(info, 2);
            info.flyStarWx = user.getFlyStarWx(info);
            var curDate = new Date();
            var hourStar = user.getClockStar(curDate);
            var dayStar = user.getDayStar(curDate);
            var monthStar = user.getMonthStar(curDate);
            var yearStar = parseInt(info["flystar"].charAt(2))/*user.getYearStar(curDate)*/;
            var smallStar = user.getSmallStar(curDate);
            var bigStar = user.getBigStar(curDate);
            if (info.sex == 0) {
                hourStar = user.getNvYun(hourStar);
                dayStar = user.getNvYun(dayStar);
                monthStar = user.getNvYun(monthStar);
                yearStar = user.getNvYun(yearStar);
                smallStar = user.getNvYun(smallStar);
                bigStar = user.getNvYun(bigStar);
            }
            var star_of_query = dayStar;
            var previous_star_of_query = monthStar;
            var previous_previous_star_of_query = yearStar;
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                previous_previous_star_of_query = yearStar;
                previous_star_of_query = monthStar;
                star_of_query = dayStar;

            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                previous_previous_star_of_query = smallStar;
                previous_star_of_query = yearStar;
                star_of_query = monthStar;
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                previous_previous_star_of_query = bigStar;
                previous_star_of_query = smallStar;
                star_of_query = yearStar;
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                previous_previous_star_of_query = smallStar;
                previous_star_of_query = dayStar;
                star_of_query = hourStar;
            }
            var luck_scores_class;
            var luck_scores_class_previous;
            var all_luck_scores = scores_new[0][info.sex][star_of_query];
            for(var i = 0; i < all_luck_scores.length; ++i){
                if(all_luck_scores[i].beforstar == previous_star_of_query){
                    luck_scores_class = all_luck_scores[i];
                    break;
                }
            }
            var all_luck_scores_previous = scores_new[0][info.sex][previous_previous_star_of_query];
            for(i = 0; i < all_luck_scores_previous.length; ++i){
                if(all_luck_scores_previous[i].beforstar == previous_star_of_query){
                    luck_scores_class_previous = all_luck_scores_previous[i];
                    break;
                }
            }
            var scores;
            var scores_previous;
            if(0 == info.flyStarWx){
                scores = luck_scores_class.scores;
                scores_previous = luck_scores_class_previous.scores;
            }else if(1 == info.flyStarWx){
                scores = luck_scores_class.scores2;
                scores_previous = luck_scores_class_previous.scores2;
            }else if(2 == info.flyStarWx){
                scores = luck_scores_class.scores3;
                scores_previous = luck_scores_class_previous.scores3;
            }

            var luck_socres = scores[yearStar];
            var luck_socres_previous = scores_previous[yearStar];
            var luck_index_rows = alteration_index[0][0];
            var luck_index_row;
            for(i = 0; i < luck_index_rows.length; ++i){
                if(luck_index_rows.length){
                    var range = luck_index_rows[i].range;
                    var range_array = range.split('-');
                    if(luck_socres <= parseInt(range_array[0]) && luck_socres >=  parseInt(range_array[1])){
                        luck_index_row = luck_index_rows[i];
                        break;
                    }
                }
            }
            var last_level_describe_index = 0;
            if(luck_socres_previous >= 90 && luck_socres_previous < 98){
                last_level_describe_index = 0;
            }else if(luck_socres_previous >= 80 && luck_socres_previous < 89){
                last_level_describe_index = 1;
            }else if(luck_socres_previous >= 60 && luck_socres_previous < 79){
                last_level_describe_index = 2;
            }else if(luck_socres_previous >= 45 && luck_socres_previous < 59){
                last_level_describe_index = 3;
            }else if(luck_socres_previous >= 29 && luck_socres_previous < 44){
                last_level_describe_index = 4;
            }else if(luck_socres_previous >= 0 && luck_socres_previous < 28){
                last_level_describe_index = 5;
            }
            var answer = luck_socres + "分," +  luck_index_row.level + ".";
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                answer += luck_index_row.today_last_level_describe[last_level_describe_index];
                answer += "想看看今日运程趋势图么?";
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                answer += luck_index_row.month_last_level_describe[last_level_describe_index];
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                answer += luck_index_row.year_last_level_describe[last_level_describe_index];
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                answer += luck_index_row.now_last_level_describe[last_level_describe_index];
                answer += "想看看今日运程趋势图么?";
            }

            cb(answer);
        }
    });
};

anylysis.getWork = function(uid,time_type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getWork");
        }
        else {
            info.sjIndex = user.getWx(new Date());
            info.scwxNum = user.getScwxNum(info);
            info.fxscore = user.getFxScore(info,true);
            info.bwxNum = user.getWxNum(info, 2);
            info.flyStarWx = user.getFlyStarWx(info);
            var curDate = new Date();
            var hourStar = user.getClockStar(curDate);
            var dayStar = user.getDayStar(curDate);
            var monthStar = user.getMonthStar(curDate);
            var yearStar = parseInt(info["flystar"].charAt(2))/*user.getYearStar(curDate)*/;
            var smallStar = user.getSmallStar(curDate);
            var bigStar = user.getBigStar(curDate);
            if (info.sex == 0) {
                hourStar = user.getNvYun(hourStar);
                dayStar = user.getNvYun(dayStar);
                monthStar = user.getNvYun(monthStar);
                yearStar = user.getNvYun(yearStar);
                smallStar = user.getNvYun(smallStar);
                bigStar = user.getNvYun(bigStar);
            }
            var star_of_query = dayStar;
            var previous_star_of_query = monthStar;
            var previous_previous_star_of_query = yearStar;
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                previous_previous_star_of_query = yearStar;
                previous_star_of_query = monthStar;
                star_of_query = dayStar;

            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                previous_previous_star_of_query = smallStar;
                previous_star_of_query = yearStar;
                star_of_query = monthStar;
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                previous_previous_star_of_query = bigStar;
                previous_star_of_query = smallStar;
                star_of_query = yearStar;
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                previous_previous_star_of_query = smallStar;
                previous_star_of_query = dayStar;
                star_of_query = hourStar;
            }
            var work_scores_class;
            var work_scores_class_previous;
            var all_work_scores = scores_new[4][info.sex][star_of_query];
            for(var i = 0; i < all_work_scores.length; ++i){
                if(all_work_scores[i].beforstar == previous_star_of_query){
                    work_scores_class = all_work_scores[i];
                    break;
                }
            }
            var all_work_scores_previous = scores_new[4][info.sex][previous_previous_star_of_query];
            for(i = 0; i < all_work_scores_previous.length; ++i){
                if(all_work_scores_previous[i].beforstar == previous_star_of_query){
                    work_scores_class_previous = all_work_scores_previous[i];
                    break;
                }
            }
            var scores;
            var scores_previous;
            if(0 == info.flyStarWx){
                scores = work_scores_class.scores;
                scores_previous = work_scores_class_previous.scores;
            }else if(1 == info.flyStarWx){
                scores = work_scores_class.scores2;
                scores_previous = work_scores_class_previous.scores2;
            }else if(2 == info.flyStarWx){
                scores = work_scores_class.scores3;
                scores_previous = work_scores_class_previous.scores3;
            }

            var work_socres = scores[yearStar];
            var work_socres_previous = scores_previous[yearStar];
            var work_index_rows = alteration_index[0][1];
            var work_index_row;
            for(i = 0; i < work_index_rows.length; ++i){
                if(work_index_rows[i].level == work_socres){
                    work_index_row = work_index_rows[i];
                }
            }
            var last_level_describe_index = 0;
            if(work_socres_previous == "宜"){
                last_level_describe_index = 0;
            }else if(work_socres_previous == "中"){
                last_level_describe_index = 1;
            }else if(work_socres_previous == "不宜"){
                last_level_describe_index = 2;
            }
            var answer = work_index_row.level + ",";
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                answer += work_index_row.last_level_describe[last_level_describe_index];
                answer += "想看看今日做事趋势图么?";
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                answer += work_index_row.last_level_describe[last_level_describe_index];
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                answer += work_index_row.last_level_describe[last_level_describe_index];
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                answer += work_index_row.last_level_describe[last_level_describe_index];
                answer += "想看看今日做事趋势图么?";
            }
            cb(answer);
        }
    });
};

anylysis.getEnergy = function(uid,time_type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getEnergy");
        }
        else {
            info.sjIndex = user.getWx(new Date());
            info.scwxNum = user.getScwxNum(info);
            info.fxscore = user.getFxScore(info,true);
            info.bwxNum = user.getWxNum(info, 2);
            info.flyStarWx = user.getFlyStarWx(info);
            var curDate = new Date();
            var hourStar = user.getClockStar(curDate);
            var dayStar = user.getDayStar(curDate);
            var monthStar = user.getMonthStar(curDate);
            var yearStar = parseInt(info["flystar"].charAt(2))/*user.getYearStar(curDate)*/;
            var smallStar = user.getSmallStar(curDate);
            var bigStar = user.getBigStar(curDate);
            if (info.sex == 0) {
                hourStar = user.getNvYun(hourStar);
                dayStar = user.getNvYun(dayStar);
                monthStar = user.getNvYun(monthStar);
                yearStar = user.getNvYun(yearStar);
                smallStar = user.getNvYun(smallStar);
                bigStar = user.getNvYun(bigStar);
            }
            var star_of_query = dayStar;
            var previous_star_of_query = monthStar;
            var previous_previous_star_of_query = yearStar;
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                previous_previous_star_of_query = yearStar;
                previous_star_of_query = monthStar;
                star_of_query = dayStar;

            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                previous_previous_star_of_query = smallStar;
                previous_star_of_query = yearStar;
                star_of_query = monthStar;
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                previous_previous_star_of_query = bigStar;
                previous_star_of_query = smallStar;
                star_of_query = yearStar;
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                previous_previous_star_of_query = smallStar;
                previous_star_of_query = dayStar;
                star_of_query = hourStar;
            }
            var energy_scores_class;
            var energy_scores_class_previous;
            var all_energy_scores = scores_new[3][info.sex][star_of_query];
            for(var i = 0; i < all_energy_scores.length; ++i){
                if(all_energy_scores[i].beforstar == previous_star_of_query){
                    energy_scores_class = all_energy_scores[i];
                    break;
                }
            }
            var all_energy_scores_previous = scores_new[3][info.sex][previous_previous_star_of_query];
            for(i = 0; i < all_energy_scores_previous.length; ++i){
                if(all_energy_scores_previous[i].beforstar == previous_star_of_query){
                    energy_scores_class_previous = all_energy_scores_previous[i];
                    break;
                }
            }
            var scores;
            var scores_previous;
            scores = energy_scores_class.scores;
            scores_previous = energy_scores_class_previous.scores;
            var energy_socres = scores[yearStar];
            var energy_socres_previous = scores_previous[yearStar];
            var energy_index_rows = alteration_index[0][2];
            var energy_index_row;
            for(i = 0; i < energy_index_rows.length; ++i){
                if(energy_index_rows.length){
                    var range = energy_index_rows[i].range;
                    var range_array = range.split('-');
                    if(energy_socres <= parseInt(range_array[0]) && energy_socres >=  parseInt(range_array[1])){
                        energy_index_row = energy_index_rows[i];
                        break;
                    }
                }
            }
            var last_level_describe_index = 0;
            if(energy_socres_previous >= 90 && energy_socres_previous < 98){
                last_level_describe_index = 0;
            }else if(energy_socres_previous >= 80 && energy_socres_previous < 89){
                last_level_describe_index = 1;
            }else if(energy_socres_previous >= 60 && energy_socres_previous < 79){
                last_level_describe_index = 2;
            }else if(energy_socres_previous >= 45 && energy_socres_previous < 59){
                last_level_describe_index = 3;
            }else if(energy_socres_previous >= 29 && energy_socres_previous < 44){
                last_level_describe_index = 4;
            }else if(energy_socres_previous >= 0 && energy_socres_previous < 28){
                last_level_describe_index = 5;
            }
            var answer = energy_socres + "分," +  energy_index_row.level + ".";
            if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
                answer += energy_index_row.today_last_level_describe[last_level_describe_index];
                answer += "想看看今日能量趋势图么?";
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                answer += energy_index_row.month_last_level_describe[last_level_describe_index];
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                answer += energy_index_row.year_last_level_describe[last_level_describe_index];
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                answer += energy_index_row.now_last_level_describe[last_level_describe_index];
                answer += "想看看今日能量趋势图么?";
            }

            cb(answer);
        }
    });
};