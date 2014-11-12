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
var match = require('../../config/match');
var scores_new_addition = require('../../config/scores_new_addition');
var comm = require('../../common');

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
    var yearStar = /*parseInt(info["flystar"].charAt(2))*/user.getYearStar(curDate);
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

anylysis.convert_seasons_five_elements = function(seasons_five_elements){
    var convert_val;
    switch (seasons_five_elements){
        case 0:{
            convert_val = 2;
            break;
        }
        case 1:{
            convert_val = 3;
            break;
        }
        case 2:{
            convert_val = 1;
            break;
        }
        case 3:{
            convert_val = 0;
            break;
        }
        case 4:{
            convert_val = 4;
            break;
        }
    }
    return convert_val;
}
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
    var all_scores_previous = scores_new[score_type][info.sex][previous_star_of_query - 1];
    for(i = 0; i < all_scores_previous.length; ++i){
        if(all_scores_previous[i].beforstar == previous_previous_star_of_query){
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
        if(1 == info.flyStarWx){
            scores = scores_class.scores;
            scores_previous = scores_class_previous.scores;
        }else if(0 == info.flyStarWx){
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

    //  calc addition
    var seasons_five_elements = user.getWx(date);
    seasons_five_elements = anylysis.convert_seasons_five_elements(seasons_five_elements);
    var current_stars = star_of_query;
    var stars_index;
    var probability = 1;
    if(consts.TYPE_SCORE.TYPE_SCORE_LUCK == score_type
        || consts.TYPE_SCORE.TYPE_SCORE_WEALTH == score_type
        || consts.TYPE_SCORE.TYPE_SCORE_EMOTION == score_type
        || consts.TYPE_SCORE.TYPE_SCORE_ENERGY == score_type
        || consts.TYPE_SCORE.TYPE_SCORE_PEACH == score_type
        ){
        var score_new_addition_year_star = scores_new_addition[score_type][info.sex][yearStar - 1];
        var score_new_addition_year_star_stars_meet;
        var addition;
        if(consts.TYPE_SCORE.TYPE_SCORE_LUCK == score_type){
            if(1 == info.flyStarWx){
                score_new_addition_year_star_stars_meet = score_new_addition_year_star[0].stars_meet1;
                addition = score_new_addition_year_star[seasons_five_elements + 1].addition1;
            }else if(0 == info.flyStarWx){
                score_new_addition_year_star_stars_meet = score_new_addition_year_star[0].stars_meet2;
                addition = score_new_addition_year_star[seasons_five_elements + 1].addition2;
            }else if(2 == info.flyStarWx){
                score_new_addition_year_star_stars_meet = score_new_addition_year_star[0].stars_meet3;
                addition = score_new_addition_year_star[seasons_five_elements + 1].addition3;
            }
        }
        else{
            score_new_addition_year_star_stars_meet = score_new_addition_year_star[0].stars_meet;
        }
        if(score_new_addition_year_star_stars_meet && addition){
            for(var i = 0; i < score_new_addition_year_star_stars_meet.length; ++i){
                for(var j = 0; j < score_new_addition_year_star_stars_meet[i].length; ++j){
                    if(score_new_addition_year_star_stars_meet[i][j] == current_stars){
                        stars_index = i;
                        break;
                    }
                }
            }
            probability = addition[stars_index?stars_index:0];
        }
    }
    if(time_type == consts.TYPE_TIME.TYPE_TIME_THIS_YEAR){
        probability = 1;
    }
    var number1 = scores[yearStar -1]*probability;
    var number2 = scores_previous[yearStar-1]*probability;
    return [number1.toFixed(1),number2.toFixed(1)];
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
    for(var i = -2; i < 7; ++i){
        var time = Date.now();
        time += i * time_interval;
        var time_tmp = new Date(time);
        var scores = anylysis.getScore(info,time_type,score_type,time_tmp);
        tendency.push(scores[0]);
    }
    return tendency;
};

anylysis.getTendencyFuture = function(info,days,score_type){
    var time_interval = 1000 * 60 * 60 * 24;
    var tendency = [];
    for(var i = 0; i < days; ++i){
        var time = Date.now();
        time += i * time_interval;
        var time_tmp = new Date(time);
        var scores = anylysis.getScore(info,consts.TYPE_TIME.TYPE_TIME_TODAY,score_type,time_tmp);
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
                if(Math.floor(luck_socres) <= parseInt(range_array[0]) && Math.floor(luck_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = luck_socres + "分。";
        answer.level = luck_index_row ? luck_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = luck_index_row?luck_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = luck_index_row?luck_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = luck_index_row?luck_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = luck_index_row?luck_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
        var answer = {};
        answer.level = work_index_row?work_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = work_index_row?work_index_row.last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = work_index_row?work_index_row.last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = work_index_row?work_index_row.last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = work_index_row?work_index_row.last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(energy_socres) <= parseInt(range_array[0]) && Math.floor(energy_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = energy_socres + "分。";
        answer.level = energy_index_row?energy_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = energy_index_row?energy_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = energy_index_row?energy_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = energy_index_row?energy_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = energy_index_row?energy_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(travel_socres) <= parseInt(range_array[0]) && Math.floor(travel_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.level = travel_index_row?travel_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = travel_index_row?travel_index_row.last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = travel_index_row?travel_index_row.last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = travel_index_row?travel_index_row.last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = travel_index_row?travel_index_row.last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(health_socres) <= parseInt(range_array[0]) && Math.floor(health_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = health_socres; + "分。"
        answer.level = health_index_row?health_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.level = health_index_row?health_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.level = health_index_row?health_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.level = health_index_row?health_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.level = health_index_row?health_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(wealth_socres) <= parseInt(range_array[0]) && Math.floor(wealth_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = wealth_socres + "分。";
        answer.level = wealth_index_row?wealth_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = wealth_index_row?wealth_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = wealth_index_row?wealth_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = wealth_index_row?wealth_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = wealth_index_row?wealth_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(wealth_lose_socres) <= parseInt(range_array[0]) && Math.floor(wealth_lose_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = wealth_lose_socres + "分。";
        answer.level = wealth_lose_index_row?wealth_lose_index_row.level:0 + ".";
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = wealth_lose_index_row?wealth_lose_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = wealth_lose_index_row?wealth_lose_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = wealth_lose_index_row?wealth_lose_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = wealth_lose_index_row?wealth_lose_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(shopping_socres) <= parseInt(range_array[0]) && Math.floor(shopping_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = shopping_socres + "分。";
        answer.level = shopping_index_row?shopping_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = shopping_index_row?shopping_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = shopping_index_row?shopping_index_row.month_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(study_socres) <= parseInt(range_array[0]) && Math.floor(study_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = study_socres + "分。";
        answer.level = study_index_row?study_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = study_index_row?study_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = study_index_row?study_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = study_index_row?study_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = study_index_row?study_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(career_socres) <= parseInt(range_array[0]) && Math.floor(career_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = career_socres + "分。";
        answer.level = career_index_row?career_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = career_index_row?career_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = career_index_row?career_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = career_index_row?career_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = career_index_row?career_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(pray_for_wealth_socres) <= parseInt(range_array[0]) && Math.floor(pray_for_wealth_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = pray_for_wealth_socres + "分。";
        answer.level = pray_for_wealth_index_row?pray_for_wealth_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc =  pray_for_wealth_index_row?pray_for_wealth_index_row.today_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(emotion_socres) <= parseInt(range_array[0]) && Math.floor(emotion_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = emotion_socres + "分。";
        answer.level = emotion_index_row?emotion_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = emotion_index_row?emotion_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = emotion_index_row?emotion_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = emotion_index_row?emotion_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = emotion_index_row?emotion_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(emotion_socres) <= parseInt(range_array[0]) && Math.floor(emotion_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = emotion_socres + "分。";
        answer.level = emotion_index_row?emotion_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = emotion_index_row?emotion_index_row.today_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
        cb(answer);
    });
};

anylysis.getFeeling = function(uid,time_type,score_type,cb){
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
                if(Math.floor(emotion_socres) <= parseInt(range_array[0]) && Math.floor(emotion_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = emotion_socres + "分。";
        answer.level = emotion_index_row?emotion_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = emotion_index_row?emotion_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = emotion_index_row?emotion_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = emotion_index_row?emotion_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = emotion_index_row?emotion_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
        cb(answer);
    });
};

anylysis.getPeach = function(uid,time_type,score_type,cb){
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
                if(Math.floor(emotion_socres) <= parseInt(range_array[0]) && Math.floor(emotion_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = emotion_socres + "分。";
        answer.level = emotion_index_row?emotion_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = emotion_index_row?emotion_index_row.today_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
            answer.desc = emotion_index_row?emotion_index_row.month_last_level_describe[last_level_describe_index]:"";
        }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
            answer.desc = emotion_index_row?emotion_index_row.year_last_level_describe[last_level_describe_index]:"";
        }
        else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
            answer.desc = emotion_index_row?emotion_index_row.now_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
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
                if(Math.floor(pray_for_wealth_socres) <= parseInt(range_array[0]) && Math.floor(pray_for_wealth_socres) >=  parseInt(range_array[1])){
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
        var answer = {};
        answer.score = pray_for_wealth_socres + "分。";
        answer.level = pray_for_wealth_index_row?pray_for_wealth_index_row.level:0;
        if(consts.TYPE_TIME.TYPE_TIME_TODAY == time_type){
            answer.desc = pray_for_wealth_index_row?pray_for_wealth_index_row.today_last_level_describe[last_level_describe_index]:"";
        }
        var tendency = anylysis.getTendency(info,time_type,score_type);
        console.log("%j",tendency);
        answer.tendency = tendency;
        cb(answer);
    });
};

anylysis.getCompassText = function(type,score){
    var text;
    switch (type){
        case consts.TYPE_COMPASS.TYPE_COMPASS_ENERGY:{
            if(score >= 90 && score <= 98){
                text = "超高";
            }else if(score >= 80 && score <= 89){
                text = "高";
            }else if(score >= 60 && score <= 79){
                text = "中等";
            }else if(score >= 45 && score <= 59){
                text = "较低";
            }else if(score >= 29 && score <= 44){
                text = "很低";
            }else if(score >= 0 && score <= 28){
                text = "最低";
            }
            break;
        }
        case consts.TYPE_COMPASS.TYPE_COMPASS_WEALTH:{
            if(score >= 90 && score <= 98){
                text = "滚滚";
            }else if(score >= 80 && score <= 89){
                text = "大利";
            }else if(score >= 60 && score <= 79){
                text = "中等";
            }else if(score >= 45 && score <= 59){
                text = "小损";
            }else if(score >= 29 && score <= 44){
                text = "破财";
            }else if(score >= 0 && score <= 28){
                text = "崩盘";
            }
            break;
        }
        case consts.TYPE_COMPASS.TYPE_COMPASS_LUCK:{
            if(score >= 90 && score <= 98){
                text = "大顺";
            }else if(score >= 80 && score <= 89){
                text = "顺";
            }else if(score >= 60 && score <= 79){
                text = "一般";
            }else if(score >= 45 && score <= 59){
                text = "不顺";
            }else if(score >= 29 && score <= 44){
                text = "堵塞";
            }else if(score >= 0 && score <= 28){
                text = "崩溃";
            }
            break;
        }
        case consts.TYPE_COMPASS.TYPE_COMPASS_PEACH:{
            if(score > 90 && score <= 98){
                text = "大旺";
            }else if(score >= 80 && score <= 89){
                text = "旺";
            }else if(score >= 60 && score <= 79){
                text = "中等";
            }else if(score >= 45 && score <= 59){
                text = "凋谢";
            }else if(score >= 29 && score <= 44){
                text = "残破";
            }else if(score >= 0 && score <= 28){
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
                var string_tmp = luck_compass_scores[1].scores[m].toString();
                if(string_tmp.length > 1){
                    luck_compass_scores[1].scores[m] = luck_compass_scores[1].scores[m]*10%10;
                }
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
        var direction = directions[index];
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
        console.log(scores.length);
        for(var i = 0; i < scores.length; ++i){
            answer.push({"score":scores[i],"direction":directions[i],"text":anylysis.getCompassText(type,scores[i])});
        }
        console.log("%j",answer);
        cb(answer);
    });
};

anylysis.buildUserInfo = function(info){
    var reqData = {
        name:			info.name,
        sex:			parseInt(info.sex),
        registAddress:	parseInt(info.registAddress)-1,
        birthAddress:	parseInt(info.birthAddress)-1,
        year:			parseInt(info.birthday.substr(0, 4)),
        month:			parseInt(info.birthday.substr(4, 2)),
        day:			parseInt(info.birthday.substr(6, 2)),
        clock:			parseInt(info.birthday.substr(8, 2))
    }

    var userInfo = user.getUserInfo(reqData);


    reqData.clock = (reqData.clock + 1) % 24;
    reqData.clock = Math.floor(reqData.clock / 2);


    //查询数据库，获得吉凶值
    db.getUserLastJxScore(userInfo, function (jxScore) {
        //  fix userInfo.wxBaseScore
        /*
         特殊规定如下：1、3颗财星，不足80分，统一调整80分。
         2、4颗财星，不足85分，统一调整85分。
         3、5颗财星，不足92分，统一调整92分。
         */
        var wealth_stars = userInfo.wealth_stars;
        var wealth_stars_three_scores = 80;
        var wealth_stars_four_scores = 85;
        var wealth_stars_five_scores = 92;
        if(wealth_stars == 3){
            if(userInfo.wxBaseScore < wealth_stars_three_scores){
                userInfo.wxBaseScore = wealth_stars_three_scores;
            }
        }else if(wealth_stars == 4){
            if(userInfo.wxBaseScore < wealth_stars_four_scores){
                userInfo.wxBaseScore = wealth_stars_four_scores;
            }
        }else if(wealth_stars == 5){
            if(userInfo.wxBaseScore < wealth_stars_five_scores){
                userInfo.wxBaseScore = wealth_stars_five_scores;
            }
        }
        userInfo.hightScore = (70 * (jxScore + userInfo.wxBaseScore)).toFixed(0);
    });
    return userInfo;
};

anylysis.getHighScores = function(info,cb){
    var userInfo = anylysis.buildUserInfo(info);
    var wxBaseScoreJson = comm.getWxBaseScoreJson();
    userInfo.wxBaseScore = wxBaseScoreJson[parseInt(userInfo.sex)][userInfo.flystar.substr(0, 3)][userInfo.bwxNum.toString()];
    db.getUserLastJxScore(userInfo, function (jxScore) {
        //  fix userInfo.wxBaseScore
        /*
         特殊规定如下：1、3颗财星，不足80分，统一调整80分。
         2、4颗财星，不足85分，统一调整85分。
         3、5颗财星，不足92分，统一调整92分。
         */
        var wealth_stars = userInfo.wealth_stars;
        var wealth_stars_three_scores = 80;
        var wealth_stars_four_scores = 85;
        var wealth_stars_five_scores = 92;
        if (wealth_stars == 3) {
            if (userInfo.wxBaseScore < wealth_stars_three_scores) {
                userInfo.wxBaseScore = wealth_stars_three_scores;
            }
        } else if (wealth_stars == 4) {
            if (userInfo.wxBaseScore < wealth_stars_four_scores) {
                userInfo.wxBaseScore = wealth_stars_four_scores;
            }
        } else if (wealth_stars == 5) {
            if (userInfo.wxBaseScore < wealth_stars_five_scores) {
                userInfo.wxBaseScore = wealth_stars_five_scores;
            }
        }
        userInfo.hightScore = (70 * (jxScore + userInfo.wxBaseScore)).toFixed(0);
        cb(userInfo.hightScore);
    });
};

anylysis.getFixationBless = function(uid,type,cb){
    anylysis.getInfo(uid, function (info) {
        anylysis.getHighScores(info,function(high_score){
            var bless_index_rows = fixation_index[0][type];
            for(var i = 0; i < bless_index_rows.length; ++i){
                var range = bless_index_rows[i].range;
                var range_array = range.split('-');
                var range_high = parseInt(range_array[1]);
                var range_low = parseInt(range_array[0]);
                if(high_score < (range_high) && high_score >= (range_low)){
                    var answer = {};
                    answer.score = high_score;
                    answer.level = bless_index_rows[i].level;
                    answer.desc = bless_index_rows[i].describe;
                    cb(answer);
                    break;
                }
            }
        });
    });
};

anylysis.getFixationEnergy = function(uid,type,cb){
    anylysis.getInfo(uid, function (info) {
        var userInfo = anylysis.buildUserInfo(info);
        var wxBaseScoreJson = comm.getWxBaseScoreJson();
        userInfo.wxBaseScore = wxBaseScoreJson[parseInt(userInfo.sex)][userInfo.flystar.substr(0, 3)][userInfo.bwxNum.toString()];
        var energy_index_rows = fixation_index[0][type];
        for(var i = 0; i < energy_index_rows.length; ++i){
            var range = energy_index_rows[i].range;
            var range_array = range.split('-');
            var range_low = parseInt(range_array[1]);
            var range_high = parseInt(range_array[0]);
            if(userInfo.wxBaseScore < (range_high) && userInfo.wxBaseScore >= (range_low)){
                var answer = {};
                answer.score = userInfo.wxBaseScore;
                answer.level = energy_index_rows[i].level;
                answer.desc = energy_index_rows[i].describe;
                cb(answer);
                break;
            }
        }
    });
};

anylysis.getFixationLuck = function(uid,type,cb){
    anylysis.getInfo(uid, function (info) {
        var userInfo = anylysis.buildUserInfo(info);
        var energy_index_rows = fixation_index[0][type];
        db.getUserLastJxScore(userInfo, function (jxScore) {
            for(var i = 0; i < energy_index_rows.length; ++i){
                var range = energy_index_rows[i].range;
                var range_array = range.split('-');
                var range_low = parseInt(range_array[1]);
                var range_high = parseInt(range_array[0]);
                if(userInfo.baseZyScore < (range_high) && userInfo.baseZyScore >= (range_low)){
                    var answer = {};
                    answer.score = userInfo.baseZyScore;
                    answer.level = energy_index_rows[i].level;
                    answer.desc = energy_index_rows[i].describe;
                    cb(answer);
                    break;
                }
            }
        });
    });
};

anylysis.getFixationWealth = function(uid,type,cb){
    anylysis.getInfo(uid, function (info) {
        var userInfo = anylysis.buildUserInfo(info);
        var energy_index_rows = fixation_index[0][type];
        db.getUserLastJxScore(userInfo, function (jxScore) {

            //  fix userInfo.wxBaseScore
            /*
             特殊规定如下：1、3颗财星，不足80分，统一调整80分。
             2、4颗财星，不足85分，统一调整85分。
             3、5颗财星，不足92分，统一调整92分。
             */
            var wealth_stars = userInfo.wealth_stars;
            var wealth_stars_three_scores = 80;
            var wealth_stars_four_scores = 85;
            var wealth_stars_five_scores = 92;
            if (wealth_stars == 3) {
                if (userInfo.wxBaseScore < wealth_stars_three_scores) {
                    userInfo.wxBaseScore = wealth_stars_three_scores;
                }
            } else if (wealth_stars == 4) {
                if (userInfo.wxBaseScore < wealth_stars_four_scores) {
                    userInfo.wxBaseScore = wealth_stars_four_scores;
                }
            } else if (wealth_stars == 5) {
                if (userInfo.wxBaseScore < wealth_stars_five_scores) {
                    userInfo.wxBaseScore = wealth_stars_five_scores;
                }
            }
            userInfo.hightScore = (70 * (jxScore + userInfo.wxBaseScore)).toFixed(0);

            var wealth_stars = userInfo.wealth_stars;
            var wealth_stars_stores;
            if(0 == wealth_stars){
                wealth_stars_stores = 50;
            }else if(1 == wealth_stars){
                wealth_stars_stores = 65;
            }else if(2 == wealth_stars){
                wealth_stars_stores = 70;
            }else if(3 == wealth_stars){
                wealth_stars_stores = 80;
            }else if(4 == wealth_stars || 5 == wealth_stars){
                wealth_stars_stores = 90;
            }
            var hightScoreDivisor = Math.floor(userInfo.hightScore / 70);
            var reference_data = [
                [0,50,0.72],
                [51,52,0.73],
                [53,54,0.74],
                [55,56,0.75],
                [57,58,0.76],
                [59,60,0.77],
                [61,62,0.78],
                [63,64,0.79],
                [65,66,0.80],
                [67,68,0.81],
                [69,70,0.82],
                [71,72,0.83],
                [73,74,0.84],
                [75,76,0.85],
                [77,78,0.86],
                [79,80,0.87],
                [81,82,0.88],

                [93,94,1.12],
                [95,96,1.13],
                [97,98,1.14],
                [99,100,1.15],
                [101,102,1.16],
                [103,104,1.17],
                [105,106,1.18],
                [107,108,1.19],
                [109,110,1.20],
                [111,112,1.21],
                [113,114,1.22],
                [115,116,1.23],
                [117,118,1.24],
                [119,120,1.25],
                [121,122,1.26],
                [123,123,1.27]
            ];
            var frequency;
            for(var m = 0; m < reference_data.length; ++m){
                if(hightScoreDivisor == reference_data[m][0] || hightScoreDivisor == reference_data[m][1]){
                    frequency = reference_data[m][2];
                    break;
                }
            }
            var wealth_stars_stores_last = Math.floor((wealth_stars_stores?wealth_stars_stores:100) * (frequency?frequency:1));
            for(var i = 0; i < energy_index_rows.length; ++i){
                var range = energy_index_rows[i].range;
                var range_array = range.split('-');
                var range_high = parseInt(range_array[1]);
                var range_low = parseInt(range_array[0]);
                if(wealth_stars_stores_last < (range_high) && wealth_stars_stores_last >= (range_low)){
                    var answer = {};
                    answer.score = userInfo.wealth_stars_stores_last;
                    answer.level = energy_index_rows[i].level;
                    answer.desc = energy_index_rows[i].describe;
                    cb(answer);
                    break;
                }
            }
        });
    });
};

anylysis.getSelectDate = function (uid, select_date_type, days_type, cb) {
    anylysis.getInfo(uid, function (info) {
        var days = 10;
        if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
            days = 10;
        }else if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_THIRTY){
            days = 30;
        }else if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_NINETY){
            days = 90;
        }
        var date = [];
        var time_to_be_choose;
        switch (select_date_type) {
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_DO_SOMETHING:
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_MOVING:
            {
                var tendency_work = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_WORK);
                var tendency_luck = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_LUCK);
                var tendency_energy = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_ENERGY);
                var tendency_work_to_be_choose = [];
                var tendency_energy_to_be_choose = [];
                for(var i = 0; i < tendency_work.length; ++i){
                    if("宜" == tendency_work[i]){
                        tendency_work_to_be_choose.push(i);
                    }
                }
                for(var j = 0; j < tendency_work_to_be_choose.length; ++j){
                    if(tendency_luck[tendency_work_to_be_choose[j]] >= 90 && tendency_luck[tendency_work_to_be_choose[j]] <= 98){
                        tendency_energy_to_be_choose.push(tendency_energy[tendency_work_to_be_choose[j]]*100 + tendency_work_to_be_choose[j]);
                    }
                }
                tendency_energy_to_be_choose.sort(function(a,b){return a<b?1:-1});
                for(var n = 0; n < tendency_energy_to_be_choose.length,n < 3; ++n){
                    var days_index_to_be_choose = tendency_energy_to_be_choose[tendency_energy_to_be_choose.length - n - 1]%100;
                    time_to_be_choose = Date.now() + 1000 * 60 * 60 * 24 * days_index_to_be_choose;
                    date_to_be_choose = new Date(time_to_be_choose);
                    date.push("" + date_to_be_choose.getFullYear() + '/' +  (date_to_be_choose.getMonth() + 1) + '/' + date_to_be_choose.getDate());
                    if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
                        break;
                    }
                }
                console.log(tendency_work);
                console.log(tendency_luck);
                console.log(tendency_energy);
                console.log(days_index_to_be_choose);
                break;
            }
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_WEALTH:
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_TRADE:
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_OPENING:
            {
                var tendency_wealth = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_WEALTH);
                console.log(tendency_wealth);
                var tendency_wealth_to_be_choose = [];
                for(i = 0; i < tendency_wealth.length; ++i){
                    if(tendency_wealth[i] >= 90 && tendency_wealth[i] <= 98){
                        tendency_wealth_to_be_choose.push(tendency_wealth[i]*100 + i);
                    }
                }
                tendency_wealth_to_be_choose.sort(function(a,b){return a<b?1:-1});
                for(var n = 0; n < tendency_wealth_to_be_choose.length,n < 3; ++n){
                    var days_index_to_be_choose = tendency_wealth_to_be_choose[tendency_wealth_to_be_choose.length - n - 1]%100;
                    time_to_be_choose = Date.now() + 1000 * 60 * 60 * 24 * days_index_to_be_choose;
                    date_to_be_choose = new Date(time_to_be_choose);
                    date.push("" + date_to_be_choose.getFullYear() + '/' +  (date_to_be_choose.getMonth() + 1) + '/' + date_to_be_choose.getDate());
                    if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
                        break;
                    }
                }
                break;
            }
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_DATE:
            {
                var tendency_peach = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_PEACH);
                console.log(tendency_peach);
                var tendency_peach_to_be_choose = [];
                for(i = 0; i < tendency_peach.length; ++i){
                    if(tendency_peach[i] >= 90 && tendency_peach[i] <= 98){
                        tendency_peach_to_be_choose.push(tendency_peach[i]*100 + i);
                    }
                }
                tendency_peach_to_be_choose.sort(function(a,b){return a<b?1:-1});
                for(var n = 0; n < tendency_peach_to_be_choose.length,n < 3; ++n){
                    var days_index_to_be_choose = tendency_peach_to_be_choose[tendency_peach_to_be_choose.length - n - 1]%100;
                    time_to_be_choose = Date.now() + 1000 * 60 * 60 * 24 * days_index_to_be_choose;
                    date_to_be_choose = new Date(time_to_be_choose);
                    date.push("" + date_to_be_choose.getFullYear() + '/' +  (date_to_be_choose.getMonth() + 1) + '/' + date_to_be_choose.getDate());
                    if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
                        break;
                    }
                }
                break;
            }
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_TALKING_SOMETHING:
            {
                var tendency_luck = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_LUCK);
                console.log(tendency_luck);
                var tendency_luck_to_be_choose = [];
                for(i = 0; i < tendency_luck.length; ++i){
                    if(tendency_luck[i] >= 90 && tendency_luck[i] <= 98){
                        tendency_luck_to_be_choose.push(tendency_luck[i]*100 + i);
                    }
                }
                tendency_luck_to_be_choose.sort(function(a,b){return a<b?1:-1});
                for(var n = 0; n < tendency_luck_to_be_choose.length,n < 3; ++n){
                    var days_index_to_be_choose = tendency_luck_to_be_choose[tendency_luck_to_be_choose.length - n - 1]%100;
                    time_to_be_choose = Date.now() + 1000 * 60 * 60 * 24 * days_index_to_be_choose;
                    date_to_be_choose = new Date(time_to_be_choose);
                    date.push("" + date_to_be_choose.getFullYear() + '/' +  (date_to_be_choose.getMonth() + 1) + '/' + date_to_be_choose.getDate());
                    if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
                        break;
                    }
                }
                break;
            }
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_MEET_FRIEND:
            {
                var tendency_meet_friend = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_EMOTION);
                console.log(tendency_meet_friend);
                var tendency_meet_friend_to_be_choose = [];
                for(i = 0; i < tendency_meet_friend.length; ++i){
                    if(tendency_meet_friend[i] >= 90 && tendency_meet_friend[i] <= 98){
                        tendency_meet_friend_to_be_choose.push(tendency_meet_friend[i]*100 + i);
                    }
                }
                tendency_meet_friend_to_be_choose.sort(function(a,b){return a<b?1:-1});
                for(var n = 0; n < tendency_meet_friend_to_be_choose.length,n < 3; ++n){
                    var days_index_to_be_choose = tendency_meet_friend_to_be_choose[tendency_meet_friend_to_be_choose.length - n - 1]%100;
                    time_to_be_choose = Date.now() + 1000 * 60 * 60 * 24 * days_index_to_be_choose;
                    date_to_be_choose = new Date(time_to_be_choose);
                    date.push("" + date_to_be_choose.getFullYear() + '/' +  (date_to_be_choose.getMonth() + 1) + '/' + date_to_be_choose.getDate());
                    if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
                        break;
                    }
                }
                break;
            }
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_TRIP:
            case consts.TYPE_SELECT_DATE.TYPE_SELECT_DATE_INTERVIEW:
            {
                var tendency_trip = anylysis.getTendencyFuture(info,days,consts.TYPE_SCORE.TYPE_SCORE_ENERGY);
                console.log(tendency_trip);
                var tendency_trip_to_be_choose = [];
                for(i = 0; i < tendency_trip.length; ++i){
                    if(tendency_trip[i] >= 90 && tendency_trip[i] <= 98){
                        tendency_trip_to_be_choose.push(tendency_trip[i]*100 + i);
                    }
                }
                tendency_trip_to_be_choose.sort(function(a,b){return a<b?1:-1});
                for(var n = 0; n < tendency_trip_to_be_choose.length,n < 3; ++n){
                    var days_index_to_be_choose = tendency_trip_to_be_choose[tendency_trip_to_be_choose.length - n - 1]%100;
                    time_to_be_choose = Date.now() + 1000 * 60 * 60 * 24 * days_index_to_be_choose;
                    date_to_be_choose = new Date(time_to_be_choose);
                    date.push("" + date_to_be_choose.getFullYear() + '/' +  (date_to_be_choose.getMonth() + 1) + '/' + date_to_be_choose.getDate());
                    if(days_type == consts.TYPE_SELECT_DAYS.TYPE_SELECT_DAYS_TEN){
                        break;
                    }
                }
                break;
            }
        }
        cb(date);
    });
};

