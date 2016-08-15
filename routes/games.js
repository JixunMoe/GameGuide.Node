/**
 * Created by Jixun on 15/08/2016.
 */
var express = require('express');
var router = express.Router();

const GuideController = require('../controllers/guide');
router.get('/api/chapter/:chapter', GuideController.GetChapterAjax);

router.get('/:game', GuideController.RenderGame);
router.get('/:game/:guide', GuideController.RenderGuide);
router.get('/:game/:guide/:chapter', GuideController.RenderGuide);

module.exports = router;