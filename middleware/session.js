/**
 * Created by Jixun on 16/08/2016.
 */

var crypto = require('crypto');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

//noinspection SpellCheckingInspection
var sessionMiddleware = session({
  store: new RedisStore({
    db: 0
  }),
  resave: false,
  saveUninitialized: false,
  secret: '_session_gg_redis_'
});

module.exports = function (req, res, next) {
  sessionMiddleware(req, res, function (err) {
    if (err) return next(err);

    if (!req.session) {
      res.locals.session = {};
      res.status(500).render('error', {
        message: 'Fatal Error',
        error: {
          status: '无法获取回话信息。',
          stack: 'app.session'
        }
      });
      return;
    }

    res.locals.session = req.session;

    // CSRF protection
    /**
     * Generate a new csrf token.
     */
    req.newCsrfToken = function () {
      req.session._csrfToken = crypto.randomBytes(32).toString('base64');
    };

    /**
     * Check csrf token
     * @param {string} [token] CSRF Token. If empty, it will read `req.body._csrf` field.
     * @returns {boolean} The token is valid or not.
     */
    req.validateCsrf = function (token) {
      return req.session._csrfToken == (token || req.body._csrf);
    };

    if (!req.session._csrfToken)
      req.newCsrfToken();

    if (req.method == 'POST') {
      if (!req.validateCsrf()) {
        var data = {
          success: false,

          title: '身份令牌有误',
          reasons: ['认证令牌缺失或无效。']
        };
        if (req.xhr) {
          res.status(403).send(data);
        } else {
          res.status(403).render('error-403', data);
        }

        return ;
      }
    }

    next();
  });
};