anylysis.getLastYangSum = function(yangSum1,yangSum2,yangSum3){
    var the_last_yang_sum = yangSum1;
    if(yangSum2){
        the_last_yang_sum = yangSum2;
    }
    if(yangSum3){
        the_last_yang_sum = yangSum3;
    }
    return the_last_yang_sum;
};

anylysis.getStarMonthNum = function(birthday){
    var dateStr = birthday;
    var clock = parseInt(dateStr.substr(8, 2));
    //如果是忘记时辰，就给默认成子时
    if (clock > 11 || clock == 0) {
        clock = 0;
    }
    else {
        clock = clock * 2 - 1;
    }
    var year =  parseInt(birthday.substr(0, 4));
    var month = parseInt(birthday.substr(4, 2));
    var day = parseInt(birthday.substr(6, 2));
    var clock = parseInt(clock);

    var date = new Date(year + "/" + month + "/" + day + " " + clock + ":00:00");
    //星(月)数
    var starNum = 0;

    if(date >= new Date(year + "/3/21") && date <= new Date(year + "/4/19")){
        starNum = 1;
    }
    else if(date >= new Date(year + "/4/20") && date <= new Date(year + "/5/20")){
        starNum = 2;
    }
    else if(date >= new Date(year + "/5/21") && date <= new Date(year + "/6/19")){
        starNum = 3;
    }
    else if(date >= new Date(year + "/6/22") && date <= new Date(year + "/7/22")){
        starNum = 4;
    }
    else if(date >= new Date(year + "/7/23") && date <= new Date(year + "/8/22")){
        starNum = 5;
    }
    else if(date >= new Date(year + "/8/22") && date <= new Date(year + "/9/22")){
        starNum = 6;
    }
    else if(date >= new Date(year + "/9/23") && date <= new Date(year + "/10/23")){
        starNum = 7;
    }
    else if(date >= new Date(year + "/10/24") && date <= new Date(year + "/11/22")){
        starNum = 8;
    }
    else if(date >= new Date(year + "/11/23") && date <= new Date(year + "/12/21")){
        starNum = 9;
    }
    else if(date >= new Date(year + "/12/22") || date <= new Date(year + "/1/19")){
        starNum = 10;
    }
    else if(date >= new Date(year + "/1/20") && date <= new Date(year + "/2/18")){
        starNum = 11;
    }
    else if(date >= new Date(year + "/2/19") && date <= new Date(year + "/3/20")){
        starNum = 12;
    }
    return starNum;
};

