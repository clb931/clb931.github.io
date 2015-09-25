var window_w = 0;
var window_h = 0;

function Init()
{
	$(window).resize();
	$("#frame").resize();
	console.log("Initialized");

	Main();
}

function Main()
{
	var $panzoom = $("#map").panzoom({
		minScale: 0.9,
		maxScale: 10
	});

	$panzoom.parent().on("mousewheel.focal", function(e) {
		e.preventDefault();
		var delta = e.delta || e.originalEvent.wheelDelta;
		var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
		$panzoom.panzoom("zoom", zoomOut, {
			incriment: 0.1,
			animate: false,
			focal: e
		});
	});

	$("#chat_send").on("click", SendChat);
	$("#chat_msg").on("keypress", SendChat);
}

function SendChat(e)
{
	e = e || event;
	if (e.type == "keypress" &&
		(e.which != 13 || e.shiftKey)) {
		return;
	}

	e.preventDefault();

	msg = $("#chat_msg").val();
	$("#chat_msg").val("");
	if (msg == "")
		return;

	if (msg[0] == "/") {
		ProcessCmd(msg);
		return;
	}

	var div = document.createElement("div");
	div.className = "msg";
	div.innerHTML = msg;

	SendMsg(div);
}

function SendMsg(div)
{
	document.getElementById("chat_log").appendChild(div);
	document.getElementById("chat_log").scrollTop = document.getElementById("chat_log").scrollHeight;
}

function ProcessCmd(cmd)
{
	cmd = cmd.slice(1);

	switch(cmd[0]) {
		case '/':
			SendChat(cmd);
			break;
		case 'r':
			SendMsg(ParseRoll(cmd));
			break;
		case 'm':
			SendMsg("msg");
			break;
		case 't':
			SendMsg("reply");
			break;
		default:
			SendMsg("ERROR: Unknown command!");
			break;
	}
}

function ParseRoll(cmd)
{
	var roll = cmd.slice(1);
	roll = roll.match(/\b\d\d?d\d\d?\b/);
	if (roll == null){
		var err_div = document.createElement("div");
		err_div.className = "msg err";
		err_div.innerHTML = "ERROR: Could not parse roll command!<br>CMD: /" + cmd;
		return err_div;
	}

	roll = roll[0].replace('d', ' ');
	var count = parseInt(roll);

	do {
		roll = roll.slice(1);
	} while (roll[0] != ' ');

	var sides = parseInt(roll);
	var dice = Roll(count, sides);

	var msg_div = document.createElement("div");
	msg_div.className = "msg";

	var roll_div = document.createElement("div");
	roll_div.className = "roll";
	msg_div.appendChild(roll_div);

	var div = document.createElement("div");
	div.className = "die " + GetDieCrit(dice[0], sides);
	div.innerHTML = dice[0];
	roll_div.appendChild(div);

	var total = dice[0];
	for (var i = 1; i < dice.length; ++i) {
		roll_div.innerHTML += "+";
		div = document.createElement("div");
		div.className = "die " + GetDieCrit(dice[i], sides);
		div.innerHTML = dice[i];
		roll_div.appendChild(div);

		total += dice[i];
	}

	div = document.createElement("div");
	div.className = "die " + GetRollCrit(dice, sides);
	div.innerHTML = total;
	roll_div.innerHTML += "=";
	roll_div.appendChild(div);

	return msg_div;
}

function GetDieCrit(die, sides)
{
	switch (die) {
		case 1:
			return "fail";
		case sides:
			return "crit";
		default:
			return "";
	}
}

function GetRollCrit(roll, sides)
{
	var fail = false;
	var crit = false;
	for (var i = 0; i < roll.length; ++i) {
		if (roll[i] == 1)
			fail = true;
		else if (roll[i] == sides)
			crit = true;
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

function Roll(count, sides)
{
	var roll = [];

	for (var i = 0; i < count; ++i)
		roll.push(Math.floor((Math.random() * sides) + 1));

	return roll;
}

function ActivateTab(tabCtrl, tabId)
{
	var tabCtrl = document.getElementById(tabCtrl);
	var tab = document.getElementById(tabId);
	for (var i = 0; i < tabCtrl.childNodes.length; i++) {
		var node = tabCtrl.childNodes[i];
		if ($(node).hasClass("tab")) {
			if (node == tab) {
				$(node).addClass("actv");
			} else {
				$(node).removeClass("actv");
			}
		}
	}

	TabResize();
}

$(window).resize(function()
{
	if ($(window).width() == window_w && $(window).height() == window_h)
		return;

	window_w = $(window).width();
	window_h = $(window).height();

	$("#frame").height($(window).height() - $("#header").height());
	$(".left.half").height($("#frame").height() - 7);
	$(".left.half").width($("#frame").width() * 2 / 3);
	$(".right.half").width($("#frame").width() / 3 - 1);
	$(".right.half").offset({
		top:$("#header").height(),
		left:$(".left.half").width()
	});

	$("#frame").resize();
});

$("#frame").resize(function()
{
	$(".left.half").resizable({
		minWidth:$("#frame").width() / 3,
		maxWidth:$("#frame").width() * 2 / 3,
		minHeight:$("#frame").height(),
		maxHeight:$("#frame").height(),
		resize:function(event, ui){
			var w = $(document).width() - ui.size.width;
			$(".right.half").width(w - 1);
			$(".right.half").position({
				top:$("#header").height(),
				left:$(".left.half").width()
			});
		}
	});

	TabResize();
  	$("#map").panzoom('resetDimensions');
});

function TabResize()
{
	$(".actv.tab").height(
		$(".tabber").height() -
		$(".tab-hdr").height() -
		24);
}
