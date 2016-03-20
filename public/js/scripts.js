var window_w = 0;
var window_h = 0;

function Init()
{
	_$("body").widget("frame");
	_$("#header").widget("header");

	$(window).resize();
	$("#frame").resize();
	
	console.log("Initialized");
}