anylysis.getMatch = function(uid,target_uid,type,cb){
    var answer ;
    anylysis.getInfo(uid,function(info){
        anylysis.getInfo(target_uid,function(target_info){

            var BigStar = parseInt(info["flystar"].charAt(0));
            var target_BigStar = parseInt(target_info["flystar"].charAt(0));
            var SmallStar = parseInt(info["flystar"].charAt(1));
            var target_SmallStar = parseInt(target_info["flystar"].charAt(1));
            var yearStar = parseInt(info["flystar"].charAt(2));
            var target_yearStar = parseInt(target_info["flystar"].charAt(2));
            var monthStar = parseInt(info["flystar"].charAt(3));
            var target_monthStar = parseInt(target_info["flystar"].charAt(3));
            var dayStar = parseInt(info["flystar"].charAt(4));
            var target_dayStar = parseInt(target_info["flystar"].charAt(4));
            var hourStar = parseInt(info["flystar"].charAt(5));
            var target_hourStar = parseInt(target_info["flystar"].charAt(5));
            var sex = info.sex;
            var target_sex = target_info.sex;
            switch(type){
                case consts.TYPE_MATCH.TYPE_MATCH_NATURE:{
                    var birthday_year = Math.floor(info.birthday/1000000);
                    var birthday_month = Math.floor((info.birthday - birthday_year * 1000000)/10000);
                    var birthday_day = Math.floor((info.birthday - birthday_year * 1000000 - birthday_month * 10000)/100);
                    var target_birthday_year = Math.floor(target_info.birthday/1000000);
                    var target_birthday_month = Math.floor((target_info.birthday - target_birthday_year * 1000000)/10000);
                    var target_birthday_day = Math.floor((target_info.birthday - target_birthday_year * 1000000 - target_birthday_month * 10000)/100);
                    var yangSum1 = user.getYangSum(birthday_year,birthday_month,birthday_day);
                    var yangSum2 = user.getYangSum(yangSum1);
                    var yangSum3 = user.getYangSum(yangSum2);
                    var target_yangSum1 = user.getYangSum(target_birthday_year,target_birthday_month,target_birthday_day);
                    var target_yangSum2 = user.getYangSum(target_yangSum1);
                    var target_yangSum3 = user.getYangSum(target_yangSum2);
                    var queNum = user.getQueNum(birthday_year,birthday_month,birthday_day,yangSum1,yangSum2,yangSum3,yearStar);
                    var target_queNum = user.getQueNum(target_birthday_year,target_birthday_month,target_birthday_day,target_yangSum1,target_yangSum2,target_yangSum3,target_yearStar);
                    var last_yang_sum = anylysis.getLastYangSum(yangSum1,yangSum2,yangSum3);
                    var target_last_yang_sum = anylysis.getLastYangSum(target_yangSum1,target_yangSum2,target_yangSum3);
                    console.log("%d %d",queNum,last_yang_sum);
                    console.log("%d %d",target_queNum,target_last_yang_sum);
                    var que_num_array = queNum.split("");
                    var target_que_num_array = queNum.split("");
                    console.log(que_num_array);
                    console.log(target_que_num_array);
                    var start_month_num = anylysis.getStarMonthNum(info.birthday);
                    var target_star_month_num = anylysis.getStarMonthNum(target_info.birthday);
                    console.log(start_month_num);
                    console.log(target_star_month_num);
                    var complementary_level = -1;
                    var complementary = ["你的性格不足方面正是对方性格最显著特点，你俩在一起，对方性格对你的互补方面是最高级，真是人间少有。","你的性格不足方面，大部分都是对方性格的主要特点，你俩在一起，对方和你的互补方面是中上级，可以取长补短。","你的性格不足方面，有些是对方性格的特点，你俩在一起，对方和你的互补方面是中下级，对你有帮助。"];
                    //  互补
                    if(1 == que_num_array.length){
                        //  本身缺数只有1个，对方最终阳和数或年飞星数是自己的缺数。
                        if(parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_last_yang_sum){
                            complementary_level = 0
                        }
                        //  缺数是1个，对方其它阳和数与星月数中有自己缺数。
                        else if(parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3){
                            complementary_level = 1;
                        }
                    }else if(2 == que_num_array.length){
                        //  本身缺数2个，对方最终阳和数和年飞星数是自己的缺数（不能少一个）。
                        if( (parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_last_yang_sum) ||
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_last_yang_sum) ){
                            complementary_level = 0
                        }
                        //  缺数是2个，对方其它阳和数、年飞星与星月数中有自己缺数（个数不能少）。
                        else  if( (parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3 ) &&
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3) ){
                            complementary_level = 1
                        }
                        //  缺数是2个，其中1个在对方任意阳和数、年飞星与星月数中。
                        else if( (parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3 ) ||
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3) ){
                            complementary_level = 2
                        }
                    }else if(3 == que_num_array.length){
                        //  @@@缺数是3个及以上，对方任意阳和数，年飞星数和星月数是自己的缺数，不能少一个。
                        if(
                            parseInt( (que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3) &&
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3 ) &&
                            (parseInt(que_num_array[2]) == target_yearStar || parseInt(que_num_array[2]) == target_star_month_num || parseInt(que_num_array[2]) == target_yangSum1 || parseInt(que_num_array[2]) == target_yangSum2 || parseInt(que_num_array[2]) == target_yangSum3 )
                            ){
                            complementary_level = 0
                        }
                        //  @@@缺数是3个及以上，对方任意阳和数、年飞星与星月数中有自己缺数，3项可以少1项，4项可以少1项，5项可以少2项，6项可以少2项，7项及以上可以少3项。
                        else if(
                            parseInt( (que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3) ||
                                (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3 ) ||
                                (parseInt(que_num_array[2]) == target_yearStar || parseInt(que_num_array[2]) == target_star_month_num || parseInt(que_num_array[2]) == target_yangSum1 || parseInt(que_num_array[2]) == target_yangSum2 || parseInt(que_num_array[2]) == target_yangSum3 )
                            ){
                            complementary_level = 1
                        }
                        //  @@@缺数是3个及以上，对方任意阳和数、年飞星与星月数中有自己缺数，3项可以少2项，4项可以少2项，5项可以少3项，6项可以少3项，7项及以上可以少4项。
                        else if(
                            parseInt( (que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3) ||
                                (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3 ) ||
                                (parseInt(que_num_array[2]) == target_yearStar || parseInt(que_num_array[2]) == target_star_month_num || parseInt(que_num_array[2]) == target_yangSum1 || parseInt(que_num_array[2]) == target_yangSum2 || parseInt(que_num_array[2]) == target_yangSum3 )
                            ){
                            complementary_level = 2
                        }
                        var overlapped_level = -1;
                        var overlapped = ["你的性格特点与对方重度一致，就连缺点都一模一样。这样的性格重叠是最高级，人间难寻。"," 你的性格特点与对方高度一致，这样的性格重叠是较  高级，和你的性格太像了。"," 你的性格特点与对方比较一致，这样的性格重叠是中上级，和你的性格很像了。","你的性格特点与对方有些一致，这样的性格重叠是中下级，和你的性格有些像。"];
                        //  重叠
                        //  所有阳和数、年飞星数、缺数都相同。
                        if(target_yangSum1 == yangSum1 && target_yangSum2 == yangSum2 && target_yangSum3 == yangSum3 && target_yearStar == yearStar && target_queNum == queNum){
                            overlapped_level = 0;
                        }
                        //  所有阳和数相同。
                        else if(target_yangSum1 == yangSum1 && target_yangSum2 == yangSum2 && target_yangSum3 == yangSum3){
                            overlapped_level = 1;
                        }
                        //  其中阳和数（1、2、3）相同，并且年飞星相同。
                        else if( (target_yangSum1 == yangSum1 || target_yangSum2 == yangSum2 || target_yangSum3 == yangSum3) &&
                            target_yearStar == yearStar
                            ){
                            overlapped_level = 1;
                        }
                        //  最终阳和数，与对方最终阳和数相同，并且年飞星、星月数、缺数任意1项与对方年飞星、星月数、缺数相同。
                        else if( (target_last_yang_sum == last_yang_sum) &&
                            (target_yearStar == yearStar || target_star_month_num == start_month_num || target_queNum == queNum)
                            ){
                            overlapped_level = 1;
                        }
                        //  @@@最终阳和数与年飞星数，与对方的任意阳和数、年飞星数、星月数当中相同。（1个不能少）
                        else if(target_last_yang_sum == last_yang_sum || target_yearStar == yearStar || target_star_month_num == start_month_num){
                            overlapped_level = 2;
                        }
                        //  @@@任意阳和数、年飞星数、星月数，在对方的任意阳和数、年飞星数、星月数当中相同，2项以下不能少，3项可以少1项，4项可以少2项，5项及以上可以少3项。
                        else if(target_last_yang_sum == last_yang_sum || target_yearStar == yearStar || target_star_month_num == start_month_num){
                            overlapped_level = 3;
                        }
                        var different_level = -1;
                        if(complementary_level == -1 && overlapped_level == -1){
                            different_level = 1;
                        }
                        var different = "你们是属于性格不同的类型，既不互补，也不重叠，两种性格。";

                        if(complementary_level != -1){
                            answer = complementary[complementary_level];
                        }else if(overlapped_level != -1){
                            answer = overlapped[overlapped_level];
                        }else{
                            answer = different;
                        }
                    }
                    cb(answer);
                    break;
                }
                case consts.TYPE_MATCH.TYPE_MATCH_MARRIAGE:{
                    if(sex == target_sex){
                        answer = "性别不符合要求";
                        break;
                    }
                    var  year_star_index = 0;
                    if(sex){
                        year_star_index = yearStar - 1;
                    }
                    else{
                        year_star_index = yearStar - 1 + 9;
                    }
                    var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                    var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                    var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                    var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                    var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                    var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                    var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                    var marriage = ["婚姻匹配度，第一级，最高，累世姻缘。","婚姻匹配度，第二级，很高，夫妻缘重。","婚姻匹配度，第三级，中等，缘分中等。","婚姻匹配度，第四级， 较低，夫妻缘轻。","婚姻匹配度，第五级， 很低，没有希望。","婚姻匹配度，第六级， 绝望，彻底灭绝。"];
                    var marriage_index = 2;
                    if(socre_sum <= 98 && socre_sum >= 90){
                        marriage_index = 0;
                    }else if(socre_sum <= 89 && socre_sum >= 80){
                        marriage_index = 1;
                    }else if(socre_sum <= 79 && socre_sum >= 60){
                        marriage_index = 2;
                    }else if(socre_sum <= 59 && socre_sum >= 45){
                        marriage_index = 3;
                    }else if(socre_sum <= 44 && socre_sum >= 29){
                        marriage_index = 4;
                    }else if(socre_sum <= 28 && socre_sum >= 0){
                        marriage_index = 5;
                    }else{
                        marriage_index = 5;
                    }
                    answer = marriage[marriage_index];
                    cb(answer);
                    break;
                }
                case consts.TYPE_MATCH.TYPE_MATCH_LOVE:
                case consts.TYPE_MATCH.TYPE_MATCH_ESTROUS:
                case consts.TYPE_MATCH.TYPE_MATCH_PEACH:{
                    if(sex == target_sex){
                        answer = "性别不符合要求";
                        break;
                    }
                    var  year_star_index = 0;
                    if(sex){
                        year_star_index = yearStar - 1;
                    }
                    else{
                        year_star_index = yearStar - 1 + 9;
                    }
                    var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                    var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                    var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                    var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                    var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                    var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                    var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                    var love = ["爱情匹配度，第一级，最高，情爱无边。","爱情匹配度，第二级，很高，情爱绵绵。","爱情匹配度，第三级，中等，情爱适中。","爱情匹配度，第四级， 较低，感情一般。","爱情匹配度，第五级， 很低，形同路人。","爱情匹配度，第六级， 破灭，彻底破灭。"];
                    var estrous = ["    动情匹配度，第一级，最高，心潮澎湃。","    动情匹配度，第二级，很高，难以自控。","    动情匹配度，第三级，中等，稍有动情。","    动情匹配度，第四级，麻木，没有感觉。 ","    动情匹配度，第五级，很低，视而不见。 ","    动情匹配度，第六级，绝杀，心如死灰。 "];
                    var peach = ["桃花匹配度，第一级，最高，桃花满天。","桃花匹配度，第二级，很高，桃花开放。","桃花匹配度，第三级，中等，桃花初开。","桃花匹配度，第四级，凋谢，没有感觉。","桃花匹配度，第五级，残破，残花败柳。","桃花匹配度，第六级，落败，万念俱焚。"];
                    var index = 2;
                    if(socre_sum <= 98 && socre_sum >= 90){
                        index = 0;
                    }else if(socre_sum <= 89 && socre_sum >= 80){
                        index = 1;
                    }else if(socre_sum <= 79 && socre_sum >= 60){
                        index = 2;
                    }else if(socre_sum <= 59 && socre_sum >= 45){
                        index = 3;
                    }else if(socre_sum <= 44 && socre_sum >= 29){
                        index = 4;
                    }else if(socre_sum <= 28 && socre_sum >= 0){
                        index = 5;
                    }else{
                        index = 5;
                    }
                    if(type == consts.TYPE_MATCH.TYPE_MATCH_LOVE){
                        answer = love[index];
                    }else if (type == consts.TYPE_MATCH.TYPE_MATCH_ESTROUS){
                        answer = estrous[index];
                    } else if (type == consts.TYPE_MATCH.TYPE_MATCH_PEACH){
                        answer = peach[index];
                    }
                    cb(answer);
                    break;
                }
                case consts.TYPE_MATCH.TYPE_MATCH_FRIENDSHIP:{
                    var  year_star_index =  yearStar - 1;
                    var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                    var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                    var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                    var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                    var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                    var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                    var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                    var friendship = ["友情匹配度，第一级，最高，情意无边。","友情匹配度，第二级，很高，情意深厚。","友情匹配度，第三级，中等，感情适中。","友情匹配度，第四级， 较低，情意淡泊。","友情匹配度，第五级， 很低，感情破裂。","友情匹配度，第六级， 最低，无情无义。"];
                    var friendship_index = 2;
                    if(socre_sum <= 98 && socre_sum >= 90){
                        friendship_index = 0;
                    }else if(socre_sum <= 89 && socre_sum >= 80){
                        friendship_index = 1;
                    }else if(socre_sum <= 79 && socre_sum >= 60){
                        friendship_index = 2;
                    }else if(socre_sum <= 59 && socre_sum >= 45){
                        friendship_index = 3;
                    }else if(socre_sum <= 44 && socre_sum >= 29){
                        friendship_index = 4;
                    }else if(socre_sum <= 28 && socre_sum >= 0){
                        friendship_index = 5;
                    }else{
                        friendship_index = 5;
                    }
                    answer = friendship[friendship_index];
                    cb(answer);
                    break;
                }
                case consts.TYPE_MATCH.TYPE_MATCH_WEALTH:{
                    var  year_star_index =  yearStar - 1;
                    var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                    var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                    var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                    var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                    var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                    var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                    var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                    var score_average = socre_sum / 5;
                    //   to be continie
                    var wealth = ["财运匹配度，第一级，最高，合作助你发大财。","财运匹配度，第二级，很高，合作财运好。","财运匹配度，第三级，中等，合作有财运。","财运匹配度，第四级， 较低，合作难有财。","财运匹配度，第五级， 很低，合作无财运。","财运匹配度，第六级， 最低，合作易破财。"];
                    var wealth_index = 2;
                    if(socre_sum <= 98 && socre_sum >= 90){
                        wealth_index = 0;
                    }else if(socre_sum <= 89 && socre_sum >= 80){
                        wealth_index = 1;
                    }else if(socre_sum <= 79 && socre_sum >= 60){
                        wealth_index = 2;
                    }else if(socre_sum <= 59 && socre_sum >= 45){
                        wealth_index = 3;
                    }else if(socre_sum <= 44 && socre_sum >= 29){
                        wealth_index = 4;
                    }else if(socre_sum <= 28 && socre_sum >= 0){
                        wealth_index = 5;
                    }else{
                        wealth_index = 5;
                    }
                    answer = wealth[wealth_index];
                    cb(answer);
                    break;
                }
                case consts.TYPE_MATCH.TYPE_MATCH_LUCK:{
                    var  year_star_index =  yearStar - 1;
                    var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                    var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                    var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                    var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                    var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                    var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                    var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                    var score_average = socre_sum / 5;
                    //   to be continie
                    var luck = ["运程匹配度，第一级，最高，合作助你运程大顺。","运程匹配度，第二级，很高，合作助你运程较顺。","运程匹配度，第三级，中等，合作运程中等。","运程匹配度，第四级， 较低，合作后运程阻碍。","运程匹配度，第五级， 很低，合作后运程堵塞。","运程匹配度，第六级， 最低，合作后运程崩溃。"];
                    var luck_index = 2;
                    if(socre_sum <= 98 && socre_sum >= 90){
                        luck_index = 0;
                    }else if(socre_sum <= 89 && socre_sum >= 80){
                        luck_index = 1;
                    }else if(socre_sum <= 79 && socre_sum >= 60){
                        luck_index = 2;
                    }else if(socre_sum <= 59 && socre_sum >= 45){
                        luck_index = 3;
                    }else if(socre_sum <= 44 && socre_sum >= 29){
                        luck_index = 4;
                    }else if(socre_sum <= 28 && socre_sum >= 0){
                        luck_index = 5;
                    }else{
                        luck_index = 5;
                    }
                    answer = luck[luck_index];
                    cb(answer);
                    break;
                }

            }
        });

    });
};

