module.exports = function(app, passport) {
	// Home Page
	app.get("/", function(req, res) {
		res.render("index.ejs");
	});

	// Contact Page
	app.get("/contact", function(req, res) {
		res.render("contact.ejs");
	});

	// Game Page
	app.get("/game", isLoggedIn, function(req, res) {
		res.render("game.ejs", {
			user: req.user
		});
	});

	// Hex Page
	app.get("/hex", function(req, res) {
		res.render("hex.ejs");
	});

	// Test Page
	app.get("/test", function(req, res) {
		res.render("test.ejs");
	});

	// Login Page
	app.post("/login", passport.authenticate("local-login", {
		successRedirect:	"/game",
		failureRedirect:	"/login",
		failureFlash:		true,
	}));
	app.get("/login", function(req, res) {
		res.render("login.ejs", { message: req.flash("loginMessage") });
	});

	// Signup Page
	app.post("/signup", passport.authenticate("local-signup", {
		successRedirect:	"/game",
		failureRedirect:	"/signup",
		failureFlash:		true,
	}));
	app.get("/signup", function(req, res) {
		res.render("signup.ejs", { message: req.flash("signupMessage") });
	});

	// Profile Page
	app.get("/profile", isLoggedIn, function(req, res) {
		res.render("profile.ejs", {
			user: req.user
		});
	});

	// Logout Redirect
	app.get("/logout", function(req, res) {
		req.logout();
		res.redirect("/");
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect("/login");
}