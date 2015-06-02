"use strict";

function partition(str, split) {
	var position = str.indexOf(split);
	return [
		str.substring(0,position),
		split,
		str.substring(position+1)
	];
}
function strip(text) {
	return text.replace(/^[\r\n\s]+|[\r\n\s]+$/gm, "");
}

function rstrip(text) {
	return text.replace(/[\r\n\s]+$/gm, "");
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}     

//manages page itself
var Main = Class.create({
	initialize: function() {
		//make all the hooks here

		//load up ace editor
		var editor = ace.edit("input");
		editor.setTheme("ace/theme/merbivore");
		editor.getSession().setMode("ace/mode/latex");
		editor.getSession().setUseWrapMode(true);
		editor.$blockScrolling = Infinity;
		this.editor = editor;


		//make hooks, so that any change will update preview (in realtime)
		var inst = this;
		$j("#input").keypress(function() {
			inst.changed_code();
		});
		$j("#input").keyup(function() {
			inst.changed_code();
		});
		
		$j("#document").keypress(function() {
			inst.changed_preview();
			console.log("keypress");
		});
		$j("#document").keyup(function() {
			inst.changed_preview();
		});

		$j("#convert").click(function() {
			inst.changed_preview();
		});
		
		$j("#bold").click(function() {
			var sel = window.getSelection();
			var range = sel.getRangeAt(0).cloneRange();
			
			range.surroundContents(document.createElement('ltx-value'));
			range.surroundContents(document.createElement('ltxcmd-textbf'));
			
			sel.removeAllRanges();
            sel.addRange(range);
			
			//document.createElement('ltxcmd-textbf');
			//document.createElement('ltx-value');
			inst.changed_preview();
			
		});
		
		$j("#unbold").click(function() {
			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			var range = sel.getRangeAt(0).cloneContents();
			console.log(range);
			var a = range.querySelectorAll('ltxcmd-textbf');
			console.log(a);
			for (var i = 0; i < a.length; i++) {
				var tag = a[i];
				var parent = tag.parentNode;
				parent.insertBefore(tag.children[0], tag);
				parent.removeChild(tag);
			};
			
			anchor.parentElement.appendChild(range);
			console.log(range);
			inst.changed_preview();
		});
		
		$j("#addrow").click(function() {
			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			
			//find current row
			var current = anchor;
			while(current.nodeType != 1 || current.tagName != 'LTX-TAB-ROW') {
				current = current.parentElement;
				if (current == null) {
					alert("missing row");
					return;
				}
			}
			console.log(current);
			var table = current.parentElement;
			var row = document.createElement('ltx-tab-row');
			for (var i = 0; i < current.childNodes.length; i++) {
				var col = document.createElement('ltx-tab-col');
				col.innerHTML = "#";
				row.appendChild(col);
			}
			
			//clone border
			row.setAttribute('hline', current.getAttribute("hline"));
			
			
			//if (current.nextSibling) {
				table.insertBefore(row, current.nextSibling);
			//}
			//else {
			//	table.appendChild(row);
			//}
			inst.changed_preview();
		});
		
		$j("#addcolumn").click(function() {
			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			
			//find current column
			var current = anchor;
			while(current.nodeType != 1 || current.tagName != 'LTX-TAB-COL') {
				current = current.parentElement;
				if (current == null) {
					alert("missing row");
					return;
				}
			}
			
			var columnId = 0;
			var temp = current;
			while (temp != null) {
				temp = temp.previousSibling;
				columnId ++;
			}
			
			console.log(columnId);
			
			var table = current.parentElement.parentElement;
			
			var rows = table.childNodes;
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var columns = row.childNodes;
				
				var column = null;
				if (columnId < columns.length) {
					for (var j = 0; j < columns.length; j++) {
						column = columns[j];
						if (j == columnId)
							break;
					}
				}
				
				var newcol = document.createElement('ltx-tab-col');
				newcol.innerHTML = '#';
				
				row.insertBefore(newcol, column);
			}
			inst.changed_preview();
		});
		
		$j('#toggleborder').click(function(){
			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			
			//find current row
			var current = anchor;
			while(current.nodeType != 1 || current.tagName != 'LTX-TAB-ROW') {
				current = current.parentElement;
				if (current == null) {
					alert("missing row");
					return;
				}
			}
			
			var hline = current.getAttribute('hline');
			if (hline == "true")
				current.setAttribute('hline', 'false');
			else
				current.setAttribute('hline', 'true');

			inst.changed_preview();
		});
		
		$j('#addtable').click(function(){
			var sel = window.getSelection();
			var anchor = sel.anchorNode;
			if (anchor.nodeType == 3) {
				var start = anchor.nodeValue.substring(0, sel.anchorOffset); 
				var end = anchor.nodeValue.substring(sel.anchorOffset);
				
				anchor.nodeValue = start;
				var endNode = document.createTextNode(end);
				anchor.parentNode.insertBefore(endNode, anchor.nextSibling);
			}
			
			var table = document.createElement("ltxcmd-tabular");
			var row = document.createElement("ltx-tab-row");
			row.setAttribute("hline", true);
			var column = document.createElement("ltx-tab-col");
			column.innerHTML = "a";
			anchor.parentNode.insertBefore(table, anchor.nextSibling);
			table.insertBefore(row, null);
			row.insertBefore(column, null);
			
			inst.changed_preview();
		});

		this.retrieve();
		
	},
	retrieve: function() {
		var inst = this;
		var data = {
			userToken: getUrlParameter('userToken')
		};

		$j.post("retrieve.php", data, function(response) {
			inst.editor.setValue(response);
			inst.changed_code();
		}).always(function() {
			setTimeout(inst.tick.bind(inst), 1500);
		});

	},
	tick: function() {
		var inst = this;
		var current = this.editor.getValue();
		if (this.last != current) {
			var data = {
				content: current,
				userToken: getUrlParameter('userToken')
			};
			$j.post("submit.php", data).always(function() {
				setTimeout(inst.tick.bind(inst), 1500);
			});
		}
		else {
			setTimeout(inst.tick.bind(inst), 1500);
		}
		this.last = current;
	},
	
	//events
	changed_code: function() {
		var data = this.editor.getValue();

		var r = new Reader(data);
		var l = new Lexer(r);
		var data = l.parse();
		console.log(data);
		
		var el = new LtxTag_Generic("document", [data], []);
		var dom = el.toDOM();
		
		var container = document.getElementById("documenteditor");
		container.appendChild(dom);
		
		dom.contentEditable=true;
		
		if (this.document !== undefined)
			container.removeChild(this.document);

		this.document = dom;
	},
	changed_preview: function() {
		var pos = this.editor.selection.getCursor();

		var code = new DomToLtx().parseChildren($j('ltxcmd-document ltx-value')[0]);
		this.editor.setValue(code);
		
		this.editor.selection.moveCursorToPosition(pos);
	}
});

$j(function() {
	var test = new Main();
	test.changed_code();
});
