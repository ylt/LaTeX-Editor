var DomToLtx = Class.create({
	initialize: function() {
		
	},
	parse: function(node) {
		var tag = node.prop("tagName").substring(7); //ltxcmd-
		var code = "\\"+tag;
		var values = $j(node).children("ltx-value");
		var dthis = this;
		values.each(function(index, val) {
			code += "{";
			var list = val.childNodes
			for (var i = 0; i < list.length; i++) {
				var content = list[i];
				code += dthis.formatTag(content);
			}
			code += "}\n";
		});
		
		if (tag == "BEGIN") {
			//we've got the content also, and the \end tag
			
			var val = $j(node).children("ltx-content")[0];

			var list = val.childNodes
			for (var i = 0; i < list.length; i++) {
				var content = list[i];
				code += dthis.formatTag(content);
			};
			code += "\\end{"+tag+"}";
		}
		
		
		return code;
	},
	formatTag: function(content) {
		var code;
		if (content.nodeType == 3) { //textnode
			code = content.nodeValue;
		}
		else if (content.nodeType == 8) { //comment
			code = "\n%"+content.nodeValue+"\n";
		}
		else if (content.tagName == "LTXCMD-PAR"){
			code = "\n\n";
		}
		else if (content.tagName == "LTXCMD-SA_NEWLINE")
		{
			code = "\\\\";
		}
		else {
			content = $j(content);
			console.log('recurse', content);
			code = this.parse(content)
		}
		return code;
	}
	
});