/**
 * Created by Jixun on 15/08/2016.
 */
var debug = require('debug')('controller:game');
var express = require('express');
var moment = require("moment");
var router = express.Router();
var model = require('../models');
const _ = require('underscore');

class GuideController {
  static GetChapterAjax(req, res, next) {
    model.Chapter.findOne({
      where: {
        id: req.params.chapter
      },
      attributes: ['content']
    }).then(chapter => {
      res.send({ data: chapter.content });
    }).catch(err => {
      debug('ChapterAjax: ' + err);
      res.send({ data: `服务器发生错误，请稍后刷新重试~` })
    });
  }
  static GetChaptersAjax(req, res, next) {
    let chapterIds = req.params.chapters
      .split(',')
      .map(x => parseInt(x))
      .filter(x => x);

    model.Guide.findOne({
      where: {
        id: req.params.guide,
        UserId: req.session.user.id
      },
      include: [
        {
          model: model.Chapter,
          where: {
            id: chapterIds
          },
          attributes: ['id', 'content', 'updatedAt']
        }
      ]
    }).then(guide => {
      /** @type Object[] */
      let chapters = guide.Chapters.map(c => c.dataValues);

      chapters.forEach(chapter => {
        chapter.updated = chapter.updatedAt.getTime();
        delete chapter.updatedAt;
      });

      res.send({ data: chapters, success: true });
    }).catch(err => {
      debug('ChapterAjax: ' + err);
      res.send({ data: `服务器发生错误，请稍后刷新重试。`, success: false })
    });
  }
  static RenderGame(req, res, next) {
    model.Game
      .findOne({
        where: {
          url: req.params.game
        },
        include: [
          {
            model: model.Guide,
            attributes: [ 'url', 'name', 'short_desc' ],
            include: [
              {
                model: model.User,
                attributes: ['name']
              }
            ]
          }
        ]
      })
      .then(game => {
        if (game) {
          res.render('game', {
            game: game
          });
        } else {
          res.render('error-user', {
            title: '游戏不存在',
            message: '您所查阅的游戏不存在。'
          });
        }
      }).catch(err => next(err));
  }
  static RenderGuide(req, res, next) {
    let _guide;
    let _chapters;
    let _chapter;

    model.Guide.findOne({
      where: {
        url: req.params.guide
      },
      include: [
        {
          model: model.Chapter,
          attributes: [ 'id', 'is_header', 'name', 'url', 'order' ]
        },
        {
          model: model.Game,
          attributes: ['url', 'name']
        },
        {
          model: model.User,
          attributes: ['name']
        }
      ],
      order: [
        [model.Chapter, 'order', 'ASC'],
        [model.Chapter, 'id', 'ASC']
      ]
    }).then(guide => {
      if (!guide) {
        res.render('error-user', {
          title: '攻略不存在',
          message: '您所查阅的攻略不存在。'
        });
        return ;
      }
      _guide = guide;
      let chapters = _chapters = guide.Chapters;
      let filtered = chapters.filter(c => !c.is_header);
      _chapter = _.find(filtered, c => c.url == req.params.chapter) || filtered[0];

      if (_chapter) {
        _chapter.active = true;
        return model.Chapter.findOne({
          where: {
            id: _chapter.id
          },
          attributes: [ 'content' ]
        });
      } else {
        res.render('guide', {
          chapters: [],
          chapter: {
            name: '没有攻略!',
            content: '请联系攻略作者添加内容！'
          },
          guide: _guide
        });
      }
    }).then(chapter => {
      if (chapter) {
        _chapter.content = chapter.content;
        res.render('guide', {
          chapter: _chapter,
          chapters: _chapters,
          guide: _guide
        });
      }
    }).catch(err => next(err));
  }

  static EditGame (req, res, next) {
    if (!req.session.user) {
      next(new Error('请先登录！'));
      return ;
    }

    model.Game.findOne({
      id: req.params.game,
      UserId: req.session.user.id
    }).then(game => {
      if (!game) {
        next(new Error('游戏不存在或没有编辑权限。'));
        return ;
      }

      res.render('edit-game', { game: game.dataValues });
    }).catch(err => next(err));
  }

