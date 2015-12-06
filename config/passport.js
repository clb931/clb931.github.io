var LocalStrategy	= require("passport-local").Strategy,
	User			= require("../app/models/user");

module.exports = function(passport, session) {
	passport.serializeUser(function(user, done) {
		done(null, {
			id:		user.id,
			email:	user.local.email,
		});
	});

	passport.deserializeUser(function(obj, done) {
		User.findById(obj.id, function(err, user) {
			done(err, user);
		});
	});

	// ======= Signup =======
	passport.use("local-signup",
		new LocalStrategy({
				usernameField:		"email",
				passwordField:		"password",
				passReqToCallback:	true,
			},
			function(req, email, password, done) {
				process.nextTick(function() {
					User.findOne({ "local.email": email }, function(err, user) {
						if (err) {
							return done(err);
						} else if (user) {
							return done(null, false, req.flash("signupMessage", "Email already in use."));
						} else {
							var newUser = new User();
							newUser.local.email = email;
							newUser.local.password = newUser.generateHash(password);
							newUser.save(function(err) {
								if (err)
									throw err;
								return done(null, newUser);
							});
						}
					});
				});
			}
		)
	);

	// ======= Login =======
	passport.use("local-login",
		new LocalStrategy({
				usernameField:		"email",
				passwordField:		"password",
				passReqToCallback:	true, 
			},
			function(req, email, password, done) {
				User.findOne({ "local.email": email }, function(err, user) {
					if (err)
						return done(err);
					else if (!user || !user.validPassword(password))
						return done(null, false, req.flash("loginMessage", "Invalid username or password!"));

					return done(null, user);
				});
			}
		)
	);
};