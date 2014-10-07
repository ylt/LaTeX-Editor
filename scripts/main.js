function partition(str, split) {
	position = str.indexOf(split);
	return [
		str.substring(0,position),
		split,
		str.substring(position+1)
	];
}
function strip(text) {
	return text.replace("/^\s+|\s+$/g", "");
}

//manages page itself
var Main = Class.create({
	initialize: function() {
		//make all the hooks here
		
		jQuery.ajax({
			url: "main.tex",
			success: function(data) {
				var r = new Reader(data);
				var l = new Lexer(r);
				var data = l.parse();
				
				
			},
			dataType: "text"
		});
		
		
	},
	tick: function() {
		//unused for now
	},
	
	//events
	changed_code: function() {
		
	},
	changed_preview: function() {
		
	}
});

var Reader = Class.create({
	initialize: function(collection) {
		this.offset = 0;
		this.collection = collection;
		this.comments = [];
	},
	
	hasNext: function() {
		if (this.offset < this.collection.length)
			return true;
		else
			return false;
	},
	next: function() {
		var val = this.collection[this.offset];
		if (val == '%' && this.collection[this.offset - 1] != '\\') {
			var comment = '';
			while (val != '\n') {
				this.offset += 1;
				val = this.collection[this.offset];
				if (val != '\n') {
					comment += val;
				}
			}
			this.comments.push(comment);
		}
		this.offset += 1;
	},
	//TODO: correct for comments
	back: function() {
		this.offset -= 1;
	},
	//TODO: and same for here somehow
	peek: function() {
		return this.collection[this.offset];
	},
	//read all comments out, and reset
	getComments: function() {
		var rcomments = this.comments; //backup
		this.comments = [] //reset
		return rcomments;
	}
});

var latex_tag = Class.create({
	initialize: function(name, value, options) {
		this.name = name;
		this.value = value;
		this.options = options;
	}
});

var Lexer = Class.create({
	initialize: function(reader) {
		this.reader = reader;
	},
	parse: function(exitChar) {
		if (typeof exitChar === 'undefined')
			exitChar = null;
		
		var commands = [];
		var text = '';
		while (this.reader.hasNext()) {
			value = this.reader.next();
			if (exitChar != null && value == exitChar) {
				break;
			}
			else if (value == '\\') {
				if (strip(text) != '') {
					commands.push(new latex_tag('sa_text', strip(text)));
					text = '';
				}
				
				command = this.readCommand();
				
				if (command.name == "begin") {
					console.log("wtf is this?", this.parse());
				}
				else if (command.name == "end") {
					break; //finally
				}
				else {
					commands.push(command);
				}
			}
			else if (value == '$') {
				commands.push(new latex_tag('sa_maths', this.parse('$')));
			}
			else if (value == '{') {
				commands.push(new latex_tag('sa_block', this.parse('}')));
			}
			else if (value == '&') {
				commands.push(new latex_tag('sa_separator', this.parse('$')));
			}
			else if (value == '\n') {
				text += value;
			}
			
			comments = this.reader.getComments();
			if (comments.length > 0) {
				commands.push(new latex_tag('sa_comment', comments));
			}
		}
		if (text.strip() != '') {
			commands.push(new latex_tag('sa_text', strip(text)));
		}
		return commands;
	},
	readCommand: function() {
		var commandName = '';
		var options = [];
		var content = [];
		
		var hasArgs = false;
		while (this.reader.hasNext()) {
			var value = this.reader.next();
			if (value == '\\') {
				if (commandName == '') {
					return new latex_tag('sa_newline', [], []);
				}
				this.reader.back();
				break;
			}
			else if (value == ' ' || value == '\n' || value == '\r' || value == '}') {
				this.reader.back();
				break;
			}
			else if (value == '{' || value == '[') {
				hasArgs = true;
				this.reader.back();
			}
			else {
				commandName += value;
			}
		}
		
		if (hasArgs) {
			while (this.reader.hasNext()) {
				var value = this.reader.next();
				if (value == '{') {
					content.push(this.parse('}'));
				}
				else if (value == '[') {
					content.push(this.parseOptions());
				}
				else {
					this.reader.back();
					break;
				}
			}
		}
		
		return new latex_tag(commandName, options, context);
	},
	parseOptions: function() {
		var arguments = {};
		var current = '';
		while (this.reader.hasNext()) {
			var value = this.reader.next();
			if (value == ']') {
				break;
			}
			else if (value == ',') {
				var s = partition(value, '=');
				var key = s[0], sep = s[1], val = s[2];
				arguments[key] = value;
				current = '';
			}
			else {
				current += value;
			}
		}
		return arguments;
	}
});

var test = new Main();