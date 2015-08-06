'use strict';

var express = require('express'),
	passport = require('passport'),
	auth = require('../auth.service'),
	router = express.Router();

router
	.get('/', passport.authenticate('nus-openid', {
		failureRedirect: '/signup', // this is an absolute path
		session: false
	}))

	.get('/return', passport.authenticate('nus-openid', {
		failureRedirect: '/signup',
		session: false
	}), auth.setTokenCookie);

module.exports = router;