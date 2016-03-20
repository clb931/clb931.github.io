var clc = require("cli-color"),
	fs	= require("fs");

var connections			= {},
	players				= {},
	error				= clc.red.bold,
	warn				= clc.yellowBright,
	info				= clc.greenBright,
	notice				= clc.cyanBright;

module.exports = function(io) {
	io.on("connection", function(socket) {
		var user = socket.request.session.passport.user;
		console.log(notice(user.email, "connected."));
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
				var msgs = String(data).split("\n");
				for (var i = 0; i < msgs.length - 1; ++i)
					socket.emit("msg-obj-s2c", JSON.parse(msgs[i]));
			}
		});

		var journal = String(fs.readFileSync("public/res/user/"+user.email+"/journal.md"));
		var macros = JSON.parse(
			fs.readFileSync("public/res/user/"+user.email+"/macros.json")
		);

		socket.emit("user-load-s2c", {
			journal:	journal,
			macros:		macros,
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
					if (err) console.log(error(err));
					else console.log(info("Chat log updated!"));
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
		
		socket.on("user-save-journal", function(packet) {
			fs.stat("public/res/user/"+user.email, function(err, stats) {
				if (err) {					
					fs.mkdir("public/res/user/"+user.email, function(err) {
						if (err) console.log(error(err));
						else console.log(info("Created directory public/res/user/" + user.email));
					});

					return;
				}

				fs.writeFile("public/res/user/"+user.email+"/journal.md", packet, function(err) {
					if (err) console.log(error(err));
					else console.log(notice(user.email, "journal saved."));
				});
			});
		});
		
		socket.on("user-save-macro", function(packet) {
			fs.readFile("public/res/user/"+user.email+"/macros.json", function(err, data) {
				var json = {};
				if (err) {
					if (!packet.remove)
						json[packet.name] = packet.value;

					fs.writeFile("public/res/user/"+user.email+"/macros.json", JSON.stringify(json), function(err) {
						if (err) console.log(error(err));
						else console.log(info(user.email, "macros saved."));
					});

					return console.log(error(err));
				}

				json = JSON.parse(data);
				if (!packet.remove) json[packet.name] = packet.value;
				else delete json[packet.name];

				fs.writeFile("public/res/user/"+user.email+"/macros.json", JSON.stringify(json), function(err) {
					if (err) console.log(error(err));
					else console.log(notice(user.email, "macros saved."));
				});
			});
		});

		socket.on("disconnect", function() {
			delete connections[user.id];
			delete players[user.id];
			console.log(warn(user.email, "disconnected."));
			socket.broadcast.emit("user-disconnect-s2c", user.id);
		});
	});
};