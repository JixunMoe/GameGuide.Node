/**
 * Created by Jixun on 15/08/2016.
 */

var userModel = require('../models/user');
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
      // TODO: 账户登陆 POST
      res.render('login');
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
    // TODO: 登出系统, 检查
    res.render('index', {title: 'logout'});
  }

  static getUser (req, res, next) {
    var username = req.params.user;
    UserController.showUser(username, req, res, next);
  }
}

module.exports = UserController;