var socket,
	cmds,
	macros = {},
	macro_rows = {};

function InitGame()
{
	$(window).resize(function()
	{
		if ($(window).width() == window_w && $(window).height() == window_h)
			return;

		window_w = $(window).width();
		window_h = $(window).height();

		$("#frame").height($(window).height() - $("#header").height());
		$(".left.half").height($("#frame").height() - 7 - 32);
		$(".left.half").width($("#frame").width() * 2 / 3);
		$(".right.half").width($("#frame").width() / 3 - 1);
		$(".right.half").offset({
			top:$("#header").height(),
			left:$(".left.half").width() + 8
		});

		$("#frame").resize();
	});

	$("#frame").resize(function()
	{
		$(".left.half").resizable({
			minWidth:$("#frame").width() / 3,
			maxWidth:$("#frame").width() * 2 / 3,
			minHeight:$("#frame").height() - 7 - 32,
			maxHeight:$("#frame").height() - 7 - 32,
			resize:function(event, ui){
				var w = $(document).width() - ui.size.width;
				$(".right.half").width(w - 8);
				$(".right.half").height($(".left.half").height());
				$(".right.half").position({
					top:$("#header").height(),
					left:$(".left.half").width()
				});
			}
		});

		TabResize();
	  	$("#map").panzoom('resetDimensions');
	});

	Init();

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

	socket = io();
	cmds = _$("#chat").TableChatElement({
		socket: socket,
	});

	_$("#journal").RichTextElement({
		onSave: OnJournalSave,
		socket: socket,
	});

	_$("#macro_save_btn").on("click", function(evt) {
		var name = _$("#macro_edit_name");
		var editor = _$("#macro_editor");

		if (name.value() == "")
			return;

		AddMacro(name.value(), editor.value());
		socket.emit("user-save-macro", { 
			name:	name.value(),
			value:	macros[name.value()],
			remove:	false,
		});

		name.value("");
		editor.value("");
	});

	socket.on("user-load-s2c", function(packet) {
		console.log("Loading journal.");
		var journal = _$("#journal");
		journal.select("textarea").value(packet.journal);
		journal.select("button", 1).fire("click");
		console.log("Loading macros.");
		for (key in packet.macros)
			if (packet.macros.hasOwnProperty(key))
				AddMacro(key, packet.macros[key]);
	});
}

function AddMacro(name, value) {
		if (macros.hasOwnProperty(name)) {
			macros[name] = value;
			return;
		}

		macros[name] = value;
		var edit_btn = cmf.create("button")
			.text("Edit")
			.on("click", function(evt) {
				_$("#macro_edit_name").value(name);
				_$("#macro_editor").value(macros[name]);
			});
		var rm_btn = cmf.create("button")
			.text("Remove")
			.on("click", function(evt) {
				socket.emit("user-save-macro", { 
					name:	name,
					value:	macros[name],
					remove:	true,
				});
				macro_rows[name].remove();
				delete macro_rows[name];
				delete macros[name];
			});
		var exe_btn = cmf.create("button")
			.text("Execute")
			.on("click", function(evt) {
				cmds["batch"].action(macros[name]);
			});
		var col1 = cmf.create("td")
			.text(name);
		var col2 = cmf.create("td")
			.append(edit_btn);
		var col3 = cmf.create("td")
			.append(rm_btn);
		var col4 = cmf.create("td")
			.append(exe_btn);
		macro_rows[name] = cmf.create("tr")
			.append(col1)
			.append(col2)
			.append(col3)
			.append(col4);
		_$("#macro_list").append(macro_rows[name]);
}

function OnJournalSave(evt) {
	socket.emit("user-save-journal", 
		_$("#journal").select("textarea").value());
}

function ActivateTab(tabCtrl, tabId)
{
	var tabCtrl = document.getElementById(tabCtrl);
	var tab = document.getElementById(tabId);
	for (var i = 0; i < tabCtrl.childNodes.length; i++) {
		var node = tabCtrl.childNodes[i];
		if ($(node).hasClass("tab")) {
			if (node == tab)
				$(node).addClass("actv");
			else
				$(node).removeClass("actv");
		}
	}

	TabResize();
}

function TabResize()
{
	$(".actv.tab").height(
		$(".tabber").height() -
		$(".tab-hdr").height() -
		24);
}