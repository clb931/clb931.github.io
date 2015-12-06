var clc = require("cli-color"),
	fs	= require("fs");

var connections			= {},
	players				= {},
	error				= clc.red.bold,
	warn				= clc.yellow,
	info				= clc.greenBright,
	notice				= clc.cyanBright;

module.exports = function(io) {
	io.on("connection", function(socket) {
		var user = socket.request.session.passport.user;
		console.log(info(user.email, "connected."));
		players[user.id] = user.email;
		socket.emit("user-loggin-s2c", {
			user_id:	user.id,
			email:		user.email,
			players: 	players,
		});

		connections[user.id] = socket;
		socket.broadcast.emit("user-connect-s2c", {
			user_id:	user.id,
			email:		user.email
		});

		fs.readFile("public/res/game/chat_log.json", function(err, data) {
			if (err) {
				return console.log(error(err));
			} else {
				console.log(notice("Chat log:\n")+data);
				var msgs = String(data).split("\n");
				for (var i = 0; i < msgs.length - 1; ++i) {
					console.log(info(msgs[i]));
					socket.emit("msg-obj-s2c", JSON.parse(msgs[i]));
				}
			}
		});
		
		socket.on("msg-obj-c2s", function(packet) {
			var msg = {
				from:	user.id,
				obj:	packet.obj,
			};

			socket.broadcast.emit("msg-obj-s2c", msg);

			fs.appendFile("public/res/game/chat_log.json",
				JSON.stringify(msg) + "\n",
				function(err) {
					if (err) {
						return console.log(error(err));
					} else {
						console.log(notice("Chat log updated!"));
					}
				}
			);
		});
		
		socket.on("pm-obj-c2s", function(packet) {
			client = connections[packet.to];
			if (client != null) {
				client.emit("pm-obj-s2c", {
					from:	user.id,
					obj:	packet.obj,
				});
			}
		});

		socket.on("disconnect", function() {
			delete connections[user.id];
			delete players[user.id];
			console.log(warn(user.email, "disconnected."));
			socket.broadcast.emit("user-disconnect-s2c", user.id);
		});
	});
};