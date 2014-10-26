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
var compass_fly_star = require('../../config/compass_fly_star');
var compass = require('../../config/compass');

var directions = ["正南","东南","正东","东北","正北","西北","正西","西南"];

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

anylysis.getInfo = function(uid,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getInfo");
        }
        else {
            cb(info);
        }
    });
};

anylysis.getQueryStar = function(info,time_type,date){
    info.sjIndex = user.getWx(date);
    info.scwxNum = user.getScwxNum(info);
    info.fxscore = user.getFxScore(info,true);
    info.bwxNum = user.getWxNum(info, 2);
    info.flyStarWx = user.getFlyStarWx(info);
    var curDate = date;
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
    return [star_of_query,previous_star_of_query,previous_previous_star_of_query];
};

anylysis.getScore = function(info,time_type,score_type,date){
    var yearStar = parseInt(info["flystar"].charAt(2));
    var query_star = anylysis.getQueryStar(info,time_type,date);
    var star_of_query = query_star[0] ;
    var previous_star_of_query = query_star[1] ;
    var previous_previous_star_of_query = query_star[2];
    var scores_class;
    var scores_class_previous;
    if(star_of_query < 0 || star_of_query > 9){
        console.log("star_of_query value is invalid");
        star_of_query = 1;
    }
    if(previous_star_of_query < 0 || previous_star_of_query > 9){
        console.log("previous_star_of_query value is invalid");
        previous_star_of_query = 1;
    }
    if(previous_previous_star_of_query < 0 || previous_previous_star_of_query > 9){
        console.log("previous_previous_star_of_query value is invalid");
        previous_previous_star_of_query = 1;
    }
    var all_scores = scores_new[score_type][info.sex][star_of_query - 1];
    for(var i = 0; i < all_scores.length; ++i){
        if(all_scores[i].beforstar == previous_star_of_query){
            scores_class = all_scores[i];
            break;
        }
    }
    var all_scores_previous = scores_new[score_type][info.sex][previous_previous_star_of_query - 1];
    for(i = 0; i < all_scores_previous.length; ++i){
        if(all_scores_previous[i].beforstar == previous_star_of_query){
            scores_class_previous = all_scores_previous[i];
            break;
        }
    }
    if(!scores_class || !scores_class_previous){
        console.log("scores_class or scores_class_previous is null");
    }
    var scores;
    var scores_previous;
    if(consts.TYPE_SCORE.TYPE_SCORE_LUCK == score_type ||
        consts.TYPE_SCORE.TYPE_SCORE_WORK == score_type){
        if(0 == info.flyStarWx){
            scores = scores_class.scores;
            scores_previous = scores_class_previous.scores;
        }else if(1 == info.flyStarWx){
            scores = scores_class.scores2;
            scores_previous = scores_class_previous.scores2;
        }else if(2 == info.flyStarWx){
            scores = scores_class.scores3;
            scores_previous = scores_class_previous.scores3;
        }
    }else{
        scores = scores_class.scores;
        scores_previous = scores_class_previous.scores;
    }
    return [scores[yearStar -1],scores_previous[yearStar-1]];
};

anylysis.getTendency = function(info,time_type,score_type){
    var time_interval = 0;
    if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
        time_interval = 1000 * 60 * 60 * 24;
    }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
        time_interval = 1000 * 60 * 60 * 24 * 30 ;
    }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
        time_interval = 1000 * 60 * 60 * 24 * 365;
    }
    else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
        time_interval = 1000 * 60 * 60;
    }
    var tendency = [];
    for(var i = -4; i < 5; ++i){
        var time = Date.now();
        time += i * time_interval;
        var time_tmp = new Date(time);
        var scores = anylysis.getScore(info,time_type,score_type,time_tmp);
        tendency.push(scores[0]);
    }
    return tendency;
};

anylysis.getLuck2 = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var luck_socres = scores[0];
        var luck_socres_previous = scores[1];
        var luck_index_rows = alteration_index[0][0];
        var luck_index_row;
        for(var i = 0; i < luck_index_rows.length; ++i){
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
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += luck_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += luck_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += luck_index_row.now_last_level_describe[last_level_describe_index];
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        cb(answer);
    });
};

anylysis.getWork = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var work_socres = scores[0];
        var work_socres_previous = scores[1];
        var work_index_rows = alteration_index[0][1];
        var work_index_row;
        for(var i = 0; i < work_index_rows.length; ++i){
            if(work_index_rows[i].level == work_socres){
                work_index_row = work_index_rows[i];
            }
        }
        if(!work_index_row){
            console.log("work_index_row is null");
            cb(null);
            return;
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
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += work_index_row.last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += work_index_row.last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += work_index_row.last_level_describe[last_level_describe_index];
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        cb(answer);
    });
};

