/**
 * Created by Jixun on 17/08/2016.
 */

var config = require('../config');

module.exports = function (req, res, next) {
  req.appConfig = config;
  res.locals.config = config;
  next();
};