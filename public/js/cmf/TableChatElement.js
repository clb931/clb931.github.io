(function(_$) {
	_$.fn.TableChatElement = function(options) {
		var settings = _$.extend({
			socket: null,
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
			socket = settings.socket || io();

		var commands = {
			"calc": {
				action: function(args) {
					var msg = args.join(' ');
					Broadcast(msg + " = " + cmf.MathParser(msg), "cmf-tce-roll");
				},
				description:	"/calc $exp<br>"+
								"  Calculates the results of a<br>"+
								"  mathmatical expression.<br>",
				help_text:		"$exp - A mathmatical expression<br>"+
								"  to performe.<br>"+
								"Example:<br>"+
								"  /calc ((2 + 2) * 5) / 3<br>"+
								"Note:<br>"+
								"  Does not support math with<br>"+
								"  floating point numbers. This<br>"+
								"  means any number containing a<br>"+
								"  decimal.",
			},
			"clear": {
				action: function(args) {
					chat_log.html("");
				},
				description:	"/clear<br>"+
								"  Clears the chat log.<br>",
				help_text:		"",
			},
			"batch": {
				action: function(args) {
					var batch_list = args.split(';');
					for (var i = 0; i < batch_list.length; ++i) {
						var cmd_args = batch_list[i].split(' ');
						var cmd = cmd_args.shift();
						while (cmd[0] == " " || cmd[0] == "\t" ||
							cmd[0] == "\n" || cmd[0] == "\/")
							cmd = cmd.slice(1);
						if (cmd.length != 0)
							commands[cmd].action(cmd_args);
					}
				},
				description:	"/batch $cmd1; $cmd2; ...<br>"+
								"  Executes a batch of \';\'<br>"+
								"  seperated commands<br>",
				help_text:		"$cmd#:<br>"+
								"  The command to be executed<br>"+
								"Example:<br>"+
								"  /batch /roll 2d6; /msg hello;<br>",
			},
			"help": {
				action: function(args) {
					DisplayHelp(args);
				},
				description:	"/help $cmd<br>"+
								"  Displays the help text for<br>"+
								"  commands.<br>",
				help_text:		"$cmd:<br>"+
								"  The command to display the<br>"+
								"  help text of.<br>"+
								"Example:<br>"+
								"  /help template<br>"+
								"Note:<br>"+
								"  If $cmd is not given the<br>"+
								"  general help text is displayed<br>",
			},
			"msg": {
				action: function(args) {
					Broadcast(args.join(' '), "cmf-tce-text");
				},
				description:	"/msg $msg<br>"+
								"  Sends a message to all users.<br>",
				help_text:		"$msg:<br>"+
								"  The message to send.<br>"+
								"Example:<br>"+
								"  /msg Hello everyone!<br>"+
								"Note:<br>"+
								"  It is not necessary to type<br>"+
								"  /msg to send a message. This<br>"+
								"  command is only useful for<br>"+
								"  macros.",
			},
			"reply": {
				action: function(args) {
					Reply(args.join(' '));
				},
				description:	"/reply $msg<br>"+
								"  Replys to the last private<br>"+
								"  message you received.<br>",
				help_text:		"$msg:<br>"+
								"  The message to be sent.<br>"+
								"Example:<br>"+
								"  /reply Hi<br>",
			},
			"roll": {
				action: function(args) {
					BroadcastRoll(args.join(' '));
				},
				description:	"/roll $roll $exp<br>"+
								"  Rolls a variable number of<br>"+
								"  dice and performes simple math<br>"+
								"  on the result.<br>",
				help_text:		"$roll: The actual roll. Writen<br>"+
								"  as $Nd$S where $N is the<br>"+
								"  number of dice to roll and $S<br>"+
								"  is the number of sides each<br>"+
								"  dice has.<br>"+
								"$exp: A mathmatical expression<br>"+
								"  to performe on the dice roll.<br>"+
								"Example:<br>"+
								"  /roll 2d6 + 10<br>"+
								"Note:<br>"+
								"  A roll can also be written as<br>"+
								"  #(2d6 + 10)<br>"+
								"Note:<br>"+
								"  Does not support math with<br>"+
								"  floating point numbers. This<br>"+
								"  means any number containing a<br>"+
								"  decimal.",

			},
			"tell": {
				action: function(args) {
					Tell(args.shift(), args.join(' '));
				},
				description:	"/tell $user $msg<br>"+
								"  Sends a private message to a<br>"+
								"  user.<br>",
				help_text:		"$user: The user to send the<br>"+
								"  message to.<br>"+
								"$msg: The message to be sent.<br>"+
								"Example:<br>"+
								"  /tell John Hello<br>",
			},
			"template": {
				action: function(args) {
					BroadcastTemplate(args.join(' '));
				},
				description:	"/template $json<br>"+
								"  Displays a templated chat<br>"+
								"  message.<br>",
				help_text:		"$json: A json object containing<br>"+
								"  the content to display in the<br>"+
								"  template table fields.<br>"+
								"Example:<br>"+
								"  /template {<br>"+
								"    \"Skill\": \"Sneak\",<br>"+
								"    \"Roll\": \"#(2d6 + 2)\"<br>"+
								"  }<br>"+
								"Note:<br>"+
								"  You can type<br>"+
								"  \'/help template example\' to<br>"+
								"  display an example template<br>"+
								"  command. Or you can type<br>"+
								"  \'/help template title\' and<br>"+
								"  \'/help template style\' to find<br>"+
								"  out how to use these special<br>"+
								"  content fields.<br>",
				help_example:	"Example Template Command:<br>"+
								"  Copy and paste this example<br>"+
								"  template into the chat to try<br>"+
								"  it out.<br><br>"+
								"/template {<br>"+
								"  \"title\": \"Test Template\",<br>"+
								"  \"style\": {<br>"+
								"    \"title_fg\": \"#BBCD67\",<br>"+
								"    \"title_bg\": \"#445200\",<br>"+
								"    \"fg\": \"#E8F6A4\",<br>"+
								"    \"bg\": \"#91A437\",<br>"+
								"    \"bg2\": \"#697B15\"<br>"+
								"  },<br>"+
								"  \"Key\": \"Value\",<br>"+
								"  \"Skill\": \"Sneak\",<br>"+
								"  \"Roll\": \"#(2d6+2)\"<br>"+
								"}<br>",
				help_title:		"/template $json<br>"+
								"  Setting the template title<br>"+
								"  field will change the title<br>"+
								"  text that appears above the<br>"+
								"  chat template.<br>"+
								"Example:<br>"+
								"  /template {<br>"+
								"    \"title\": \"Skill Roll\"<br>"+
								"  }<br>",
				help_style:		"/template $json<br>"+
								"  Setting the template style<br>"+
								"  field will change the color<br>"+
								"  of the chat template.<br>"+
								"Example:<br>"+
								"  /template {<br>"+
								"    \"style\": {<br>"+
								"      \"title_fg\": \"$color\",<br>"+
								"      \"title_bg\": \"$color\",<br>"+
								"      \"fg\": \"$color\",<br>"+
								"      \"bg\": \"$color\",<br>"+
								"      \"bg2\": \"$color\",<br>"+
								"    }<br>"+
								"  }<br>"+
								"Note:<br>"+
								"  title_fg: Sets the title text<br>"+
								"    color.<br>"+
								"  title_bg: Sets the title<br>"+
								"    background color.<br>"+
								"  fg: Sets the text color.<br>"+
								"  bg: Sets the background color.<br>"+
								"  bg2: Sets the alternating<br>"+
								"    background color.<br>",
			},
			"user": {
				action: function(args) {
					DisplayUsername();
				},
				description:	"/user<br>"+
								"  Displays your current alias.<br>",
				help_text:		"",
			},
		};

		var chat_log = _$.create("div", {
			className: "cmf-chat-log",
		});
		this.append(chat_log);
		var chat_msg = _$.create("textarea", {
			className: "cmf-chat-msg",
		});
		this.append(chat_msg);
		var send_btn = _$.create("button", {
			className: "cmf-btn",
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
					packet.obj.type,
					packet.obj.mod
				));						
			} else {
				Display(CreateMessageDiv(
					packet.obj.msg,
					packet.obj.type,
					packet.obj.mod 
				));
			}
		});

		socket.on("pm-obj-s2c", function(packet) {
			pm_info.id = packet.from;
			pm_info.alias = packet.obj.as;

			Display(CreateMessageDiv(
				"<b>" + packet.obj.as + ":</b><br>" + packet.obj.msg,
				packet.obj.type,
				packet.obj.mod
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

		this.addClass(".cmf-chat");
		ProcessCmd("help");

		function ProcessCmd(msg)
		{
			var args = msg.split(' ');
			var cmd = args[0];
			args.shift();

			if (cmd[0] == '/') {
				Broadcast(msg, "cmf-tce-text");
				return;
			}

			var unknown_cmd = true;
			for (key in commands) {
				if (commands.hasOwnProperty(key)) {
					if (key == cmd) {
						commands[key].action(args);
						unknown_cmd = false;
					}
				}
			}
			if (unknown_cmd) {
				DisplayError(
					"Unknown command: \"" + cmd + "\"<br>" +
					"Original command: \"/" + msg + "\""
				);
			}
		}

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
				mod: mod,
				msg: msg,
			}
		}

		function Broadcast(str, mod, type) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}

			type = type || "cmf-tce-text";
			mod = mod || "";

			var msg_div = CreateMessageDiv("", type, mod)
				.append(ParseMessage(str));

			socket.emit("msg-obj-c2s", {
				to:		"everyone",
				obj:	ConstructMessage(msg_div.html(), mod, type),
			});

			Display(msg_div.html(
				"<b>" + user.alias + ":</b><br>" +
				msg_div.html()
			));
		}

		function BroadcastRoll(str) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}

			var msg_div = CreateMessageDiv("Rolling " + str + "...<br>", "cmf-tce-roll")
				.append(CreateRollDiv(ComplexRoll(str)));

			socket.emit("msg-obj-c2s", {
				to:		"everyone",
				obj:	ConstructMessage(msg_div.html(), "cmf-tce-roll"),
			});

			Display(msg_div.html(
				"<b>" + user.alias + ":</b><br>" +
				msg_div.html()
			));
		}

		function BroadcastTemplate(msg) {
			if (!connected) {
				DisplayWarning("You are not connected to the server.");
				return;
			}

			var msg_div = CreateTemplateDiv(msg);

			socket.emit("msg-obj-c2s", {
				to:		"everyone",
				obj:	ConstructMessage(msg_div.html(), "cmf-tce-roll"),
			});

			Display(msg_div.html(
				"<b>" + user.alias + ":</b><br>" +
				msg_div.html()
			));
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
				var msg_div = CreateMessageDiv("", "cmf-tce-tell")
					.append(ParseMessage(str));

				socket.emit("pm-obj-c2s", {
					to: 	user_id,
					obj:	ConstructMessage(msg_div.html(), "cmf-tce-tell"),
				});

				Display(msg_div.html(
					"<b>To " + to_user + ":</b><br>" +
					msg_div.html()
				));
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
				Broadcast(msg, "cmf-tce-text");
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
					complex_roll.tooltip.append(CreateMessageDiv(roll.total, "cmf-tce-die", GetRollCritical(roll)));
				} else {
					complex_roll.tooltip.html(complex_roll.tooltip.html() + words[i]);
				}
			}
			
			complex_roll.total = Math.floor(cmf.MathParser(words.join('')));
			if (isNaN(complex_roll.total)) {
				DisplayError("Could not parse string<br>"+msg);
				return null;
			}

			return complex_roll;			
		}

		function CreateMessageDiv(html, type, modifier) {
			type = type || "cmf-tce-text";
			modifier = modifier || "";

			var div = _$.create("div", {
				class: type + " " + modifier,
			}).html(html);

			return div;
		}

		function CreateDieDiv(die) {
			return CreateMessageDiv(die.total, "cmf-tce-die", die.modifier);
		}

		function CreateRollDiv(roll) {
			return CreateDieDiv(roll).append(roll.tooltip).addClass("cmf-tooltip");
		}

		function CreateTemplateDiv(str) {
			var div = CreateMessageDiv("", "cmf-tce-roll");

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
			}, json.style);

			var table = _$.create("table", {
				className:	"cmf-chat-template",
				align:		"center",
			});
			var caption = _$.create("caption").text(json.title)
				.fg(json.style.title_fg).bg(json.style.title_bg);
			var body = _$.create("tbody").bd(json.style.title_bg);

			var alt = false;
			for (key in json) {
				if (json.hasOwnProperty(key)) {
					if (key == "title" || key == "style")
						continue;
					var row = _$.create("tr");
					alt = !alt;
					var bg = alt ? json.style.bg : json.style.bg2;
					var val_div = ParseMessage(json[key]);
					var col1 = _$.create("td").text(key)
						.fg(json.style.fg).bg(bg);
					var col2 = _$.create("td").append(val_div)
						.fg(json.style.fg).bg(bg);
					row.append(col1).append(col2);
					body.append(row);
				}
			}
			table.append(caption).append(body);
			div.append(table);

			return div;
		}

		function Display(div) {
			chat_log.append(div);
			chat_log.html(chat_log.html() + "<br>");
			chat_log[0].scrollTop = chat_log[0].scrollHeight;
		}

		function DisplayInfo(msg) {
			var div = CreateMessageDiv(msg, "cmf-tce-text", "info");
			Display(div);
		}

		function DisplayWarning(msg) {
			var div = CreateMessageDiv(msg, "cmf-tce-text", "warning");
			Display(div);
		}
		
		function DisplayError(msg) {
			var div = CreateMessageDiv("<b>ERROR:</b><br>"+ msg, "cmf-tce-text", "err");
			Display(div);
		}

		function DisplayHelp(args) {
			var help_msg = "";
			if (args.length == 0) {
				for (key in commands) {
					if (commands.hasOwnProperty(key)) {
						help_msg += commands[key].description;
					}
				}
			} else if (args[0] == "template" && args.length > 1) {
				if (args[1] == "example") {
					help_msg += commands["template"].help_example;
				} else if (args[1] == "title") {
					help_msg += commands["template"].help_title;
				} else if (args[1] == "style") {
					help_msg += commands["template"].help_style;
				}
			} else {
				for (key in commands) {
					if (commands.hasOwnProperty(key)) {
						if (key == args[0]) {
							help_msg = commands[key].description;
							help_msg += commands[key].help_text;
						}
					}
				}
			}

			if (help_msg == "") {
				DisplayError("Unknown command " + args.join(' '));
			} else {
				DisplayInfo(help_msg);
			}
		}

		function DisplayUsername() {
			if (!connected)
				DisplayWarning("You are not connected to the server.");
			else
				DisplayInfo("Logged in as \'" + user.name + "\'");
		}

		return commands;
	}
}(cmf));