'use strict';

var express = require('express'),
	controller = require('./room.controller'),
	router = express.Router();

router.post('/', controller.join);
router.post('/send', controller.send);
router.get('/:userId/history', controller.getHistory);
router.get('/:roomId', controller.show);

module.exports = router;