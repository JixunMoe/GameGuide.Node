var express = require('express');
var router = express.Router();

var userController = require('../controllers/user');

router.get('/', userController.home);
router.all('/login', userController.login);
router.all('/register', userController.register);
router.get('/activate/:uid/:token', userController.activate);
router.all('/reset', userController.resetPassword);
router.get('/logout', userController.logout);
router.get('/:user', userController.getUser);

module.exports = router;
