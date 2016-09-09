var express = require('express');
var router = express.Router();
var model = require('../models');

/* GET home page. */
/* I can't get correct query from Sequelize, so I made this up. */
const queryLatestGames = `SELECT
	\`Game\`.*,
	count(Guides.id) \`Count\`
FROM
	\`Games\` AS \`Game\`
LEFT JOIN Guides ON Guides.GameId = Game.Id
GROUP BY
	Game.Id
ORDER BY
	\`Game\`.\`id\` DESC
LIMIT 5`.replace(/\s+/g, ' ');

router.get('/', function(req, res, next) {
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
    .all([
      model.sequelize.query(queryLatestGames, {type: model.sequelize.QueryTypes.SELECT}),
      model.Guide.findAll(guideParam)
    ])
    .then(values => {
      let [games, guides] = values;

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
