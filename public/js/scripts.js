var window_w = 0;
var window_h = 0;

function Init()
{
	_$("body").widget({
		type: "frame"
	});
	
	_$("#header").widget({
		type: "header"
	});

	$(window).resize();
	$("#frame").resize();

	if (window.RollEngine)
		RollEngine.Init("chat_log");
	
	console.log("Initialized");
}