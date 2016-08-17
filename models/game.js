/**
 * Created by Jixun on 13/08/2016.
 */

var _ = require('underscore');
var db = require('../db');


/** @typedef {{
* chapter_id: string,
* guide_id: string,
* url: string,
* title: string,
* content: string,
* order: string|number
* }} ChapterRow */


/** @typedef {{
* guide_id: string,
* game_id: string,
* user_id: string,
* url: string,
* name: string,
* short_desc: string,
* created_at: string,
* update_at: string
* }} GuideRow */

/** @typedef {{
* id: string,
* url: string,
* title: string,
* localised_title: string,
* alternative_title: string,
* release_id: string,
* developer_id: int,
* publisher_id: int,
* release_date: string,
* cover_url: string,
* description: string
* }} GameRow */


/** @typedef {{
* url: string,
* title: string,
* description: string,
* release_date: Date,
* guide_count: number
* }} GameFeedEntry */

/** @typedef {{
* game_url: string,
* game_title: string,
* name: string,
* guide_url: string,
* short_desc: string,
* update_at: string,
* username: string
* }} GuideFeedEntry */


const sqlGameFromUrl = `
SELECT
game.*

FROM
	game

WHERE
  game.url = ?`;

const sqlGameGuidesFromId = `
SELECT
	guide.*,
	users.name username
FROM
	guide

INNER JOIN users ON
	guide.user_id = users.user_id

WHERE
	guide.game_id = ?
ORDER BY
	guide.update_at DESC`;

const sqlGuideFromUrl = `
SELECT
  guide.*,
  users.name guide_user,
  game.url game_url,
  game.title game_title

FROM
	guide

INNER JOIN users ON
	guide.user_id = users.user_id

INNER JOIN game ON
	guide.game_id = game.id

WHERE
	game.url = ? AND
	guide.url = ?

ORDER BY
	guide.update_at DESC`;

const sqlChapterMetaFromGuideId = `
SELECT
	chapter.url,
	chapter.title,
	chapter.chapter_id,
	users.name username

FROM
	chapter

INNER JOIN guide ON
  guide.guide_id = chapter.guide_id

INNER JOIN users ON
	users.user_id = guide.user_id

WHERE
	chapter.guide_id = ?

ORDER BY
	chapter.order ASC,
	chapter.chapter_id ASC`;

const sqlChapterFromChapterId = `
SELECT chapter.*

FROM
  chapter

WHERE
  chapter.chapter_id = ?

LIMIT 1
`;

const sqlGameFeed = `
SELECT
  game.url,
	game.title,
	game.description,
	game.release_date,
	Count(guide.guide_id) guide_count

FROM
	game

INNER JOIN guide ON
	guide.game_id = game.id

ORDER BY
	game.id DESC

LIMIT 5`;

const sqlGuideFeed = `
SELECT
	game.url game_url,
	game.title game_title,
	guide.url guide_url,
	guide.name,
	guide.short_desc,
	guide.update_at,
	users.name username

FROM
	guide

INNER JOIN game ON
	game.id = guide.game_id

INNER JOIN users ON
	guide.user_id = users.user_id

ORDER BY
	guide.guide_id DESC

LIMIT 5`;


class ModelGame {
  /**
   * 从游戏标题获取信息。
   * @param {string} gameUrl
   * @constructor
   */
  static GetGameInformation(gameUrl) {
    /** @type {PromiseConnection} */
    var _conn;

    /** @type {GameRow} */
    var _game;

    return db().then(conn => {
      _conn = conn;
      return _conn.execute(sqlGameFromUrl, [gameUrl]);
    }).then(res => {
      _game = res[0][0];

      return _conn.execute(sqlGameGuidesFromId, [_game.id]);
    }).then(res => {
      var guides = res[0];
      _conn.release();

      return {
        game: _game,
        guides: guides
      };
    });
  }

  /**
   * 获取攻略所有章节。
   * @param gameUrl
   * @param guideUrl
   * @param chapterUrl
   * @returns {Promise.<object>}
   */
  static GetGuideFromUrl(gameUrl, guideUrl, chapterUrl) {
    /** @type {PromiseConnection} */
    var _conn;

    /** @type {GuideRow} */
    var _guide;

    /** @type {ChapterRow[]} */
    var _chapters;

    return db().then(conn => {
      _conn = conn;

      return _conn.execute(sqlGuideFromUrl, [gameUrl, guideUrl]);
    }).then(res => {
      _guide = res[0][0];
      if (!_guide) {
        _conn.release();
        throw new Error('Game/Guide Not Found.');
      }

      return _conn.execute(sqlChapterMetaFromGuideId, [_guide.guide_id]);
    }).then(res => {
      _chapters = res[0];

      if (_chapters.length == 0) {
        throw new Error('No chapters.');
      }

      var chapter = _.findWhere(_chapters, { url: chapterUrl }) || _chapters[0];
      chapter.active = true;

      return _conn.execute(sqlChapterFromChapterId, [chapter.chapter_id]);
    }).then(res => {
      /** @type {ChapterRow} */
      var chapter = res[0][0];

      return {
        chapter: chapter,
        chapters: _chapters,
        guide: _guide
      };
    });
  }

  /**
   * 获取某一个 Chapter 数据。
   * @param chapter_id
   * @returns {Promise.<ChapterRow>}
   * @constructor
   */
  static GetChapterFromId(chapter_id) {
    var _conn;
    return db().then(conn => {
      _conn = conn;
      return conn.execute(sqlChapterFromChapterId, [chapter_id]);
    }).then(res => {
      /** @type {ChapterRow} */
      var chapter = res[0][0];

      _conn.release();
      return chapter;
    });
  }

  static CreateHomeFeed() {
    var _conn;
    return db().then(conn => {
      _conn = conn;

      return Promise.all([conn.query(sqlGameFeed), conn.query(sqlGuideFeed)]);
    }).then(res => {
      _conn.release();


      /** @type {GameFeedEntry[]} */
      var gameFeed = res[0][0];
      /** @type {GuideFeedEntry[]} */
      var guideFeed = res[1][0];

      return {
        games: gameFeed,
        guides: guideFeed
      };
    });
  }
}

module.exports = ModelGame;