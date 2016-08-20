require('es6-promise').polyfill();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');
var marked = require('marked');
moment.locale('zh-cn');

const debug =require('debug')('app:boot');
var routes = require('./routes/index');
var users = require('./routes/users');
var games = require('./routes/games');

var app = express();

app.locals.moment = moment;
app.locals.marked = marked;
app.locals.excerpt = function (text, count) {
  if (!text || text.length == 0) return '无';

  if (text.length > count)
    return text.slice(0, count - 3) + '...';

  return text;
};

app.locals.url_user = function (name) {
  return '/user/' + name;
};
app.locals.url_guide = function (guide, chapter) {
  return '/guide/' + Array.prototype.join.call(arguments, '/');
};
app.locals.url_game = function (game) {
  return '/game/' + game;
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./middleware/session'));
app.use(require('./middleware/duoshuo'));

app.use('/', routes);
app.use('/user', users);
app.use('/', games);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    debug(err.message);
    debug(err.stack);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  debug(err.message);
  debug(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
