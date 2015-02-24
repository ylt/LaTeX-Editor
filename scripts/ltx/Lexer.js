"use strict";

var Lexer = Class.create({
	initialize: function(reader) {
		this.reader = reader;
	},
	parse: function(exitChar) {
		if (typeof exitChar === "undefined")
			exitChar = null;
		
		var commands = [];
		var text = "";
		
		var doText = function() {
			if (text != "") {
				if (text != "") {
					//commands.push(new latex_string(text));
					var re = /\r?\n\s*\r?\n/;
					var pars = text.split(re);
					//console.log(pars);
					pars.forEach(function(par, index) {
						commands.push(new LtxString(par));
						if (index < pars.length-1)
							commands.push(LtxTagFactory.Construct("par", [], {}));
					});
					text = "";
				}
			}
		};
		
		while (this.reader.hasNext() === true) {
			var value = this.reader.next();
			if (exitChar != null && value == exitChar) {
				break;
			}
			else if (value == "\\") {
				var nchar = this.reader.peek();
				if (nchar == "$" || nchar == "#" || nchar == "&" ||
						nchar  == "^" || nchar == "_" ||
						nchar == "%" || nchar == "~") {
					text += nchar;
				}
				else {
					doText();
					
					var command = this.readCommand();
	
					if (command.name == "begin") {
						command.body = this.parse();
						command.tidy();
						commands.push(command);
	
					}
					else if (command.name == "end") {
						break; //finally
					}
					else {
						commands.push(command);
					}
				}
			}
			else if (value == "$") {
				doText();
				commands.push(LtxTagFactory.Construct("sa_maths", this.parse("$"), {}));
			}
			else if (value == "{") {
				doText();
				commands.push(LtxTagFactory.Construct("sa_block", this.parse("}"), {}));
			}
			else if (value == "&") {
				doText();
				commands.push(LtxTagFactory.Construct("sa_separator", [], {}));
			}
			else //if (value != "\n") {
			{
				text += value;
			}
			
			var comments = this.reader.getComments();
			if (comments.length > 0) {
				commands.push(new LtxComment(comments));
			}
		}
		if (text != "") {
			var re = /\r?\n\s*\r?\n/;
			var pars = text.split(re);
			
			pars.forEach(function(par, index) {
				commands.push(new LtxString(par));
				if (index < pars.length-1)
					commands.push(LtxTagFactory.Construct("p", [], {}));
			});
		}
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
					return LtxTagFactory.Construct("sa_newline", [], {});
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
		return LtxTagFactory.Construct(commandName, content, options);
	},
	parseOptions: function() {
		var args = {};
		var current = "";
		while (this.reader.hasNext()) {
			var value = this.reader.next();
			if (value == "]") {
				break;
			}
			else if (value == ",") {
				var s = partition(value, "=");
				var key = s[0], sep = s[1], val = s[2];
				args[key] = value;
				current = "";
			}
			else {
				current += value;
			}
		}
		return args;
	}
});