  static EditGuide(req, res, next) {
    if (!req.session.user) {
      next(new Error('请先登录！'));
      return ;
    }

    model.Guide.findOne({
      where: {
        id: req.params.guide,
        UserId: req.session.user.id
      },
      include: [
        {
          model: model.Chapter,
          attributes: [
            ['id', 'chapter_id'],
            'url',
            'name',
            'order',
            'is_header',
            //'content',
            'updatedAt'
          ]
        },
        {
          model: model.Game,
          attributes: [
            'id', 'name', 'url'
          ]
        }
      ],
      order: [
        [model.Chapter, 'order', 'ASC'],
        [model.Chapter, 'id', 'ASC']
      ]
    }).then(guide => {
      if (!guide || guide.UserId != req.session.user.id) {
        next(new Error('攻略不存在或没有编辑权限！'));
        return ;
      }

      /** @type Object[] */
      let chapters = guide.Chapters.map(chapter => chapter.dataValues);

      chapters.forEach(chap => {
        chap.updated = chap.updatedAt.getTime();
        delete chap.updatedAt;
      });

      res.render('edit-guide', {
        guide: guide,
        chapters: chapters
      });
    }).catch(err => next(err));
  }

  static AddGame(req, res, next) {
    if (!req.session.user) {
      next(new Error('请先登录！'));
      return ;
    }

    res.render('edit-game', {
      game: {
        id: 0,
        name: '新的游戏',
        url: '新的游戏',
        release_id: '0001',
        release_date: '2010-01-01',
        cover_url: 'https://placehold.it/200x200'
      }
    });
  }
  static AddGuide(req, res, next) {
    if (!req.session.user) {
      next(new Error('请先登录！'));
      return ;
    }

    model.Game
      .findOne({
        where: {
          id: req.params.game
        },
        attributes: ['id', 'url', 'name']
      })
      .then(game => {
        if (!game) {
          next(new Error('游戏不存在或已删除。'));
          return ;
        }

        res.render('edit-guide', {
          guide: {
            id: 0,
            name: '新的攻略',
            url: '新的攻略',
            Game: game
          },
          chapters: [{
            url: '新的章节',
            name: '新的章节',
            order: 1,
            content: ''
          }]
        });
      });
  }

