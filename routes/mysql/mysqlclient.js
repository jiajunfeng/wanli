// mysql CRUD
var sqlclient = module.exports;

var _pool = null;

var NND = {};

/*
 * Innit sql connection pool
 * @param {Object} app The app for the server.
 */
NND.init = function(){
  
  if(!_pool)
    _pool = require('./mysql_pool').createMysqlPool();
  if(_pool){
  	console.log("mysql pool created!");
  }
};

/**
 * Excute sql statement
 * @param {String} sql Statement The sql need to excute.
 * @param {Object} args The args for the sql.
 * @param {fuction} callback Callback function.
 * 
 */
NND.query = function(sql, args, callback){
  _pool.getConnection(function(err, client) {
    if (!!err) {
      console.error('[sqlqueryErr] '+err.stack);
      return;
    }
    client.query(sql, args, function (err, res) {
      //client.release();
      _pool.releaseConnection(client);
      callback.apply(null, [err, res]);
    });

  });
};

/**
 * Close connection pool.
 */
NND.shutdown = function(){
	if(_pool){
	  _pool.end();
	}
};

/**
 * init database
 */
sqlclient.init = function() {
  if (!!_pool){
    return sqlclient;
  } else {
    NND.init();
    sqlclient.insert = NND.query;
    sqlclient.update = NND.query;
    //sqlclient.delete = NND.query;
    sqlclient.query = NND.query;
    return sqlclient;
  }
};

/**
 * shutdown database
 */
sqlclient.shutdown = function() {
  NND.shutdown();
};

sqlclient.curId = 0;