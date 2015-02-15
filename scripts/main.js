function partition(str, split) {
	position = str.indexOf(split);
	return [
		str.substring(0,position),
		split,
		str.substring(position+1)
	];
}
function strip(text) {
	return text.replace(/^\s+|\s+$/g, "");
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
				//console.log(data);
				
				var el = new latex_tag("document", [data], []);
				var dom = el.toDOM();
				document.body.appendChild(dom);
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
		if (this.offset < this.collection.length-1)
			return true;
		else
			return false;
	},
	next: function() {
		var val = this.collection[this.offset];
		if (val == "%" && this.collection[this.offset] != "\\") {
			var comment = "";
			while (val != "\n") {
				this.offset += 1;
				val = this.collection[this.offset];
				if (val != "\n") {
					comment += val;
				}
			}
			this.comments.push(comment);
		}
		this.offset += 1;
		return val;
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
		this.tname = name;
		this.value = value;
		this.options = options;
		
		this.body = [];
		
	},
	toDOM: function() {
		var el = document.createElement(this.name);
		/*this.options.forEach(function(value) {
			el.setAttribute(strip(value[0]), strip(value[1]));
		});*/
		//console.log("dom", this);
		this.value.forEach(function(value) {
			value.forEach(function(ivalue) {
				var res = ivalue.toDOM();
				el.appendChild(res);
			});
		});
		console.log(this.body);
		if (this.body.isArray())
			this.body.forEach(function(value) {
				value.forEach(function(ivalue) {
					var res = ivalue.toDOM();
					el.appendChild(res);
				});
			});
		return el;
	}
});


var latex_string = Class.create(latex_tag, {
	initialize: function(value) {
		this.value = value;
	},
	toDOM: function() {
		var el = document.createTextNode(this.value);
		return el;
	}
})

var latex_comment = Class.create(latex_tag, {
	initialize: function(value) {
		this.value = value;
	},
	toDOM: function() {
		var el = document.createComment(this.value);
		return el;
	}
});

var Lexer = Class.create({
	initialize: function(reader) {
		this.reader = reader;
	},
	parse: function(exitChar) {
		if (typeof exitChar === "undefined")
			exitChar = null;
		
		var commands = [];
		var text = "";
		while (this.reader.hasNext() === true) {
			value = this.reader.next();
			if (exitChar != null && value == exitChar) {
				break;
			}
			else if (value == "\\") {
				if (text != "") {
					//commands.push(new latex_string(text));
					var re = /\r?\n\s*\r?\n/;
					var pars = text.split(re);
					//console.log(pars);
					pars.forEach(function(par, index) {
						commands.push(new latex_string(par));
						if (index < pars.length-1)
							commands.push(new latex_tag("p", [], {}));
					});
					text = "";
				}
				
				var command = this.readCommand();

				if (command.name == "begin") {
					//console.log(command);
					command.body = this.parse();
					commands.push(command);
					console.log(command);

				}
				else if (command.name == "end") {
					//console.log(command);
					break; //finally
				}
				else {
					commands.push(command);
				}
			}
			else if (value == "$") {
				commands.push(new latex_tag("sa_maths", this.parse("$"), {}));
			}
			else if (value == "{") {
				commands.push(new latex_tag("sa_block", this.parse("}"), {}));
			}
			else if (value == "&") {
				commands.push(new latex_tag("sa_separator", this.parse("$"), {}));
			}
			else //if (value != "\n") {
			{
				text += value;
			}
			
			comments = this.reader.getComments();
			if (comments.length > 0) {
				commands.push(new latex_comment(comments));
			}
		}
		if (text != "") {
			var re = /\r?\n\s*\r?\n/;
			var pars = text.split(re);
			
			pars.forEach(function(par, index) {
				commands.push(new latex_string(par));
				if (index < pars.length-1)
					commands.push(new latex_tag("p", [], {}));
			});
		}
		//console.log(commands);
		return commands;
	},
	readCommand: function() {
		var commandName = "";
		var options = [];
		var content = [];
		
		var hasArgs = false;
		while (this.reader.hasNext() === true) {
			var value = this.reader.next();
			if (value == "\\") {
				if (commandName == "") {
					return new latex_tag("sa_newline", [], {});
				}
				this.reader.back();
				break;
			}
			else if (value == " " || value == "\n" || value == "\r" || value == "}") {
				this.reader.back();
				break;
			}
			else if (value == "{" || value == "[") {
				hasArgs = true;
				this.reader.back();
				break;
			}
			else {
				commandName += value;
			}
		}
		if (hasArgs) {
			while (this.reader.hasNext() == true) {
				var value = this.reader.next();
				if (value == "{") {
					content.push(this.parse("}"));
				}
				else if (value == "[") {
					content.push(this.parseOptions());
				}
				else {
					this.reader.back();
					break;
				}
			}
		}
		return new latex_tag(commandName, content, options);
	},
	parseOptions: function() {
		var arguments = {};
		var current = "";
		while (this.reader.hasNext()) {
			var value = this.reader.next();
			if (value == "]") {
				break;
			}
			else if (value == ",") {
				var s = partition(value, "=");
				var key = s[0], sep = s[1], val = s[2];
				arguments[key] = value;
				current = "";
			}
			else {
				current += value;
			}
		}
		return arguments;
	}
});

var test = new Main();
