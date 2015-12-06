(function(_$) {
	_$.fn.widget = function(options) {
		var settings = _$.extend({
			style: "def",
			type: null,
			orientation: null
		}, options);

		return this.forEach(function() {
			this.addClass("cmf-"+settings.style);
			if (settings.type != null)
				this.addClass("cmf-"+settings.type);
			if (settings.orientation != null)
				this.addClass("cmf-"+settings.orientation);
		});
	};
}(cmf));
