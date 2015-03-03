var DomToLtx = Class.create({
	initialize: function() {
		
	},
	parse: function(node) {
		var tag = node.prop("tagName").substring(7); //ltxcmd-
		var code = "\\"+tag;
		var values = $j(node).children("ltx-value");
		var dthis = this;
		values.each(function(index, val) {
			val = $j(val);
			code += "{";
			val.children().each(function(index, content) {
				content = $j(content);
				code += dthis.parse(content)
			});
			code += "}";
		});
		
		if (tag == "BEGIN") {
			//we've got the content also, and the \end tag
			
			var val = $j(node).children("ltx-content").first();

			val.children().each(function(index, content) {
				content = $j(content);
				code += dthis.parse(content)
			});
			code += "\\end{"+tag+"}";
		}
		
		
		return code;
	}
});