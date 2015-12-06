if (typeof Array.prototype.indexOf !== "function") {
	Array.prototype.indexOf = function(item) {
		for(var i = 0; i < this.length; ++i)
			if (this[i] === item)
				return i;

		return -1;
	};
}

if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

window._$ = function(selector) {
	return cmf.get(selector);
}

window.cmf = (function() {
	function CMF(els) {
		for (var i = 0; i < els.length; ++i)
			this[i] = els[i];
		this.length = els.length;
	}

	CMF.prototype.map = function(callback) {
		var results = [];
		for (var i = 0; i < this.length; ++i)
			results.push(callback.call(this, this[i], i));

		return results;
	};

	CMF.prototype.mapOne = function(callback) {
		var m = this.map(callback);
		return m.length > 1 ? m : m[0];
	};

	CMF.prototype.forEach = function(callback) {
		this.map(callback);
		return this;
	};

	CMF.prototype.select = function(selector) {
		return cmf.get(this[0].querySelector(selector));
	};

	CMF.prototype.width = function(width) {
		if (typeof width !== "undefined") {
			return this.forEach(function(el) {
				el.style.width = width;
			});
		} else {
			return this.mapOne(function(el) {
				return el.style.width;
			});
		}
	};

	CMF.prototype.height = function(height) {
		if (typeof height !== "undefined") {
			return this.forEach(function(el) {
				el.style.height = height;
			});
		} else {
			return this.mapOne(function(el) {
				return el.style.height;
			});
		}
	};

	CMF.prototype.text = function(text) {
		if (typeof text !== "undefined") {
			return this.forEach(function(el) {
				el.innerText = text;
			});
		} else {
			return this.mapOne(function(el) {
				return el.innerText;
			});
		}
	};

	CMF.prototype.html = function(html) {
		if (typeof html !== "undefined") {
			return this.forEach(function(el) {
				el.innerHTML = html;
			});
		} else {
			return this.mapOne(function(el) {
				return el.innerHTML;
			});
		}
	};

	CMF.prototype.value = function(value) {
		if (typeof value !== "undefined") {
			return this.forEach(function(el) {
				el.value = value;
			});
		} else {
			return this.mapOne(function(el) {
				return el.value;
			});
		}
	};

	CMF.prototype.attr = function(attr, val) {
		if (typeof val !== "undefined") {
			return this.forEach(function(el) {
				el.setAttribute(attr, val);
			});
		} else  {
			return this.mapOne(function(el) {
				el.getAttribute(attr);
			});
		}
	};

	CMF.prototype.css = function() {
		return this.mapOne(function(el) {
			return el.style;
		});
	};

	CMF.prototype.fg = function(val) {
		if (typeof val !== "undefined") {
			return this.forEach(function(el) {
				el.style.color = val;
			});
		} else  {
			return this.mapOne(function(el) {
				el.style.color;
			});
		}
	};

	CMF.prototype.bg = function(val) {
		if (typeof val !== "undefined") {
			return this.forEach(function(el) {
				el.style.backgroundColor = val;
			});
		} else  {
			return this.mapOne(function(el) {
				el.style.backgroundColor;
			});
		}
	};

	CMF.prototype.bd = function(val) {
		if (typeof val !== "undefined") {
			return this.forEach(function(el) {
				el.style.borderColor = val;
			});
		} else  {
			return this.mapOne(function(el) {
				el.style.borderColor;
			});
		}
	};

	CMF.prototype.addClass = function(classes) {
		var className = "";
		if (typeof classes !== "string")
			for (var i = 0; i < classes.length; ++i)
				className += " " + classes[i];
		else
			className = " " + classes;

		return this.forEach(function (el) {
			el.className += className;
		});
	};

	CMF.prototype.hasClass = function(class_name) {
		return this.forEach(function(el) {
			var class_list = el.className.split(' '), i;
			return (class_list.indexOf(class_name) != -1);
		});
	};

	CMF.prototype.removeClass = function(class_name) {
		return this.forEach(function(el) {
			var class_list = el.className.split(' '), i;
			while ((i = class_list.indexOf(class_name)) > -1)
				class_list = class_list.slice(0, i).concat(cs.slice(++i));
			el.className = class_list.join(' ');
		});
	};

	CMF.prototype.append = function(els) {
		return this.forEach(function(parent, i) {
			els.forEach(function(child) {
				if (i > 0)
					child = child.cloneNode(true);

				parent.appendChild(child);
			});
		});
	};

	CMF.prototype.prepend = function(els) {
		return this.forEach(function(parent, i) {
			for (var j = els.length -1; j > -1; j--) {
				var child = (i > 0) ? els[j].cloneNode(true) : els[j];
				parent.insertBefore(child, parent.firstChild);
			}
		});
	};

	CMF.prototype.remove = function() {
		return this.forEach(function(el) {
			return el.parentNode.removeChild(el);
		});
	};

	CMF.prototype.show = function(style) {
		style = style || "block";
		return this.forEach(function(el) {
			el.style.display = style;
		});
	};

	CMF.prototype.hide = function() {
		return this.forEach(function(el) {
			el.style.display = "none";
		});
	};

	CMF.prototype.enable = function() {
		return this.forEach(function(el) {
			el.disabled = false;
		});
	};

	CMF.prototype.disable = function() {
		return this.forEach(function(el) {
			el.disabled = true;
		});
	};

	CMF.prototype.on = (function() {
		if (document.addEventListener) {
			return function(e, f) {
				return this.forEach(function(el) {
					el.addEventListener(e, f, false);
				});
			};
		} else if (document.attachEvent) {
			return function(e, f) {
				return this.forEach(function(el) {
					el.attachEvent("on" + e, f);
				});
			};
		} else {
			return function(e, f) {
				return this.forEach(function(el) {
					el["on" + e] = f;
				});
			};
		}
	}());

	CMF.prototype.unhook = (function() {
		if (document.removeEventListener) {
			return function(e, f) {
				return this.forEach(function(el) {
					el.removeEventListener(e, f, false);
				});
			};
		} else if (document.detachEvent) {
			return function(e, f) {
				return this.forEach(function(el) {
					el.detachEvent("on" + e, f);
				});
			};
		} else {
			return function(e, f) {
				return this.forEach(function(el) {
					el["on" + e] = null;
				});
			};
		}
	}());

	var cmf = {
		fn: CMF.prototype,

		get: function(selector) {
			var els;
			if (typeof selector === "string")
				els = document.querySelectorAll(selector);
			else if (selector.length)
				els = selector;
			else
				els = [selector];

			return new CMF(els);
		},

		create: function(tag_name, attrs) {
			var el = new CMF([document.createElement(tag_name)]);
			if (attrs) {
				if (attrs.className) {
					el.addClass(attrs.className);
					delete attrs.className;
				}
				if (attrs.text) {
					el.text(attrs.text);
					delete attrs.text;
				}
				for (var key in attrs) {
					if (attrs.hasOwnProperty(key))
						el.attr(key, attrs[key]);
				}
			}

			return el;
		},

		extend: function(extended, original) {
			for (var key in original)
				extended[key] = original[key];

			return extended;
		},
	};

	return cmf;
}());