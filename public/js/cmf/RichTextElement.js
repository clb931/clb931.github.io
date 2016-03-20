(function(_$) {
	_$.fn.RichTextElement = function(options) {
		var settings = _$.extend({
			socket: null,
			onSave: null,
		}, options);
		
		var socket = settings.socket || io();

		var edit_btn = _$.create("button", {
			text: "Edit",
		});
		this.append(edit_btn);

		var save_btn = _$.create("button", {
			text: "Save",
			disabled: true,
		});
		this.append(save_btn);

		var text_area = _$.create("textarea", {
			className:	"cmf_richtextarea",
			style:		"display: none",
		});
		this.append(text_area);

		var text_view = _$.create("iframe", {
			className: "cmf_richtextarea",
		});
		this.append(text_view);

		var ihead = text_view[0].contentWindow.document.head;
		ihead.innerHTML = "<base target=\"_blank\"/>";
		var ibody = text_view[0].contentWindow.document.body;

		edit_btn.on("click", function(e) {
			console.log("Editing journal....");
			text_area.show();
			text_view.hide();
			edit_btn.disable();
			save_btn.enable();
		});
		save_btn.on("click", function(e) {
			console.log("Saving journal....");
			text_area.hide();
			text_view.show();
			edit_btn.enable();
			save_btn.disable();

			text_view.html("");
			ibody.innerHTML = ParseString(text_area.value()).html();
		});
		if (settings.onSave)
			save_btn.on("click", settings.onSave);

		function ParseString(str) {
			return ParseParagraphs(_$.create("div"), str.split("\n\n"));
		}

		function ParseParagraphs(body, paragraphs) {			
			var i = 0;
			while (i < paragraphs.length) {
				body.append(ParseLines(
					_$.create("p"),
					paragraphs[i++].split("\n")
				));
			}

			return body;
		}

		function ParseLines(p, lines) {
			var line = lines.shift();
			while (typeof line !== "undefined") {
				var j = 0;
				if ((j = isH(line)) > 0) {
					var h = _$.create("h"+j).text(line.slice(j));
					format(h);
					p.append(h);
					line = lines.shift();
				} else if ((j = isHR(line)) > 0) {
					var hr = _$.create("hr");
					p.append(hr);
					line = lines.shift();
				} else if ((j = isBQ(line)) > 0) {
					var bq = _$.create("blockquote").text(line.slice(j));
					format(bq);
					p.append(bq);
					line = lines.shift();
				} else if ((j = isUL(line)) > 0) {
					var ul = _$.create("ul");
					while (typeof line !== "undefined" && (j = isUL(line)) > 0) {
						ul.append(_$.create("li").text(line.slice(j)));
						line = lines.shift();
					}
					format(ul);
					p.append(ul);
				} else if ((j = isOL(line)) > 0) {
					var ol = _$.create("ol");
					while (typeof line !== "undefined" && (j = isOL(line)) > 0) {
						ol.append(_$.create("li").text(line.slice(j)));
						line = lines.shift();
					}
					format(ol);
					p.append(ol);
				} else {
					var span = _$.create("span").text(line);	
					format(span);
					p.append(span);
					p.append(_$.create("br"));
					line = lines.shift();
				}
			}

			return p;
		}

		function isH(str) {
			if (str.slice(0, 6) == "######")
				return 6;
			else if (str.slice(0, 5) == "#####")
				return 5;
			else if (str.slice(0, 4) == "####")
				return 4;
			else if (str.slice(0, 3) == "###")
				return 3;
			else if (str.slice(0, 2) == "##")
				return 2;
			else if (str.slice(0, 1) == "#")
				return 1;
			else
				return 0;
		}

		function isBQ(str) {
			if (str[0] == ">")
				return 1;
			else
				return 0;
		}

		function isHR(str) {
			if (str[0] == "_")
				return 1;
			else
				return 0;
		}

		function isUL(str) {
			var m = str.match(/([*-]\s)(.*)$/);
			if (m != null)
				return m[1].length;
			else
				return 0;
		}

		function isOL(str) {
			var m = str.match(/(\d+.\s)(.*)$/);
			if (m != null)
				return m[1].length;
			else
				return 0;
		}

		function format(el) {
			replaceHyperLink(el);
			replaceStrike(el);
			replaceBold(el);
			replaceItalic(el);
		}

		function replaceStrike(el) {
			var html = el.html();

			html = html.replace(/\~\~(.+)\~\~/, function(str) {
				return "<strike>"+str.slice(2, -2)+"</strike>";
			});

			el.html(html);
		}

		function replaceBold(el) {
			var html = el.html();

			html = html.replace(/\*\*(.+)\*\*/, function(str) {
				return "<b>"+str.slice(2, -2)+"</b>";
			});
			html = html.replace(/\_\_(.+)\_\_/, function(str) {
				return "<b>"+str.slice(2, -2)+"</b>";
			});

			el.html(html);
		}

		function replaceItalic(el) {
			var html = el.html();

			html = html.replace(/\*(.+)\*/, function(str) {
				return "<i>"+str.slice(1, -1)+"</i>";
			});
			html = html.replace(/\_(.+)\_/, function(str) {
				return "<i>"+str.slice(1, -1)+"</i>";
			});

			el.html(html);
		}

		function replaceHyperLink(el) {
			var html = el.html();
			html = html.replace(/\[(.+)\]\((.+)\)/, "<a href=\"$2\">$1</a>");

			el.html(html);
		}

		return this;
	};
}(cmf));

// "#h1\n"+
// "##h2\n"+
// "###h3\n"+
// "####h4\n"+
// "#####h5\n"+
// "######h6\n"+
// "_\n"+
// ">blockquote\n"+
// "[google](http://www.google.com)\n"+
// "~~strike~~\n"+
// "**bold**\n"+
// "*italic*\n"+
// "_\n"+
// "* ul 01\n"+
// "* ul 02\n"+
// "* ul 03\n\n"+
// "- ul 11\n"+
// "- ul 12\n"+
// "- ul 13\n\n"+
// "1. ol 1\n"+
// "2. ol 2\n"+
// "3. ol 3"