anylysis.getMatch2 = function(uid,birthday,birthplace,sex,type,cb){
    var answer ;
    if (typeof birthday != 'string'){
        birthday = birthday.toString();
    }
    anylysis.getInfo(uid,function(info){
        var year =  parseInt(birthday.substr(0, 4));
        var month = parseInt(birthday.substr(4, 2));
        var day = parseInt(birthday.substr(6, 2));
        var clock = 0;
        var date = new Date(year + "/" + month + "/" + day + " " + clock + ":00:00");
        var BigStar = parseInt(info["flystar"].charAt(0));
        var target_BigStar = user.getBigStar(date);
        var SmallStar = parseInt(info["flystar"].charAt(1));
        var target_SmallStar = user.getSmallStar(date);
        var yearStar = parseInt(info["flystar"].charAt(2));
        var target_yearStar = user.getYearStar(date);
        var monthStar = parseInt(info["flystar"].charAt(3));
        var target_monthStar = user.getMonthStar(date);
        var dayStar = parseInt(info["flystar"].charAt(4));
        var target_dayStar = user.getDayStar(date);
        var hourStar = parseInt(info["flystar"].charAt(5));
        var target_hourStar = user.getClockStar(date);
        var sex = info.sex;
        var target_sex = sex;
        switch(type){
            case consts.TYPE_MATCH.TYPE_MATCH_NATURE:{
                var birthday_year = Math.floor(info.birthday/1000000);
                var birthday_month = Math.floor((info.birthday - birthday_year * 1000000)/10000);
                var birthday_day = Math.floor((info.birthday - birthday_year * 1000000 - birthday_month * 10000)/100);
                var target_birthday_year = Math.floor(birthday/1000000);
                var target_birthday_month = Math.floor((birthday - target_birthday_year * 1000000)/10000);
                var target_birthday_day = Math.floor((birthday - target_birthday_year * 1000000 - target_birthday_month * 10000)/100);
                var yangSum1 = user.getYangSum(birthday_year,birthday_month,birthday_day);
                var yangSum2 = user.getYangSum(yangSum1);
                var yangSum3 = user.getYangSum(yangSum2);
                var target_yangSum1 = user.getYangSum(target_birthday_year,target_birthday_month,target_birthday_day);
                var target_yangSum2 = user.getYangSum(target_yangSum1);
                var target_yangSum3 = user.getYangSum(target_yangSum2);
                var queNum = user.getQueNum(birthday_year,birthday_month,birthday_day,yangSum1,yangSum2,yangSum3,yearStar);
                var target_queNum = user.getQueNum(target_birthday_year,target_birthday_month,target_birthday_day,target_yangSum1,target_yangSum2,target_yangSum3,target_yearStar);
                var last_yang_sum = anylysis.getLastYangSum(yangSum1,yangSum2,yangSum3);
                var target_last_yang_sum = anylysis.getLastYangSum(target_yangSum1,target_yangSum2,target_yangSum3);
                console.log("%d %d",queNum,last_yang_sum);
                console.log("%d %d",target_queNum,target_last_yang_sum);
                var que_num_array = queNum.split("");
                var target_que_num_array = queNum.split("");
                console.log(que_num_array);
                console.log(target_que_num_array);
                var start_month_num = anylysis.getStarMonthNum(info.birthday);
                var target_star_month_num = anylysis.getStarMonthNum(birthday);
                console.log(start_month_num);
                console.log(target_star_month_num);
                var complementary_level = -1;
                var complementary = ["你的性格不足方面正是对方性格最显著特点，你俩在一起，对方性格对你的互补方面是最高级，真是人间少有。","你的性格不足方面，大部分都是对方性格的主要特点，你俩在一起，对方和你的互补方面是中上级，可以取长补短。","你的性格不足方面，有些是对方性格的特点，你俩在一起，对方和你的互补方面是中下级，对你有帮助。"];
                //  互补
                if(1 == que_num_array.length){
                    //  本身缺数只有1个，对方最终阳和数或年飞星数是自己的缺数。
                    if(parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_last_yang_sum){
                        complementary_level = 0
                    }
                    //  缺数是1个，对方其它阳和数与星月数中有自己缺数。
                    else if(parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3){
                        complementary_level = 1;
                    }
                }else if(2 == que_num_array.length){
                    //  本身缺数2个，对方最终阳和数和年飞星数是自己的缺数（不能少一个）。
                    if( (parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_last_yang_sum) ||
                        (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_last_yang_sum) ){
                        complementary_level = 0
                    }
                    //  缺数是2个，对方其它阳和数、年飞星与星月数中有自己缺数（个数不能少）。
                    else  if( (parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3 ) &&
                        (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3) ){
                        complementary_level = 1
                    }
                    //  缺数是2个，其中1个在对方任意阳和数、年飞星与星月数中。
                    else if( (parseInt(que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3 ) ||
                        (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3) ){
                        complementary_level = 2
                    }
                }else if(3 == que_num_array.length){
                    //  @@@缺数是3个及以上，对方任意阳和数，年飞星数和星月数是自己的缺数，不能少一个。
                    if(
                        parseInt( (que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3) &&
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3 ) &&
                            (parseInt(que_num_array[2]) == target_yearStar || parseInt(que_num_array[2]) == target_star_month_num || parseInt(que_num_array[2]) == target_yangSum1 || parseInt(que_num_array[2]) == target_yangSum2 || parseInt(que_num_array[2]) == target_yangSum3 )
                        ){
                        complementary_level = 0
                    }
                    //  @@@缺数是3个及以上，对方任意阳和数、年飞星与星月数中有自己缺数，3项可以少1项，4项可以少1项，5项可以少2项，6项可以少2项，7项及以上可以少3项。
                    else if(
                        parseInt( (que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3) ||
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3 ) ||
                            (parseInt(que_num_array[2]) == target_yearStar || parseInt(que_num_array[2]) == target_star_month_num || parseInt(que_num_array[2]) == target_yangSum1 || parseInt(que_num_array[2]) == target_yangSum2 || parseInt(que_num_array[2]) == target_yangSum3 )
                        ){
                        complementary_level = 1
                    }
                    //  @@@缺数是3个及以上，对方任意阳和数、年飞星与星月数中有自己缺数，3项可以少2项，4项可以少2项，5项可以少3项，6项可以少3项，7项及以上可以少4项。
                    else if(
                        parseInt( (que_num_array[0]) == target_yearStar || parseInt(que_num_array[0]) == target_star_month_num || parseInt(que_num_array[0]) == target_yangSum1 || parseInt(que_num_array[0]) == target_yangSum2 || parseInt(que_num_array[0]) == target_yangSum3) ||
                            (parseInt(que_num_array[1]) == target_yearStar || parseInt(que_num_array[1]) == target_star_month_num || parseInt(que_num_array[1]) == target_yangSum1 || parseInt(que_num_array[1]) == target_yangSum2 || parseInt(que_num_array[1]) == target_yangSum3 ) ||
                            (parseInt(que_num_array[2]) == target_yearStar || parseInt(que_num_array[2]) == target_star_month_num || parseInt(que_num_array[2]) == target_yangSum1 || parseInt(que_num_array[2]) == target_yangSum2 || parseInt(que_num_array[2]) == target_yangSum3 )
                        ){
                        complementary_level = 2
                    }
                    var overlapped_level = -1;
                    var overlapped = ["你的性格特点与对方重度一致，就连缺点都一模一样。这样的性格重叠是最高级，人间难寻。"," 你的性格特点与对方高度一致，这样的性格重叠是较  高级，和你的性格太像了。"," 你的性格特点与对方比较一致，这样的性格重叠是中上级，和你的性格很像了。","你的性格特点与对方有些一致，这样的性格重叠是中下级，和你的性格有些像。"];
                    //  重叠
                    //  所有阳和数、年飞星数、缺数都相同。
                    if(target_yangSum1 == yangSum1 && target_yangSum2 == yangSum2 && target_yangSum3 == yangSum3 && target_yearStar == yearStar && target_queNum == queNum){
                        overlapped_level = 0;
                    }
                    //  所有阳和数相同。
                    else if(target_yangSum1 == yangSum1 && target_yangSum2 == yangSum2 && target_yangSum3 == yangSum3){
                        overlapped_level = 1;
                    }
                    //  其中阳和数（1、2、3）相同，并且年飞星相同。
                    else if( (target_yangSum1 == yangSum1 || target_yangSum2 == yangSum2 || target_yangSum3 == yangSum3) &&
                        target_yearStar == yearStar
                        ){
                        overlapped_level = 1;
                    }
                    //  最终阳和数，与对方最终阳和数相同，并且年飞星、星月数、缺数任意1项与对方年飞星、星月数、缺数相同。
                    else if( (target_last_yang_sum == last_yang_sum) &&
                        (target_yearStar == yearStar || target_star_month_num == start_month_num || target_queNum == queNum)
                        ){
                        overlapped_level = 1;
                    }
                    //  @@@最终阳和数与年飞星数，与对方的任意阳和数、年飞星数、星月数当中相同。（1个不能少）
                    else if(target_last_yang_sum == last_yang_sum || target_yearStar == yearStar || target_star_month_num == start_month_num){
                        overlapped_level = 2;
                    }
                    //  @@@任意阳和数、年飞星数、星月数，在对方的任意阳和数、年飞星数、星月数当中相同，2项以下不能少，3项可以少1项，4项可以少2项，5项及以上可以少3项。
                    else if(target_last_yang_sum == last_yang_sum || target_yearStar == yearStar || target_star_month_num == start_month_num){
                        overlapped_level = 3;
                    }
                    var different_level = -1;
                    if(complementary_level == -1 && overlapped_level == -1){
                        different_level = 1;
                    }
                    var different = "你们是属于性格不同的类型，既不互补，也不重叠，两种性格。";

                    if(complementary_level != -1){
                        answer = complementary[complementary_level];
                    }else if(overlapped_level != -1){
                        answer = overlapped[overlapped_level];
                    }else{
                        answer = different;
                    }
                }
                cb(answer);
                break;
            }
            case consts.TYPE_MATCH.TYPE_MATCH_MARRIAGE:{
                if(sex == target_sex){
                    answer = "性别不符合要求";
                    break;
                }
                var  year_star_index = 0;
                if(sex){
                    year_star_index = yearStar - 1;
                }
                else{
                    year_star_index = yearStar - 1 + 9;
                }
                var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                var marriage = ["婚姻匹配度，第一级，最高，累世姻缘。","婚姻匹配度，第二级，很高，夫妻缘重。","婚姻匹配度，第三级，中等，缘分中等。","婚姻匹配度，第四级， 较低，夫妻缘轻。","婚姻匹配度，第五级， 很低，没有希望。","婚姻匹配度，第六级， 绝望，彻底灭绝。"];
                var marriage_index = 2;
                if(socre_sum <= 98 && socre_sum >= 90){
                    marriage_index = 0;
                }else if(socre_sum <= 89 && socre_sum >= 80){
                    marriage_index = 1;
                }else if(socre_sum <= 79 && socre_sum >= 60){
                    marriage_index = 2;
                }else if(socre_sum <= 59 && socre_sum >= 45){
                    marriage_index = 3;
                }else if(socre_sum <= 44 && socre_sum >= 29){
                    marriage_index = 4;
                }else if(socre_sum <= 28 && socre_sum >= 0){
                    marriage_index = 5;
                }else{
                    marriage_index = 5;
                }
                answer = marriage[marriage_index];
                cb(answer);
                break;
            }
            case consts.TYPE_MATCH.TYPE_MATCH_LOVE:
            case consts.TYPE_MATCH.TYPE_MATCH_ESTROUS:
            case consts.TYPE_MATCH.TYPE_MATCH_PEACH:{
                if(sex == target_sex){
                    answer = "性别不符合要求";
                    break;
                }
                var  year_star_index = 0;
                if(sex){
                    year_star_index = yearStar - 1;
                }
                else{
                    year_star_index = yearStar - 1 + 9;
                }
                var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                var love = ["爱情匹配度，第一级，最高，情爱无边。","爱情匹配度，第二级，很高，情爱绵绵。","爱情匹配度，第三级，中等，情爱适中。","爱情匹配度，第四级， 较低，感情一般。","爱情匹配度，第五级， 很低，形同路人。","爱情匹配度，第六级， 破灭，彻底破灭。"];
                var estrous = ["    动情匹配度，第一级，最高，心潮澎湃。","    动情匹配度，第二级，很高，难以自控。","    动情匹配度，第三级，中等，稍有动情。","    动情匹配度，第四级，麻木，没有感觉。 ","    动情匹配度，第五级，很低，视而不见。 ","    动情匹配度，第六级，绝杀，心如死灰。 "];
                var peach = ["桃花匹配度，第一级，最高，桃花满天。","桃花匹配度，第二级，很高，桃花开放。","桃花匹配度，第三级，中等，桃花初开。","桃花匹配度，第四级，凋谢，没有感觉。","桃花匹配度，第五级，残破，残花败柳。","桃花匹配度，第六级，落败，万念俱焚。"];
                var index = 2;
                if(socre_sum <= 98 && socre_sum >= 90){
                    index = 0;
                }else if(socre_sum <= 89 && socre_sum >= 80){
                    index = 1;
                }else if(socre_sum <= 79 && socre_sum >= 60){
                    index = 2;
                }else if(socre_sum <= 59 && socre_sum >= 45){
                    index = 3;
                }else if(socre_sum <= 44 && socre_sum >= 29){
                    index = 4;
                }else if(socre_sum <= 28 && socre_sum >= 0){
                    index = 5;
                }else{
                    index = 5;
                }
                if(type == consts.TYPE_MATCH.TYPE_MATCH_LOVE){
                    answer = love[index];
                }else if (type == consts.TYPE_MATCH.TYPE_MATCH_ESTROUS){
                    answer = estrous[index];
                } else if (type == consts.TYPE_MATCH.TYPE_MATCH_PEACH){
                    answer = peach[index];
                }
                cb(answer);
                break;
            }
            case consts.TYPE_MATCH.TYPE_MATCH_FRIENDSHIP:{
                var  year_star_index =  yearStar - 1;
                var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                var friendship = ["友情匹配度，第一级，最高，情意无边。","友情匹配度，第二级，很高，情意深厚。","友情匹配度，第三级，中等，感情适中。","友情匹配度，第四级， 较低，情意淡泊。","友情匹配度，第五级， 很低，感情破裂。","友情匹配度，第六级， 最低，无情无义。"];
                var friendship_index = 2;
                if(socre_sum <= 98 && socre_sum >= 90){
                    friendship_index = 0;
                }else if(socre_sum <= 89 && socre_sum >= 80){
                    friendship_index = 1;
                }else if(socre_sum <= 79 && socre_sum >= 60){
                    friendship_index = 2;
                }else if(socre_sum <= 59 && socre_sum >= 45){
                    friendship_index = 3;
                }else if(socre_sum <= 44 && socre_sum >= 29){
                    friendship_index = 4;
                }else if(socre_sum <= 28 && socre_sum >= 0){
                    friendship_index = 5;
                }else{
                    friendship_index = 5;
                }
                answer = friendship[friendship_index];
                cb(answer);
                break;
            }
            case consts.TYPE_MATCH.TYPE_MATCH_WEALTH:{
                var  year_star_index =  yearStar - 1;
                var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                var score_average = socre_sum / 5;
                //   to be continie
                var wealth = ["财运匹配度，第一级，最高，合作助你发大财。","财运匹配度，第二级，很高，合作财运好。","财运匹配度，第三级，中等，合作有财运。","财运匹配度，第四级， 较低，合作难有财。","财运匹配度，第五级， 很低，合作无财运。","财运匹配度，第六级， 最低，合作易破财。"];
                var wealth_index = 2;
                if(socre_sum <= 98 && socre_sum >= 90){
                    wealth_index = 0;
                }else if(socre_sum <= 89 && socre_sum >= 80){
                    wealth_index = 1;
                }else if(socre_sum <= 79 && socre_sum >= 60){
                    wealth_index = 2;
                }else if(socre_sum <= 59 && socre_sum >= 45){
                    wealth_index = 3;
                }else if(socre_sum <= 44 && socre_sum >= 29){
                    wealth_index = 4;
                }else if(socre_sum <= 28 && socre_sum >= 0){
                    wealth_index = 5;
                }else{
                    wealth_index = 5;
                }
                answer = wealth[wealth_index];
                cb(answer);
                break;
            }
            case consts.TYPE_MATCH.TYPE_MATCH_LUCK:{
                var  year_star_index =  yearStar - 1;
                var year_star_score = match[1][year_star_index][0][target_yearStar -1];
                var big_star_score = match[1][year_star_index][1][target_BigStar - 1];
                var small_star_score = match[1][year_star_index][1][target_SmallStar - 1];
                var month_star_score = match[1][year_star_index][1][target_monthStar - 1];
                var day_star_score = match[1][year_star_index][1][target_dayStar - 1];
                var hour_star_score = match[1][year_star_index][1][target_hourStar - 1];
                var socre_sum = year_star_score + big_star_score + small_star_score + month_star_score + day_star_score + hour_star_score;
                var score_average = socre_sum / 5;
                //   to be continie
                var luck = ["运程匹配度，第一级，最高，合作助你运程大顺。","运程匹配度，第二级，很高，合作助你运程较顺。","运程匹配度，第三级，中等，合作运程中等。","运程匹配度，第四级， 较低，合作后运程阻碍。","运程匹配度，第五级， 很低，合作后运程堵塞。","运程匹配度，第六级， 最低，合作后运程崩溃。"];
                var luck_index = 2;
                if(socre_sum <= 98 && socre_sum >= 90){
                    luck_index = 0;
                }else if(socre_sum <= 89 && socre_sum >= 80){
                    luck_index = 1;
                }else if(socre_sum <= 79 && socre_sum >= 60){
                    luck_index = 2;
                }else if(socre_sum <= 59 && socre_sum >= 45){
                    luck_index = 3;
                }else if(socre_sum <= 44 && socre_sum >= 29){
                    luck_index = 4;
                }else if(socre_sum <= 28 && socre_sum >= 0){
                    luck_index = 5;
                }else{
                    luck_index = 5;
                }
                answer = luck[luck_index];
                cb(answer);
                break;
            }

        }
    });
};

