'use strict';
const crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: { type: DataTypes.STRING, unique: true },
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    salt: DataTypes.STRING,
    activated: DataTypes.BOOLEAN,
    is_admin: DataTypes.BOOLEAN
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        unique: true,
        fields: ['email']
      },
    ],
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Guide);
      },

      login: function (email, pw) {
        return User.findOne({
          where: {
            email: email
          }
        }).then(user => {
          if (User.hashPassword(pw, new Buffer(user.salt, 'base64'), 'base64') == user.password) {
            return user;
          }
          return null;
        });
      },

      setPassword: function (user, pw) {
        const salt = this.generateSalt();
        const hashedPw = this.hashPassword(pw, salt, 'base64');
        const saltBase64 = salt.toString('base64');

        return user.update({
          password: hashedPw,
          salt: saltBase64
        });
      },

      /**
       * Hash password with salt.
       * @param {string|Buffer} password
       * @param {string|Buffer} salt
       * @param {string} [encoding]
       * @returns {string|Buffer}
       * @constructor
       */
      hashPassword: function (password, salt, encoding) {
        var hmac = crypto.createHmac('sha512', salt);
        hmac.update(password);
        return hmac.digest(encoding);
      },


      /**
       * Generate salt.
       * @param {number} len
       * @returns {Buffer}
       * @constructor
       */
      generateSalt: function (len = 20) {
        return crypto.randomBytes(len);
      }
    }
  });
  return User;
};