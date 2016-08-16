/**
 * Created by Jixun on 14/08/2016.
 */

const db = require('../db');
const crypto = require('crypto');

/** @typedef {{
* user_id: number,
* name: string,
* email: string,
* password: string,
* pw_salt: string,
* activated: number,
* created_at: Date
* }} UserRow */

/** @typedef {{
* data: UserRow|null,
* success: Boolean
* }} LoginResult */

const sqlGetUserByEmail = `
SELECT
	users.*

FROM
	users

WHERE
	users.email = ?`;

const sqlUpdatePassword = `
UPDATE
  users

SET
  password = ?,
  pw_salt = ?

WHERE user_id = ?`;




class ModelUser {
  /**
   * Check if Username/Password correct.
   * @param {string} user Username
   * @param {string} pw   Password
   * @returns {Promise.<LoginResult>}
   * @constructor
   */
  static Login(user, pw) {
    // 获取用户信息
    var _conn;

    return db().then(conn => {
      _conn = conn;

      return conn.query(sqlGetUserByEmail, [user]);
    }).then(res => {
      /** @type {UserRow} */
      var user = res[0][0];
      _conn.release();

      var success = user && ModelUser.HashPassword(pw, new Buffer(user.pw_salt, 'base64'), 'base64') == user.password;

      var result = {
        success: success,
        data: null
      };

      if (success)
        result.data = user;

      return result;
    });
  }

  /**
   * Set new password for a user.
   * @param {number} user_id
   * @param {string} pw
   * @returns {Promise.<Boolean>}
   * @constructor
   */
  static SetPassword(user_id, pw) {
    const salt = ModelUser.GenerateSalt();
    const hashedPw = ModelUser.HashPassword(pw, salt, 'base64');
    const saltBase64 = salt.toString('base64');

    var _conn;
    return db().then(conn => {
      _conn = conn;

      return conn.query(sqlUpdatePassword, [hashedPw, saltBase64, user_id]);
    }).then(res => {
      var result = res[0];
      _conn.release();
      return result.affectedRows == 1;
    });
  }

  /**
   * Hash password with salt.
   * @param {string|Buffer} password
   * @param {string|Buffer} salt
   * @param {string} [encoding]
   * @returns {string|Buffer}
   * @constructor
   */
  static HashPassword(password, salt, encoding) {
    var hmac = crypto.createHmac('sha512', salt);
    hmac.update(password);
    return hmac.digest(encoding);
  }

  /**
   * Generate salt.
   * @param {number} len
   * @returns {Buffer}
   * @constructor
   */
  static GenerateSalt(len = 20) {
    return crypto.randomBytes(len);
  }
}

module.exports = ModelUser;