var express = require('express');
var router = express.Router();
var GameModel = require('../models/game');
var model = require('../models');
const _ = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
  let gameParam = {
    order: [
      ['id', 'desc']
    ],
    include: [
      {
        model: model.Guide,
        attributes: [
          [model.sequelize.fn('COUNT', 'Guide.id'), 'Count']
        ]
      }
    ],
    limit: 5
  };

  let guideParam = {
    order: [
      ['id', 'desc']
    ],
    include: [
      {
        model: model.Game,
        attributes: ['name', 'url']
      },
      {
        model: model.User,
        attributes: ['name']
      }
    ],
    limit: 5
  };

  Promise
    .all([model.Game.findAll(gameParam), model.Guide.findAll(guideParam)])
    .then(values => {
      let [games, guides] = values;

      games = games
        .filter(game => game.id)
        .map(g => {
          return _.extend({
            guideCount: g.Guides.length > 0 ? g.Guides[0].dataValues.Count : 0
          }, g.dataValues);
        });

      res.render('home', {
        games: games,
        guides: guides
      });
    }).catch(err => next(err));
});

router.get('/page/about', function (req, res, next) {
  res.render('page-about', { url: 'about' });
});

module.exports = router;
