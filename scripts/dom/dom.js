var DomToLtx = Class.create({
	initialize: function() {
		
	},
	parse: function(node) {
		var tag = node.prop("tagName").substring(7).toLowerCase(); //ltxcmd-
		var code = "\\"+tag;
		var values = $j(node).children("ltx-value");
		var dthis = this;
		values.each(function(index, val) {
			code += "{";
			code += dthis.parseChildren(val);
			code += "}\n";
		});
		
		if (tag == "begin") {
			//glitch: ltx->dom discards values, partial temp fix 
			var begintype = node.attr("begintype");
			code += "{"+begintype+"}\n";
			
			//we've got the content also, and the \end tag
			
			var val = $j(node).children("ltx-content")[0];

			code += this.parseChildren(val);
			
			code += "\\end{"+begintype+"}";
		}
		
		
		return code;
	},
	parseChildren: function(val) {
		var code = "";
		var list = val.childNodes;
		for (var i = 0; i < list.length; i++) {
			var content = list[i];
			code += this.formatTag(content);
		}
		return code;
	},
	formatTag: function(content) {
		var code;
		
		if (content.nodeType == 3) { //textnode
			code = content.nodeValue;
		}
		else if (content.nodeType == 8) { //comment
			code = "% "+content.nodeValue+"\n";
		}
		else if (content.nodeType == 1){
			var tag = content.tagName.substring(7).toLowerCase();
			
			if (tag == "par") {
				code = "\n\n";
				console.log("paragraph");
			}
			else if (tag == "sa_newline") {
				code = "\\\\";
			}
			else {
				content = $j(content);
				code = this.parse(content)
			}
			
		}
		return code;
	}
	
});