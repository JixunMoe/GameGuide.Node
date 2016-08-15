/**
 * Created by Jixun on 13/08/2016.
 */

var mysql = require('mysql2/promise');

var pool = mysql.createPool({
  connectionLimit : 32,
  host            : '127.0.0.1',
  user            : 'Your Username',
  password        : 'Your Password',
  database        : 'game_guides'
});

/**
 *
 * @returns {Promise<PromiseConnection>}
 */
module.exports = function db () {
  return pool.getConnection();
};

