/**
 * Created by Jixun on 15/08/2016.
 */

var UserModel = require('../models/user');
var forbiddenUsernames = ['admin', 'login', 'register', '管理员', 'activate', 'reset'];

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
      UserModel.Login(req.body.mail, req.body.passwd).then(result => {
        var data = {
          success: false,
          messages: []
        };

        if (result.success) {
          req.session.user = result.data;
          data.success = true;
        } else {
          data.messages.push('用户名或密码不匹配。');
        }

        if (req.xhr) {
          res.send(data);
        } else if ( result.success ) {
          // Redirect to home page.
          res.redirect('/');
        } else {
          // Show error messages.
          res.render('login', data);
        }
      }).catch(err => {
        console.error(err);
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
    if (req.session.user) {
      res.redirect('/user');
    } else if (req.method == 'GET') {
      res.render('register');
    } else if (req.method == 'POST') {
      // TODO: 账户注册 POST
      res.render('register');
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

module.exports = UserController;