(function(_$) {
	_$.fn.TableChatElement = function(options) {
		var settings = _$.extend({

		}, options);
		
		var user = {
				id:		"",
				alias:	"",
				name:	"",
			},
			pm_info = {
				id:		"",
				alias:	"",
			},
			players = {},
			connected = false,
			socket = io();

		this.addClass(".cmf_chat");

		var chat_log = _$.create("div", {
			className: "cmf_chat_log",
		});
		this.append(chat_log);
		var chat_msg = _$.create("textarea", {
			className: "cmf_chat_msg",
		});
		this.append(chat_msg);
		var send_btn = _$.create("button", {
			className: "cmf_btn",
			text: "Send",
		});
		this.append(send_btn);

		send_btn.on("click", SendChat);
		chat_msg.on("keypress", SendChat);
		
		socket.on("connect", function() {
			connected = true;
		});

		socket.on("user-loggin-s2c", function(packet) {
			user.id = packet.user_id;
			user.alias = user.name = packet.email;
			players = packet.players;
			DisplayInfo("Welcome " + user.name + "!");
		});

		socket.on("user-connect-s2c", function(packet) {
			players[packet.user_id] = packet.email;
			DisplayInfo(players[packet.user_id] + " connected!");
		});

		socket.on("msg-obj-s2c", function(packet) {
			if (packet.from != "server") {
				Display(CreateMessageDiv(
					"<b>" + packet.obj.as + ":</b><br>" + packet.obj.msg,
					packet.obj.mod,
					packet.obj.type
				));						
			} else {
				Display(CreateMessageDiv(
					packet.obj.msg,
					packet.obj.mod, 
					packet.obj.type
				));
			}
		});

		socket.on("pm-obj-s2c", function(packet) {
			pm_info.id = packet.from;
			pm_info.alias = packet.obj.as;

			Display(CreateMessageDiv(
				"<b>" + packet.obj.as + ":</b><br>" + packet.obj.msg,
				packet.obj.mod,
				packet.obj.type
			));
		});

		socket.on("user-disconnect-s2c", function(user_id) {
			DisplayWarning(players[user_id] + " disconnected!");
			delete players[user_id];
		});

		socket.on("disconnect", function() {
			DisplayError("Disconnected from server.");
			user.id = user.alias = user.name = "";
			pm_info.id = pm_info.alias = "";
			connected = false;
		});

		ProcessCmd("help");

		function ParseMessage(msg) {
			var div = _$.create("div");

			var spl = msg.split(/\s*(\#\(\d+d\d+.*\))\s*/);
			for (var i = 0; i < spl.length; ++i) {
				var match = spl[i].match(/\#\((\d+d\d+.*)\)/);
				if (match != null) {
					div.append(CreateRollDiv(ComplexRoll(match[1])));
				} else {
					div.html(div.html() + spl[i]);
				}
			}

			return div;
		}

		function ConstructMessage(msg, mod, type) {
			return {
				as: user.alias,
				type: type,
				mode: mod,
				msg: msg,
			}
		}

		function Broadcast(str, mod, type) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}

			type = type || "text";
			mod = mod || "";

			var msg_div = CreateMessageDiv("", mod, type)
				.append(ParseMessage(str));

			socket.emit("msg-obj-c2s", {
				to:		"everyone",
				obj:	ConstructMessage(msg_div.html(), mod, type),
			});

			Display(msg_div.html(
				"<b>" + user.alias + ":</b><br>" +
				msg_div.html()));
		}

		function BroadcastRoll(str) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}

			var msg_div = CreateMessageDiv("", "roll")
				.append(CreateRollDiv(ComplexRoll(str)));

			socket.emit("msg-obj-c2s", {
				to:		"everyone",
				obj:	ConstructMessage(msg_div.html(), "roll"),
			});

			Display(msg_div.html(
				"<b>" + user.alias + ":</b><br>" +
				"Rolling " + str + "...<br>" +
				msg_div.html()));
		}

		function BroadcastTemplate(msg) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}

			var msg_div = CreateTemplateDiv(msg);
			// Display(msg_div, "roll");

			socket.emit("msg-obj-c2s", {
				to:		"everyone",
				obj:	ConstructMessage(msg_div.html(), "roll"),
			});

			Display(msg_div.html(
				"<b>" + user.alias + ":</b><br>" +
				msg_div.html()));
		}

		function Tell(to_user, str) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}
			
			var user_id = null;
			for (var key in players)
				if (players.hasOwnProperty(key))
					if (players[key] == to_user)
						user_id = key;

			if (user_id == null) {
				DisplayWarning("User \'" + to_user + "\' is not connected.");
				return;
			} else {
				var msg_div = CreateMessageDiv("", "tell")
					.append(ParseMessage(str));

				socket.emit("pm-obj-c2s", {
					to: 	user_id,
					obj:	ConstructMessage(msg_div.html(), "tell"),
				});

				Display(msg_div.html("<b>To " + to_user + ":</b><br>" + msg_div.html()));
			}
		}

		function Reply(msg) {			
			Tell(pm_info.alias, msg);
		}

		function SendChat(e)
		{
			e = e || event;
			if (e.type == "keypress" &&
				(e.which != 13 || e.shiftKey)) {
				return;
			}

			e.preventDefault();

			msg = chat_msg.value();
			chat_msg.value("");
			if (msg == "")
				return;

			if (msg[0] == '/')
				ProcessCmd(msg.slice(1));
			else
				Broadcast(msg, "text");
		}

		function ProcessCmd(msg)
		{
			var args = msg.split(' ');
			var cmd = args[0];
			args.shift();

			if (cmd[0] == '/') {
				Broadcast(msg, "text");
				return;
			}

			switch(cmd) {
				case 'ro':
				case "roll":
					BroadcastRoll(args.join(' '));
					break;
				case "template":
					BroadcastTemplate(args.join(' '));
					break;
				case 'c':
				case "calc":
					var msg = args.join(' ');
					Broadcast(msg + " = " + cmf.MathParser(msg), "roll");
					break;
				case 't':
				case "tell":
					Tell(args.shift(), args.join(' '));
					break;
				case "r":
				case "reply":
					Reply(args.join(' '));
					break;
				case "clear":
					chat_log.html("");
					break;
				case 'u':
				case "user":
					DisplayUsername();
					break;
				case 'h':
				case "help":
					DisplayInfo(
						"Type \'/ro(ll) $xd$y\' to roll $x number of dice with $y number of sided dice.<br>" +
						"Or Type \'#($expression)\', where $expression follows the roll syntax, anywhere in char.<br>" +
						"Type \'/template {\"title\":\"title_value\",\"key\":\"key_value\"} \' to display a templated roll.<br>" +
						"Type \'/c(alc) $expression\', where $expression is a mathmatical expression, to do simple calculations.<br>" +
						"Type \'/t(ell) $username $message\' to send a PM to $username.<br>" +
						"Type \'/r(eply) $message\' to reply to the last user you received a PM from.<br>" +
						"Type \'/u(ser)\' to display your username.<br>" +
						"Type \'/clear\' to clear the chat log.<br>" +
						"Type \'/h(elp)\' to display this message again.<br>"
					);
					break;
				default:
					DisplayError(
						"ERROR:<br>" +
						"Unknown command: \"" + cmd + "\"<br>" +
						"Original command: \"/" + msg + "\""
					);
					break;
			}
		}

		function GetDieCritical(roll, sides) {
			switch (roll) {
				case 1:
					return "fail";
				case sides:
					return "crit";
				default:
					return "";
			}
		}

		function GetRollCritical(rolls, sides) {
			var fail = false;
			var crit = false;
			for (var i = 0; i < rolls.length; ++i) {
				if (rolls[i].value == sides)
					crit = true;
				else if (rolls[i].value == 1)
					fail = true;
			}

			if (fail == true) {
				if (crit == true)
					return "both"

				return "fail";
			} else if (crit == true) {
				return "crit";
			}

			return "";
		}

		function Die(sides) {
			var value = Math.floor((Math.random() * sides) + 1);
			return {
				total: value,
				modifier: GetDieCritical(value, sides),
			}
		}

		function Roll(count, sides) {
			var roll = {
				dice: [],
				total: 0,
				sides: sides,
				modifier: "",
				tooltip: _$.create("span"),
			};

			for (var i = 0; i < count; ++i) {
				roll.dice.push(Die(sides));
				roll.total += roll.dice[i].total;

				if (i != 0) roll.tooltip.html(roll.tooltip.html() + "+");
				roll.tooltip.append(CreateDieDiv(roll.dice[i]));
			}

			roll.modifier = GetRollCritical(roll.dice, roll.sides);

			return roll;
		}

		function ComplexRoll(msg) {
			var complex_roll = {
				total: 0,
				modifier: "",
				tooltip: _$.create("span"),
			};

			var words = msg.split(/(\d+d\d+|\+|\-|\*|\/|\(|\)|\d+|[A-Za-z_][\w]*)/);
			for (var i = 0; i < words.length; ++i) {
				var m = words[i].match(/(\d+)d(\d+)/);
				if (m != null) {
					var roll = Roll(m[1], m[2]);
					words[i] = roll.total;
					complex_roll.tooltip.append(CreateMessageDiv(roll.total, GetRollCritical(roll), "die"));
				} else {
					complex_roll.tooltip.html(complex_roll.tooltip.html() + words[i]);
				}
			}
			
			complex_roll.total = Math.floor(cmf.MathParser(words.join('')));
			if (isNaN(complex_roll.total)) {
				DisplayError("Error: Could not parse string<br>"+msg);
				return null;
			}

			return complex_roll;			
		}

		function CreateMessageDiv(html, modifier, type) {
			type = type || "text";
			modifier = modifier || "";

			var div = _$.create("div", {
				class: type + " " + modifier,
			}).html(html);

			return div;
		}

		function CreateDieDiv(die) {
			return CreateMessageDiv(die.total, die.modifier, "die");
		}

		function CreateRollDiv(roll) {
			return CreateDieDiv(roll).append(roll.tooltip).addClass("cmf_tooltip");
		}

		// function CreateComplexRollDiv(roll) {
		// 	var div = CreateMessageDiv("Rolling...<br>", "roll")
		// 		.append(CreateRollDiv(roll));

		// 	return div;
		// }

		function CreateTemplateDiv(str) {
			var div = CreateMessageDiv("", "roll");

			var json = _$.extend({
				style: {},
				title: " ",
			}, JSON.parse(str));

			json.style = _$.extend({
				title_fg: "white",
				title_bg: "black",
				fg: "black",
				bg: "white",
				bg2: "#E5E4E2"
			}, json.title);

			var tt = document.querySelector("#cmf_table_t");
			var table = _$.get(document.importNode(tt.content, true));
			var caption = table.select("caption").text(json.title)
				.fg(json.style.title_fg).bg(json.style.title_bg);
			var body = table.select("tbody").bd(json.style.title_bg);

			var alt = false;
			var tr = document.querySelector("#cmf_row_t");
			for (key in json) {
				if (json.hasOwnProperty(key)) {
					if (key == "title" || key == "style")
						continue;
					var row = _$.get(document.importNode(tr.content, true));
					alt = !alt;
					var bg = alt ? json.style.bg : json.style.bg2;
					var val_div = ParseMessage(json[key]);
					row.select("#c1").text(key)
						.fg(json.style.fg).bg(bg);
					row.select("#c2").append(val_div)
						.fg(json.style.fg).bg(bg);
					body.append(row);
				}
			}
			div.append(table);

			return div;
		}

		function Display(div) {
			chat_log.append(div);
			chat_log.html(chat_log.html() + "<br>");
			chat_log[0].scrollTop = chat_log[0].scrollHeight;
		}

		// function DisplayMessage(html, mod) {
		// 	mod = mod || "";
		// 	Display(CreateMessageDiv(html, mod));
		// }

		function DisplayInfo(msg) {
			var div = CreateMessageDiv(msg, "info");
			Display(div);
		}

		function DisplayWarning(msg) {
			var div = CreateMessageDiv(msg, "warning");
			Display(div);
		}
		
		function DisplayError(msg) {
			var div = CreateMessageDiv(msg, "err");
			Display(div);
		}

		function DisplayUsername() {
			if (!connected)
				DisplayWarning("You are not connected to the server.");
			else
				DisplayInfo("Logged in as \'" + user.name + "\'");
		}

		return this;
	}
}(cmf));