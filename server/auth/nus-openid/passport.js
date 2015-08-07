var passport = require('passport'),
	NusStrategy = require('passport-nus-openid').Strategy;

module.exports.setup = function(User, config) {
	passport.use(new NusStrategy({
		returnURL: config.nusOpenId.returnURL,
		realm: config.nusOpenId.realm,
		profile: true
	},
	function(identifier, profile, done){
		User.findOne({
			'nusOpenId': identifier
		},
		function (err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				user = new User({
					name: profile.displayName,
					email: profile.emails[0].value,
					role: 'user',
					provider: 'nus-openid',
					nusOpenId: identifier
				});
				user.save(function(err) {
					if (err) done(err);
					return done(null, user);
				});
			} else {
				return done(null, user);
			}
		});
	}
	));
};