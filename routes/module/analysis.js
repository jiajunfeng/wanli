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
    var star_of_query = query_star[0] - 1;
    var previous_star_of_query = query_star[1] - 1;
    var previous_previous_star_of_query = query_star[2] - 1;
    var scores_class;
    var scores_class_previous;
    var all_scores = scores_new[score_type][info.sex][star_of_query];
    for(var i = 0; i < all_scores.length; ++i){
        if(all_scores[i].beforstar == previous_star_of_query){
            scores_class = all_scores[i];
            break;
        }
    }
    var all_scores_previous = scores_new[score_type][info.sex][previous_previous_star_of_query];
    for(i = 0; i < all_scores_previous.length; ++i){
        if(all_scores_previous[i].beforstar == previous_star_of_query){
            scores_class_previous = all_scores_previous[i];
            break;
        }
    }
    if(!scores_class || !scores_class_previous){
        console.log("scores_class or scores_class_previous is null");
        return [85,85];
    }
    var scores;
    var scores_previous;
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
    if(0){
        var info = new userInfo();
        info.uid = uid;
        db.getUserBaseInfo(info,function (err){
            if (err) {
                console.log(err + " getLuck2");
            }
            else {
                var yearStar = parseInt(info["flystar"].charAt(2));
                var query_star = anylysis.getQueryStar(info,time_type,new Date());
                var star_of_query = query_star[0] - 1;
                var previous_star_of_query = query_star[1] - 1;
                var previous_previous_star_of_query = query_star[2] - 1;
                var luck_scores_class;
                var luck_scores_class_previous;
                var all_luck_scores = scores_new[score_type][info.sex][star_of_query];
                for(var i = 0; i < all_luck_scores.length; ++i){
                    if(all_luck_scores[i].beforstar == previous_star_of_query){
                        luck_scores_class = all_luck_scores[i];
                        break;
                    }
                }
                var all_luck_scores_previous = scores_new[score_type][info.sex][previous_previous_star_of_query];
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

                var luck_socres = scores[yearStar -1];
                var luck_socres_previous = scores_previous[yearStar -1];
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
                }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                    answer += luck_index_row.month_last_level_describe[last_level_describe_index];
                }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                    answer += luck_index_row.year_last_level_describe[last_level_describe_index];
                }
                else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                    answer += luck_index_row.now_last_level_describe[last_level_describe_index];
                }
                cb(answer);
            }
        });
    }else{
        anylysis.getInfo(uid,function(info){
            var scores = anylysis.getScore(info,time_type,score_type,new Date());
            var luck_socres = scores[0];
            var luck_socres_previous = scores[1];
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
    }
};

anylysis.getWork = function(uid,time_type,score_type,cb){
    anylysis.getInfo(uid,function(info){
        var scores = anylysis.getScore(info,time_type,score_type,new Date());
        var work_socres = scores[0];
        var work_socres_previous = scores[1];
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
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getEnergy");
        }
        else {
            var yearStar = parseInt(info["flystar"].charAt(2));
            var query_star = anylysis.getQueryStar(info,time_type,new Date());
            var star_of_query = query_star[0] - 1;
            var previous_star_of_query = query_star[1] - 1;
            var previous_previous_star_of_query = query_star[2] - 1;
            var energy_scores_class;
            var energy_scores_class_previous;
            var all_energy_scores = scores_new[score_type][info.sex][star_of_query];
            for(var i = 0; i < all_energy_scores.length; ++i){
                if(all_energy_scores[i].beforstar == previous_star_of_query){
                    energy_scores_class = all_energy_scores[i];
                    break;
                }
            }
            var all_energy_scores_previous = scores_new[score_type][info.sex][previous_previous_star_of_query];
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
            var energy_socres = scores[yearStar -1];
            var energy_socres_previous = scores_previous[yearStar-1];
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
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_MONTH == time_type){
                answer += energy_index_row.month_last_level_describe[last_level_describe_index];
            }else if(consts.TYPE_TIME.TYPE_TIME_THIS_YEAR == time_type){
                answer += energy_index_row.year_last_level_describe[last_level_describe_index];
            }
            else if(consts.TYPE_TIME.TYPE_TIME_HOUR == time_type){
                answer += energy_index_row.now_last_level_describe[last_level_describe_index];
            }
            cb(answer);
        }
    });
};

anylysis.getTravel = function(uid,time_type,score_type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + " getTravel");
        }
        else {
            var yearStar = parseInt(info["flystar"].charAt(2));
            var query_star = anylysis.getQueryStar(info,time_type,new Date());
            var star_of_query = query_star[0] - 1;
            var previous_star_of_query = query_star[1] - 1;
            var previous_previous_star_of_query = query_star[2] - 1;
            var travel_scores_class;
            var travel_scores_class_previous;
            var all_travel_scores = scores_new[score_type][info.sex][star_of_query];
            for(var i = 0; i < all_travel_scores.length; ++i){
                if(all_travel_scores[i].beforstar == previous_star_of_query){
                    travel_scores_class = all_travel_scores[i];
                    break;
                }
            }
            var all_travel_scores_previous = scores_new[score_type][info.sex][previous_previous_star_of_query];
            for(i = 0; i < all_travel_scores_previous.length; ++i){
                if(all_travel_scores_previous[i].beforstar == previous_star_of_query){
                    travel_scores_class_previous = all_travel_scores_previous[i];
                    break;
                }
            }
            var scores = travel_scores_class.scores;
            var scores_previous = travel_scores_class_previous.scores;

            var travel_socres = scores[yearStar -1];
            var travel_socres_previous = scores_previous[yearStar -1];
            var travel_index_rows = alteration_index[0][3];
            var travel_index_row;
            for(i = 0; i < travel_index_rows.length; ++i){
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
        }
    });
};

anylysis.getCompassMaxScore = function(uid,type,cb){
    var info = new userInfo();
    info.uid = uid;
    db.getUserBaseInfo(info,function (err){
        if (err) {
            console.log(err + "getCompassMaxScore");
        }
        else {
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
                    }
                }
            }
            // sort scores
            console.log("%j",scores);
            for(var l = 0; l < scores.length; ++l){
                scores[l] = scores[l]*100 + l;
            }
            scores.sort();
            var index = scores[scores.length-1]%100;
            var directions = ["正南","东南","正东","东北","正北","西北","正西","西南"];
            var direction = directions[index-1];
            var answer = direction + "," + ( scores[scores.length-1] - index ) / 100 + "分";
            cb(answer);
        }
    });
};