anylysis.getEnergy = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var energy_socres = scores[0];
        var energy_socres_previous = scores[1];
        var energy_index_rows = alteration_index[0][2];
        var energy_index_row;
        for(var i = 0; i < energy_index_rows.length; ++i){
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
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += energy_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += energy_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += energy_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getTravel = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var travel_socres = scores[0];
        var travel_socres_previous = scores[1];
        var travel_index_rows = alteration_index[0][3];
        var travel_index_row;
        for(var i = 0; i < travel_index_rows.length; ++i){
            if(travel_index_rows.length){
                var range = travel_index_rows[i].range;
                var range_array = range.split('-');
                if(travel_socres <= parseInt(range_array[0]) && travel_socres >=  parseInt(range_array[1])){
                    travel_index_row = travel_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(travel_index_row.level == "宜"){
            last_level_describe_index = 0;
        }else if(travel_index_row.level == "中"){
            last_level_describe_index = 1;
        }else if(travel_index_row.level == "不宜"){
            last_level_describe_index = 2;
        }
        var answer = travel_index_row.level + ",";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += travel_index_row.last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += travel_index_row.last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += travel_index_row.last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += travel_index_row.last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getHealth = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var health_socres = scores[0];
        var health_socres_previous = scores[1];
        var health_index_rows = alteration_index[0][4];
        var health_index_row;
        for(var i = 0; i < health_index_rows.length; ++i){
            if(health_index_rows.length){
                var range = health_index_rows[i].range;
                var range_array = range.split('-');
                if(health_socres <= parseInt(range_array[0]) && health_socres >=  parseInt(range_array[1])){
                    health_index_row = health_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(health_socres_previous >= 90 && health_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(health_socres_previous >= 80 && health_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(health_socres_previous >= 60 && health_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(health_socres_previous >= 45 && health_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(health_socres_previous >= 29 && health_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(health_socres_previous >= 0 && health_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = health_socres + "分," +  health_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += health_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += health_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += health_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += health_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getWealth = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var wealth_socres = scores[0];
        var wealth_socres_previous = scores[1];
        var wealth_index_rows = alteration_index[0][5];
        var wealth_index_row;
        for(var i = 0; i < wealth_index_rows.length; ++i){
            if(wealth_index_rows.length){
                var range = wealth_index_rows[i].range;
                var range_array = range.split('-');
                if(wealth_socres <= parseInt(range_array[0]) && wealth_socres >=  parseInt(range_array[1])){
                    wealth_index_row = wealth_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(wealth_socres_previous >= 90 && wealth_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(wealth_socres_previous >= 80 && wealth_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(wealth_socres_previous >= 60 && wealth_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(wealth_socres_previous >= 45 && wealth_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(wealth_socres_previous >= 29 && wealth_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(wealth_socres_previous >= 0 && wealth_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = wealth_socres + "分," +  wealth_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += wealth_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += wealth_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += wealth_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += wealth_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getWealthLose = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var wealth_lose_socres = scores[0];
        var wealth_lose_socres_previous = scores[1];
        var wealth_lose_index_rows = alteration_index[0][6];
        var wealth_lose_index_row;
        for(var i = 0; i < wealth_lose_index_rows.length; ++i){
            if(wealth_lose_index_rows.length){
                var range = wealth_lose_index_rows[i].range;
                var range_array = range.split('-');
                if(wealth_lose_socres <= parseInt(range_array[0]) && wealth_lose_socres >=  parseInt(range_array[1])){
                    wealth_lose_index_row = wealth_lose_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(wealth_lose_socres_previous >= 90 && wealth_lose_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(wealth_lose_socres_previous >= 80 && wealth_lose_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(wealth_lose_socres_previous >= 60 && wealth_lose_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(wealth_lose_socres_previous >= 45 && wealth_lose_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(wealth_lose_socres_previous >= 29 && wealth_lose_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(wealth_lose_socres_previous >= 0 && wealth_lose_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = wealth_lose_socres + "分," +  wealth_lose_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += wealth_lose_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += wealth_lose_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += wealth_lose_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += wealth_lose_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getShopping = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var shopping_socres = scores[0];
        var shopping_socres_previous = scores[1];
        var shopping_index_rows = alteration_index[0][7];
        var shopping_index_row;
        for(var i = 0; i < shopping_index_rows.length; ++i){
            if(shopping_index_rows.length){
                var range = shopping_index_rows[i].range;
                var range_array = range.split('-');
                if(shopping_socres <= parseInt(range_array[0]) && shopping_socres >=  parseInt(range_array[1])){
                    shopping_index_row = shopping_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(shopping_socres_previous >= 75 && shopping_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(shopping_socres_previous >= 60 && shopping_socres_previous < 74){
            last_level_describe_index = 1;
        }else if(shopping_socres_previous >= 0 && shopping_socres_previous < 59){
            last_level_describe_index = 2;
        }
        var answer = shopping_socres + "分," +  shopping_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += shopping_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += shopping_index_row.month_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getStudy = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var study_socres = scores[0];
        var study_socres_previous = scores[1];
        var study_index_rows = alteration_index[0][8];
        var study_index_row;
        for(var i = 0; i < study_index_rows.length; ++i){
            if(study_index_rows.length){
                var range = study_index_rows[i].range;
                var range_array = range.split('-');
                if(study_socres <= parseInt(range_array[0]) && study_socres >=  parseInt(range_array[1])){
                    study_index_row = study_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(study_socres_previous >= 90 && study_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(study_socres_previous >= 80 && study_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(study_socres_previous >= 60 && study_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(study_socres_previous >= 45 && study_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(study_socres_previous >= 29 && study_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(study_socres_previous >= 0 && study_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = study_socres + "分," +  study_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += study_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += study_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += study_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += study_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getCareer = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var career_socres = scores[0];
        var career_socres_previous = scores[1];
        var career_index_rows = alteration_index[0][9];
        var career_index_row;
        for(var i = 0; i < career_index_rows.length; ++i){
            if(career_index_rows.length){
                var range = career_index_rows[i].range;
                var range_array = range.split('-');
                if(career_socres <= parseInt(range_array[0]) && career_socres >=  parseInt(range_array[1])){
                    career_index_row = career_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(career_socres_previous >= 90 && career_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(career_socres_previous >= 80 && career_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(career_socres_previous >= 60 && career_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(career_socres_previous >= 45 && career_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(career_socres_previous >= 29 && career_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(career_socres_previous >= 0 && career_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = career_socres + "分," +  career_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += career_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += career_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += career_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += career_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getPrayForWealth = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var pray_for_wealth_socres = scores[0];
        var pray_for_wealth_socres_previous = scores[1];
        var pray_for_wealth_index_rows = alteration_index[0][10];
        var pray_for_wealth_index_row;
        for(var i = 0; i < pray_for_wealth_index_rows.length; ++i){
            if(pray_for_wealth_index_rows.length){
                var range = pray_for_wealth_index_rows[i].range;
                var range_array = range.split('-');
                if(pray_for_wealth_socres <= parseInt(range_array[0]) && pray_for_wealth_socres >=  parseInt(range_array[1])){
                    pray_for_wealth_index_row = pray_for_wealth_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(pray_for_wealth_socres_previous >= 75 && pray_for_wealth_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(pray_for_wealth_socres_previous >= 60 && pray_for_wealth_socres_previous < 74){
            last_level_describe_index = 1;
        }else if(pray_for_wealth_socres_previous >= 0 && pray_for_wealth_socres_previous < 59){
            last_level_describe_index = 2;
        }
        var answer = pray_for_wealth_socres + "分," +  pray_for_wealth_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += pray_for_wealth_index_row.today_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getEmotion = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var emotion_socres = scores[0];
        var emotion_socres_previous = scores[1];
        var emotion_index_rows = alteration_index[0][11];
        var emotion_index_row;
        for(var i = 0; i < emotion_index_rows.length; ++i){
            if(emotion_index_rows.length){
                var range = emotion_index_rows[i].range;
                var range_array = range.split('-');
                if(emotion_socres <= parseInt(range_array[0]) && emotion_socres >=  parseInt(range_array[1])){
                    emotion_index_row = emotion_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(emotion_socres_previous >= 90 && emotion_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(emotion_socres_previous >= 80 && emotion_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(emotion_socres_previous >= 60 && emotion_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(emotion_socres_previous >= 45 && emotion_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(emotion_socres_previous >= 29 && emotion_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(emotion_socres_previous >= 0 && emotion_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = emotion_socres + "分," +  emotion_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += emotion_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += emotion_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += emotion_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += emotion_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getConfrere = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var emotion_socres = scores[0];
        var emotion_socres_previous = scores[1];
        var emotion_index_rows = alteration_index[0][12];
        var emotion_index_row;
        for(var i = 0; i < emotion_index_rows.length; ++i){
            if(emotion_index_rows.length){
                var range = emotion_index_rows[i].range;
                var range_array = range.split('-');
                if(emotion_socres <= parseInt(range_array[0]) && emotion_socres >=  parseInt(range_array[1])){
                    emotion_index_row = emotion_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(emotion_socres_previous >= 90 && emotion_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(emotion_socres_previous >= 80 && emotion_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(emotion_socres_previous >= 60 && emotion_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(emotion_socres_previous >= 45 && emotion_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(emotion_socres_previous >= 29 && emotion_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(emotion_socres_previous >= 0 && emotion_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = emotion_socres + "分," +  emotion_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += emotion_index_row.today_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getFeeling = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var emotion_socres = scores[0];
        var emotion_socres_previous = scores[1];
        var emotion_index_rows = alteration_index[0][13];
        var emotion_index_row;
        for(var i = 0; i < emotion_index_rows.length; ++i){
            if(emotion_index_rows.length){
                var range = emotion_index_rows[i].range;
                var range_array = range.split('-');
                if(emotion_socres <= parseInt(range_array[0]) && emotion_socres >=  parseInt(range_array[1])){
                    emotion_index_row = emotion_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(emotion_socres_previous >= 90 && emotion_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(emotion_socres_previous >= 80 && emotion_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(emotion_socres_previous >= 60 && emotion_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(emotion_socres_previous >= 45 && emotion_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(emotion_socres_previous >= 29 && emotion_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(emotion_socres_previous >= 0 && emotion_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = emotion_socres + "分," +  emotion_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += emotion_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += emotion_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += emotion_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += emotion_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getPeach = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var emotion_socres = scores[0];
        var emotion_socres_previous = scores[1];
        var emotion_index_rows = alteration_index[0][14];
        var emotion_index_row;
        for(var i = 0; i < emotion_index_rows.length; ++i){
            if(emotion_index_rows.length){
                var range = emotion_index_rows[i].range;
                var range_array = range.split('-');
                if(emotion_socres <= parseInt(range_array[0]) && emotion_socres >=  parseInt(range_array[1])){
                    emotion_index_row = emotion_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(emotion_socres_previous >= 90 && emotion_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(emotion_socres_previous >= 80 && emotion_socres_previous < 89){
            last_level_describe_index = 1;
        }else if(emotion_socres_previous >= 60 && emotion_socres_previous < 79){
            last_level_describe_index = 2;
        }else if(emotion_socres_previous >= 45 && emotion_socres_previous < 59){
            last_level_describe_index = 3;
        }else if(emotion_socres_previous >= 29 && emotion_socres_previous < 44){
            last_level_describe_index = 4;
        }else if(emotion_socres_previous >= 0 && emotion_socres_previous < 28){
            last_level_describe_index = 5;
        }
        var answer = emotion_socres + "分," +  emotion_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += emotion_index_row.today_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer += emotion_index_row.month_last_level_describe[last_level_describe_index];
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer += emotion_index_row.year_last_level_describe[last_level_describe_index];
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer += emotion_index_row.now_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getChase = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var pray_for_wealth_socres = scores[0];
        var pray_for_wealth_socres_previous = scores[1];
        var pray_for_wealth_index_rows = alteration_index[0][15];
        var pray_for_wealth_index_row;
        for(var i = 0; i < pray_for_wealth_index_rows.length; ++i){
            if(pray_for_wealth_index_rows.length){
                var range = pray_for_wealth_index_rows[i].range;
                var range_array = range.split('-');
                if(pray_for_wealth_socres <= parseInt(range_array[0]) && pray_for_wealth_socres >=  parseInt(range_array[1])){
                    pray_for_wealth_index_row = pray_for_wealth_index_rows[i];
                    break;
                }
            }
        }
        var last_level_describe_index = 0;
        if(pray_for_wealth_socres_previous >= 75 && pray_for_wealth_socres_previous < 98){
            last_level_describe_index = 0;
        }else if(pray_for_wealth_socres_previous >= 60 && pray_for_wealth_socres_previous < 74){
            last_level_describe_index = 1;
        }else if(pray_for_wealth_socres_previous >= 0 && pray_for_wealth_socres_previous < 59){
            last_level_describe_index = 2;
        }
        var answer = pray_for_wealth_socres + "分," +  pray_for_wealth_index_row.level + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer += pray_for_wealth_index_row.today_last_level_describe[last_level_describe_index];
        }
        cb(answer);
    });
};

anylysis.getCompassText = function(type,score){
    var text;
    switch (type){
        case consts.TYPE_COMPASS.TYPE_COMPASS_ENERGY:{
            if(score > 90 && score <= 98){
                text = "超高";
            }else if(score > 80 && score <= 89){
                text = "高";
            }else if(score > 60 && score <= 79){
                text = "中等";
            }else if(score > 45 && score <= 59){
                text = "较低";
            }else if(score > 29 && score <= 44){
                text = "很低";
            }else if(score > 0 && score <= 28){
                text = "最低";
            }
            break;
        }
        case consts.TYPE_COMPASS.TYPE_COMPASS_WEALTH:{
            if(score > 90 && score <= 98){
                text = "滚滚";
            }else if(score > 80 && score <= 89){
                text = "大利";
            }else if(score > 60 && score <= 79){
                text = "中等";
            }else if(score > 45 && score <= 59){
                text = "小损";
            }else if(score > 29 && score <= 44){
                text = "破财";
            }else if(score > 0 && score <= 28){
                text = "崩盘";
            }
            break;
        }
        case consts.TYPE_COMPASS.TYPE_COMPASS_LUCK:{
            if(score > 90 && score <= 98){
                text = "大顺";
            }else if(score > 80 && score <= 89){
                text = "顺";
            }else if(score > 60 && score <= 79){
                text = "一般";
            }else if(score > 45 && score <= 59){
                text = "不顺";
            }else if(score > 29 && score <= 44){
                text = "堵塞";
            }else if(score > 0 && score <= 28){
                text = "崩溃";
            }
            break;
        }
        case consts.TYPE_COMPASS.TYPE_COMPASS_PEACH:{
            if(score > 90 && score <= 98){
                text = "大旺";
            }else if(score > 80 && score <= 89){
                text = "旺";
            }else if(score > 60 && score <= 79){
                text = "中等";
            }else if(score > 45 && score <= 59){
                text = "凋谢";
            }else if(score > 29 && score <= 44){
                text = "残破";
            }else if(score > 0 && score <= 28){
                text = "落败";
            }
            break;
        }
    }
    return text;
};

anylysis.getCompassScore = function(uid,type,cb){
    anylysis.getInfo(uid,function(info){
        var yearStar = parseInt(info["flystar"].charAt(2));
        info.sjIndex = user.getWx(new Date());
        info.scwxNum = user.getScwxNum(info);
        info.fxscore = user.getFxScore(info,true);
        info.bwxNum = user.getWxNum(info, 2);
        info.flyStarWx = user.getFlyStarWx(info);
        var curDate = new Date();
        var hourStar = user.getClockStar(curDate);
        var dayStar = user.getDayStar(curDate);
        var compass_fly_star_row = compass_fly_star[0][info.sex][dayStar -1][hourStar -1];
        var compass_fly_star_scores = [];
        var luck_compass_scores = compass[type][info.sex][yearStar -1];
        //  fix luck_compass_scores
        for(var m = 0; m < luck_compass_scores[1].scores.length; ++m){
            if(!(m % 2)){
                luck_compass_scores[1].scores[m] = luck_compass_scores[1].scores[m]*10%10;
            }
        }
        for(var i = 1; i < compass_fly_star_row.scores.length; ++i){
            compass_fly_star_scores.push([compass_fly_star_row.scores[i], compass_fly_star_row.scores[++i]]);
        }
        var scores = [];
        for(var j = 0; j < compass_fly_star_scores.length; ++j){
            for(var k = 1; k < luck_compass_scores.length; ++k){
                if(compass_fly_star_scores[j][0] == luck_compass_scores[k].scores[0]){
                    scores.push(luck_compass_scores[k].scores[j*2 + 1]);
                    break;
                }
            }
        }
        console.log("%j",scores);
        cb(scores);
    });
};

anylysis.getCompassMax = function(uid,type,cb){
    anylysis.getCompassScore(uid,type,function(scores){
        // sort scores
        for(var l = 0; l < scores.length; ++l){
            scores[l] = scores[l]*100 + l;
        }
        scores.sort();
        var index = scores[scores.length-1]%100;
        var direction = directions[index-1];
        var score = ( scores[scores.length-1] - index ) / 100;
        var text = anylysis.getCompassText(type,score);
        var answer = direction + "," + score + "分," + text;
        cb(answer);
        console.log("%j",answer);
    });
};

anylysis.getCompass = function(uid,type,cb){
    anylysis.getCompassScore(uid,type,function(scores){
        var answer = [];
        for(var i = 0; i < scores.length; ++i){
            answer.push({"score":scores[i],"direction":directions[i],"text":anylysis.getCompassText(type,scores[i])});
        }
        console.log("%j",answer);
        cb(answer);
    });
};