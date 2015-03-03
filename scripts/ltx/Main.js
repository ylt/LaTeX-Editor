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

//manages page itself
var Main = Class.create({
	initialize: function() {
		//make all the hooks here

		//load up ace editor
		var editor = ace.edit("input");
		editor.setTheme("ace/theme/merbivore");
		editor.getSession().setMode("ace/mode/latex");
		editor.getSession().setUseWrapMode(true);
		this.editor = editor;


		//make hooks, so that any change will update preview (in realtime)
		var inst = this;
		$j("#input").keypress(function() {
			inst.changed_code();
		});
		$j("#input").keyup(function() {
			inst.changed_code();
		});
		
		$j("#convert").click(function() {
			inst.changed_preview();
		});
		
	},
	tick: function() {
		//unused for now
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
		var code = new DomToLtx().parseChildren($j('ltxcmd-document ltx-value')[0]);
		this.editor.setValue(code);
	}
});

$j(function() {
	var test = new Main();
	test.changed_code();
});
