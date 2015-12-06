function Init()
{
	$("body").widget({
		type: "frame"
	});

	$("#header").widget({
		type: "header"
	});

	$(".hSizer").widget({
		type: "sizer",
		orientation: "horizontal"
	});

	$(".vSizer").widget({
		type: "sizer",
		orientation: "vertical"
	});

	$(".hPane").widget({
		type: "pane",
		orientation: "horizontal"
	});

	$(".vPane").widget({
		type: "pane",
		orientation: "vertical"
	});
}
