//manages page itself
var main = Class.create({
	initialize: function() {
		//make all the hooks here
		
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

var reader = Class.create({
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
		var val = this.collecton[this.offset];
		if (val == '%' and this.collection[this.offset - 1] != '\\') {
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

var lexer = Class.create({
	
});