(function(_$) {
	_$.fn.widget = function(wclass, options) {
		switch (wclass) {
			case "sizer":
				MakeSizer(this);
				break;
			default:
				MakeWidget(this);
				break;
		}

		function MakeWidget(_this) {
			var settings = _$.extend({
				style: "def",
				orientation: null,
			}, options);

			_this.addClass("cmf-widget-"+wclass);
			_this.addClass("cmf-style-"+settings.style);
			if (settings.orientation != null)
				_this.addClass("cmf-orient-"+settings.orientation);			
		}

		function MakeSizer(_this) {
			var settings = _$.extend({
				align:			"before",
				fixed:			false,
				min_width:		100,
				min_height:		100,
				orientation:	"vertical",
				target:			null,
			}, options);

			switch (settings.orientation) {
				case "ew":
				case "east-west":
				case "horizontal":
					settings.orientation = "ew";
					break;
				case "ns":
				case "vertical":
				case "north-south":
				default:
					settings.orientation = "ns";
					break;
			}

			switch (settings.align) {
				default:
				case "pre":
				case "right":
				case "bottom":
				case "before":
					settings.align = "pre";
					break;
				case "top":
				case "post":
				case "left":
				case "after":
					settings.align = "post";
					break;
			}

			var size_bar = cmf.create("div", {
				className: "cmf-widget-sizer cmf-orient-"+
					settings.orientation,
			});
			if (settings.fixed)
				size_bar.addClass("cmf-fixed");

			size_bar.on("mousedown", function(evt) { evt.preventDefault(); });
			
			if (settings.orientation == "ew") {
				size_bar.on("mousedrag", function(evt) {
					var parent = _this.parent();
					var children = parent.children();
					
					var target = _$.init(settings.target);
					var target_parent = target.parent();
					var target_children = target.children();

					if (parent.width() + evt.offsetX < settings.min_width ||
						parent.width() + evt.offsetX > parent.width() - settings.min_width)
						return;	

					target_parent.width(target_parent.width() + evt.offsetX);
					children.forEach(function(child) {
						if (child != evt.target)
							child.offsetWidth += evt.offsetX;
					});

					target.width(target.width() - evt.offsetX);
					target_children.forEach(function(child) {
						if (child != evt.target)
							child.offsetWidth -= evt.offsetX;
					});
				});
			} else {
				size_bar.on("mousedrag", function(evt) {
					var parent = _this.parent();
					var children = parent.children();

					var target = _$.init(settings.target);
					var target_parent = target.parent();
					var target_children = target.children();

					if (parent.height() - evt.offsetX < settings.min_height ||
						parent.height() - evt.offsetX > parent.height() - settings.min_height)
						return;	

					target_parent.height(target_parent.height() - evt.offsetY);
					children.forEach(function(child) {
						if (child != evt.target)
							child.offsetHeight -= evt.offsetY;
					});

					target.height(target.height() + evt.offsetY);
					target_children.forEach(function(child) {
						if (child != evt.target)
							child.offsetHeight += evt.offsetY;
					});
				});
			}

			if (settings.align == "pre") _this.prepend(size_bar);
			else _this.append(size_bar);
		}

		return this;
	};
}(cmf));