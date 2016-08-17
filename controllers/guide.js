/**
 * Created by Jixun on 14/08/2016.
 */

var _ = require('underscore');
var GameModel = require('../models/game');
var moment = require('moment');

// 读取章节索引，并展示第一章。
class GuideController {
  static RenderGame (req, res, next) {
    // 读取游戏数据。
    GameModel.GetGameInformation(req.params.game).then(data => {
      var game = data.game;
      var guides = data.guides;
      res.render('game', {
        game: game,
        guides: guides,
        moment: moment
      });
    }).catch(err => next(err));
  }

  static GetChapterAjax (req, res, next) {
    GameModel.GetChapterFromId(req.params.chapter).then(chapter => {
      res.send({data: chapter.content});
    }).catch(err => next(err));
  }

  static RenderGuide (req, res, next) {
    GameModel.GetGuideFromUrl(req.params.game, req.params.guide, req.params.chapter).then(data => {
      data.chapters.forEach(chapter => {
        delete chapter.username;
      });

      res.render('guide', {
        guide: data.guide,
        chapters: data.chapters,
        chapter: data.chapter,
        moment: moment
      });
    }).catch(err => next(err));
  }
}

module.exports = GuideController;