"use strict";

var DomToLtx = Class.create({
	initialize: function() {
		
	},
	parse: function(node) {
		var tag = node.prop("tagName").substring(7).toLowerCase(); //ltxcmd-
		var code = "\\"+tag;
		var values = $j(node).children("ltx-value");
		var dthis = this;
		
		if (tag == "item") {
			code += ' ' + dthis.parseChildren(values[0]) + "\n";
		}
		else if (tag == "tabular")
		{
			code = "\\begin{tabular}\n";
			
			$j(node).children().each(function(irow, row) {
				var rchildren =$j(row).children();
				var rowlen = rchildren.length;
				rchildren.each(function(icolumn, column) {
					code += dthis.parseChildren(column);
					if (icolumn < rowlen-1)
						code += "&";
				});
				
				code += "\\\\";
				if (row.getAttribute("hline") == "true")
					code += "\\hline";
				code += "\n";
			});
			
			
			code += "\\end{tabular}\n";
			
		}
		else {
			values.each(function(index, val) {
				code += "{";
				code += dthis.parseChildren(val);
				code += "}";
			});
			if (values.length > 0)
				code += "\n";
			
			if (tag == "begin") {
				//glitch: ltx->dom discards values, partial temp fix 
				var begintype = node.attr("begintype");
				//code += "{"+begintype+"}\n";
				code = '\n'+code;
				//we've got the content also, and the \end tag
				
				var val = $j(node).children("ltx-content")[0];
	
				code += this.indent(this.parseChildren(val));
				
				code += "\\end{"+begintype+"}\n";
			}
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
			}
			else if (tag == "sa_newline") {
				code = "\\\\";
			}
			else {
				content = $j(content);
				code = this.parse(content);
			}
			
		}
		return code;
	},
	indent: function(text) {
		var parts = text.split("\n");
		for(var i = 0; i < parts.length; i++) {
			if (parts[i] != "")
				parts[i] = "  "+parts[i];
		}
		return parts.join("\n");
	}
	
});