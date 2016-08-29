var express = require('express');
var router = express.Router();

var config = require('../config');
var debug = require('debug')('controller:User');
var models = require('../models');
var _ = require("underscore");
var forbiddenUsername = ['admin', 'login', 'register', '管理员', 'activate', 'reset'];

class UserController{
  static home (req, res, next) {
    if (req.session.user) {
      UserController.showUser(req.session.user.name, req, res, next);
    } else if (req.method == 'GET') {
      UserController.login(req, res, next);
    } else {
      res.status(404).end();
    }
  }

  static showUser (name, req, res, next) {
    // TODO: 获取用户信息，并展示
    res.render('index', {title: name});
  }

  static login (req, res, next) {
    if (req.session.user) {
      res.redirect('/user');
    } else if (req.method == 'GET') {
      res.render('login');
    } else if (req.method == 'POST') {
      models.User.login(req.body.mail, req.body.passwd).then(user => {
        var data = {
          success: false,
          messages: []
        };

        if (user == null) {
          data.messages.push('用户名或密码不匹配。');
        } else {
          data.success = true;

          let userData = _.extend({}, user.dataValues);
          delete userData.password;
          delete userData.salt;
          req.session.user = userData;
        }

        if (req.xhr) {
          res.send(data);
        } else if ( user ) {
          // Redirect to home page.
          res.redirect('/');
        } else {
          // Show error messages.
          res.render('login', data);
        }
      }).catch(err => {
        debug(`Login error: ${err}`);
        var data = {
          success: false,
          messages: ['服务器开小差啦，请稍后重试。']
        };

        if (req.xhr) {
          res.send(data);
        } else {
          res.render('login', data);
        }
      });
    }
  }

  static register (req, res, next) {
    let isAdmin = req.session.user && req.session.user.is_admin;
    if (!config.allow_reg && !isAdmin) {
      res.render('user-error', {
        message: '已关闭注册，请联系管理员建立账号。',
        title: '已关闭注册'
      });
      return ;
    }

    if (req.session.user && !isAdmin) {
      res.redirect('/user');
    } else if (req.method == 'GET') {
      res.render('register');
    } else if (req.method == 'POST') {
      let data = {
        success: true,
        messages: [],
        errors: []
      };

      let username = req.body.name.toLowerCase();
      if (_.some(forbiddenUsername, name => username.indexOf(name) != -1)) {
        data.success = false;
        data.errors.push('用户名包含禁止使用的名称。');
        if (req.xhr) {
          res.send(data);
        } else {
          res.render('register', data);
        }
        return ;
      }

      models.User.create({
        name: req.body.name,
        email: req.body.mail,
        activated: 0
      }).then(user => {
        return models.User.setPassword(user, req.body.passwd);
      }).then(user => {
        res.redirect('/');
      }).catch(err => {
        data.errors.push('禁止使用的用户名或邮箱。');

        if (req.xhr) {
          res.send(data);
        } else {
          res.render('register', data);
        }
      });
    }
  }

  static activate (req, res, next) {
    // TODO: 激活账户
    res.render('index', {title: 'activate'});
  }

  static resetPassword (req, res, next) {
    res.render('reset-password');
  }

  static logout (req, res, next) {
    req.session.destroy();
    res.redirect('/');
  }

  static getUser (req, res, next) {
    var username = req.params.user;
    UserController.showUser(username, req, res, next);
  }
}


router.get('/', UserController.home);
router.all('/login', UserController.login);
router.all('/register', UserController.register);
router.get('/activate/:uid/:token', UserController.activate);
router.all('/reset', UserController.resetPassword);
router.get('/logout', UserController.logout);
router.get('/:user', UserController.getUser);

module.exports = router;
