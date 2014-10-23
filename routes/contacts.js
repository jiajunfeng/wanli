/**
 * Created by King Lee on 14-9-22.
 */
var db = require('./mysql/dboperator');
var userInfo = require('./userInfo.js').userInfo;

exports.onContract = function(req,res){
    var uid = parseInt(req.body["uid"]);
    var contracts_uid = parseInt(req.body["contracts_uid"]);
    var contracts_name = req.body["contracts_name"];
    var type = req.body["type"];
    var result = { error: "" };
    if("add" == type){
        db.addToContract(uid,contracts_uid,contracts_name,function(err){
            if(err){
                console.log(err);
                result.err = err;
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }else if("del" == type){
        db.delFromContract(uid,contracts_uid,function(err){
            if(err){
                console.log(err);
                result.err = err;
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }else if("get" == type){
        db.getContract(uid,function(err,contracts){
            if(err){
                console.log(err);
                result.err = err;
            }
            result.contracts = contracts;
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result));
        });
    }
};