  static UpdateGame(req, res, next) {
    // 检查是否登录。
    if (!req.session.user) {
      res.render('error', {message: '请先登录。'});
      return ;
    }

    let gameId = parseInt(req.params.game);
    // 检查操作是添加还是修改
    let param = {
      name: req.body.name,
      url: req.body.url,
      release_id: req.body.release_id,
      release_date: req.body.release_date,
      cover_url: req.body.cover_url,
      description: req.body.description
    };

    let wait;

    if (gameId == 0) {
      // 添加游戏数据
      param.UserId = req.session.user.id;
      wait = model.Game.create(param);
    } else {
      // 修改游戏数据
      wait = model.Game
        .findOne({ id: req.body.id })
        .then(game => {
          if (game.UserId != req.session.user.id)
            throw new Error('您没有修改该游戏数据的权限。');
          return game.update(param);
        });
    }

    wait.then(game => {
      res.redirect('/game/' + encodeURIComponent(game.url));
    }).catch(err => next(err));
  }
  static UpdateGuide(req, res, next) {
    // 检查是否登录。
    if (!req.session.user) {
      res.render('error', {message: '请先登录。'});
      return ;
    }

    let guideId = parseInt(req.params.guide);

    // 处理网址，避免重复 & 规范化
    let uniqueChapterUrls = [];
    const keepKeys = ['content', 'name', 'order', 'remove'];
    var chapters = req.body.chapters.map(chapter => {
      /** @var {number} chapter.remove */
      /** @var {number} chapter.chapter_id */
      if (chapter.remove) {
        if (chapter.chapter_id == 0)
          return null;

        return {
          id: chapter.chapter_id,
          remove: true
        };
      }

      if (chapter.is_header) {
        return {
          id: chapter.chapter_id,
          is_header: 1,
          order: chapter.order,
          name: chapter.name
        };
      }

      let chapterUrl = chapter.url.toLowerCase().trim().replace(/\//g, '-');
      if (uniqueChapterUrls.indexOf(chapterUrl) != -1) {
        if (!/-\d+$/.test(chapterUrl)) {
          chapterUrl += '-1';
        }

        chapterUrl = chapterUrl.replace(/(^.+)(-)(\d+)$/, function (z, first, dash, digits) {
          var number = parseInt(digits);
          let result;
          while(true) {
            result = first + dash + number;
            if (uniqueChapterUrls.indexOf(result) == -1) {
              break;
            }
            number ++;
          }
          return result;
        });
      }
      uniqueChapterUrls.push(chapterUrl);

      let newChap = {
        id: chapter.chapter_id,
        url: chapterUrl,
        GuideId: guideId
      };
      keepKeys.forEach(key => {
        newChap[key] = chapter[key];
      });

      return newChap;
    }).filter(chapter => chapter);

    let guidePromise;
    let param = {
      name: req.body.name,
      url: req.body.url,
      short_desc: req.body.short_desc
    };

    if (guideId == 0) {
      // 添加攻略
      param.UserId = req.session.user.id;
      param.GameId = req.body.gameId;
      // TODO: 游戏 ID，简单描述
      guidePromise = model.Guide.create(param);
    } else {
      guidePromise = model.Guide.findOne({
        where: {
          id: guideId,
          UserId: req.session.user.id
        }
      }).then(guide => {
        if (!guide) {
          throw new Error('攻略不存在或没有修改权限。');
        }

        return guide.update(param);
      });
    }

    let _guide;
    guidePromise.then(guide => {
      _guide = guide;
      return model.Chapter.findAll({
        where: {
          GuideId: guide.id
        },
        attributes: [ 'id' ]
      });
    }).then(chapterIds => {
      let existingIds = chapterIds.map(chapter => chapter.id);

      // 批量添加/更新/删除
      return Promise.all(
        chapters.map(chapter => {
          let remove = chapter.remove;
          let id = chapter.id;
          delete chapter.id;
          delete chapter.remove;
          chapter.GuideId = _guide.id;

          if (existingIds.indexOf(id) == -1) {
            if (remove) {
              // ignore
              debug(`Ignore chapter delete request: ${id}`);
              return new Promise(resolve => resolve(null));
            }

            debug(`Create new Chapter: ${ id } (${ chapter.name })`);
            debug(chapter);
            return model.Chapter.create(chapter);
          } else if (remove) {
            // delete
            debug(`Delete chapter ${id}`);
            return model.Chapter.destroy({
              where: {
                id: id
              }
            });
          } else {
            // update
            debug(`update chapter: ${ id } (${ chapter.name })`);
            return model.Chapter.update(chapter, {
              where: {
                id: id
              }
            });
          }
        })
      );
    }).then(result => {
      res.send({
        location: '/guide/' + encodeURIComponent(_guide.url)
      });
    }).catch(err => {
      debug('Add guide error: ', err);
      next(err);
    });
  }

  static JumpGame(req, res, next) {
    model.Game.findOne({
      where: {
        id: req.params.game,
      },
      attributes: ['url']
    }).then(game => {
      res.redirect(`/game/${ encodeURIComponent(game.url) }`);
    }).catch(err => {
      debug(err);
      next()
    });
  }
  static JumpGuide(req, res, next) {
    model.Guide.findOne({
      where: {
        id: req.params.guide,
      },
      attributes: ['url']
    }).then(guide => {
      debug(guide);
      res.redirect(`/guide/${ encodeURIComponent(guide.url) }`);
    }).catch(err => {
      debug(err);
      next()
    });
  }
  static JumpChapter(req, res, next) {
    model.Chapter.findOne({
      where: {
        id: req.params.chapter,
      },
      attributes: ['url'],
      include: [
        {
          model: model.Guide,
          attributes: ['url']
        }
      ]
    }).then(chapter => {
      let c = encodeURIComponent(chapter.url);
      let g = encodeURIComponent(chapter.Guide.url);
      res.redirect(`/guide/${ g }/${ c }`);
    }).catch(err => {
      debug(err);
      next()
    });
  }
}


router.get ('/api/chapter/:chapter', GuideController.GetChapterAjax);
router.get ('/api/chapters/:guide/:chapters', GuideController.GetChaptersAjax);
router.post('/api/update/guide/:guide', GuideController.UpdateGuide);

router.get('/new/game', GuideController.AddGame);
router.get('/new/guide/:game', GuideController.AddGuide);

router.get('/edit/game/:game', GuideController.EditGame);
router.get('/edit/guide/:guide/', GuideController.EditGuide);

router.post('/edit/game/:game', GuideController.UpdateGame);
// router.post('/edit/guide/:guide/', GuideController.UpdateGuide);

router.get('/r/:game', GuideController.JumpGame);
router.get('/game-id/:game', GuideController.JumpGame);

router.get('/g/:guide', GuideController.JumpGuide);
router.get('/guide/id/:guide', GuideController.JumpGuide);

router.get('/c/:chapter', GuideController.JumpChapter);

router.get('/game/:game', GuideController.RenderGame);
router.get('/guide/:guide', GuideController.RenderGuide);
router.get('/guide/:guide/:chapter', GuideController.RenderGuide);

module.exports = router;