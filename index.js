var express			= require("express"),
	app				= express(),
	http			= require("http").Server(app),
	io				= require("socket.io")(http);


var port = 80,
	clients = {},
	user_count = 0,
	connection_count = 0;

app.configure(function() {
	app.use(express.static("public"));
});

io.on("connection", function(socket) {
	connection_count++;
	console.log("%s connected!", socket.id);
	console.log("Connections:", connection_count);
	
	socket.on("login", function(obj) {
		var result = 0;
		if (clients[obj.username] != null)
			result = 1;

		socket.emit("loggin", {
			to: obj.username,
			result: result
		});

		if (result == 0) {
			socket.username = obj.username;
			clients[socket.username] = socket;
			user_count++;
			console.log("User logged in as \'%s\'!", socket.username);
			console.log("Users:", user_count);

			socket.broadcast.emit("chat obj", {
				from: "server",
				to: "everyone",
				type: "msg",
				mod: "info",
				msg: "User \'" + socket.username + "\'" + " Connected!"
			});
		}
	});

	socket.on("logout", function(obj) {
		if (socket.username) {
			console.log("User \'%s\' logged out!", socket.username);
			socket.broadcast.emit("chat obj", {
				from: "server",
				to: "everyone",
				type: "msg",
				mod: "warning",
				msg: "User \'" + socket.username + "\'" + " disconnected!"
			});

			delete clients[socket.username];
			user_count--;
			console.log("Users:", user_count);
		}		
	});

	socket.on("chat obj", function(obj) {
		if (obj.to != "everyone") {
			if (clients[obj.to])
				clients[obj.to].emit("chat obj", obj);
			else
				socket.emit("chat obj", {
					from: "server",
					to: obj.from,
					type: "msg",
					mod: "err",
					msg: "User \'" + obj.to + "\' is not connected."
				});
		} else {
			socket.broadcast.emit("chat obj", obj);
		}
	});

	socket.on("disconnect", function() {
		if (socket.username) {
			console.log("User \'%s\' logged out!", socket.username);
			delete clients[socket.username];
			user_count--;
			console.log("Users:", user_count);
		}
		
		connection_count--;
		console.log("%s disconnected!", socket.id);
		console.log("Connections:", connection_count);
	});
});

http.listen(port, "0.0.0.0", function () {
	console.log("TabletopServer listening at %s", JSON.stringify(http.address()));
});