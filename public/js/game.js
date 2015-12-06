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

	_$("#chat").TableChatElement();
	_$("#journal").RichTextElement();
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