var express = require('express');
var router = express.Router();
var GameModel = require('../models/game');

/* GET home page. */
router.get('/', function(req, res, next) {
  GameModel.CreateHomeFeed().then(data => {
    res.render('home', {
      games: data.games,
      guides: data.guides
    });
  }).catch(err => next(err));
});

router.get('/tag/:tag', function(req, res, next) {
  res.render('index', { title: 'tag' });
});

module.exports = router;
