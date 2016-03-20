var express			= require("express"),
	app				= express(),
	http			= require("http").Server(app),
	io				= require("socket.io")(http),
	mongoose		= require("mongoose"),
	configDB		= require("./config/database.js"),
	morgan			= require("morgan"),
	cookieParser	= require("cookie-parser"),
	bodyParser		= require("body-parser"),
	session			= require("express-session"),
	passport		= require("passport"),
	flash			= require("connect-flash"),
	mongoStore		= require("connect-mongo")(session),
	clc				= require("cli-color");

var port			= process.env.PORT || 80,
	error			= clc.red.bold,
	warn			= clc.yellow,
	info			= clc.greenBright,
	notice			= clc.cyanBright,
	session;


// ==================== Configure ====================
mongoose.connect(configDB.url);
require("./config/passport")(passport);
require("./config/io")(io);

app.use(express.static("public"));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

var sessionMiddleware = session({
	secret: 			"axaFih1biQvNAArJ8rNrHF60heuemIHk",
	name:				"game.session",
	resave:				true,
	saveUninitialized:	true,
	store:				new mongoStore({
		mongooseConnection: mongoose.connection,
		clear_interval: 60,
	}),
})
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

io.use(function(socket, next) {
	sessionMiddleware(socket.request, {}, next);
});

// ====================== Route ======================
require("./app/routes.js")(app, passport);

// ===================== Launch ======================
http.listen(port, "0.0.0.0", function () {
	console.log(info("TabletopServer listening at", port));
});