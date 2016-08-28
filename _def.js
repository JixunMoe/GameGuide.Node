
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

/** @typedef {{
* chapters: ChapterRow[],
* guide: GuideRow
* }} GuideEditMeta */



/** @var {UserRow} session.user */
/** @var {string} req.session.user.user_id */

/** @var {string} req.params.game */
/** @var {string} req.params.guide */
/** @var {string} req.params.chapter */
/** @var {string} req.params.chapters */

/** @var {string} req.body.mail */
/** @var {string} req.body.passwd */
/** @var {string} req.body._csrf */

/** @var {UserRow} res.session.user */
/** @var {UserRow} res.session._csrfToken */

/** @var {GuideRow} guide */
/** @var {ChapterRow[]} chapters */