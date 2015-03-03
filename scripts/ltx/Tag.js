/* No need for an actual class here */
var LtxTagFactory = {
	tags: {},
	begins: {},
	Register: function(tagName, classRef) {
		this.tags[tagName] = classRef;
	},
	RegisterBegin: function(tagName, classRef) {
		this.begins[tagName] = classRef;
	},
	Construct: function(tagName, value, options) {
		if (tagName == "begin") {
			var name = value[0][0].value; //TODO: better way of doing this?
			//value.shift(); //remove first element
			return this.ConstructBegin(name, value, options);
		}
		if (tagName in this.tags) {
			return new this.tags[tagName](tagName, value, options);
		}
		else {
			return new LtxTag_Generic(tagName, value, options);
		}
	},
	ConstructBegin: function(tagName, value, options) {
		if (tagName in this.begins) {
			return new this.begins[tagName](tagName, value, options);
		}
		else {
			return new LtxTag_Begin(tagName, value, options);
		}
	}
};

var LtxTag = Class.create({
	initialize: function(name, value, options) {
		this.name = name;
		this.tname = name;
		this.value = value;
		this.options = options;
		
		this.body = [];
		
	}
});

var LtxString = Class.create(LtxTag, {
	initialize: function(value) {
		this.value = value;
	},
	toDOM: function() {
		var el = document.createTextNode(this.value);
		return el;
	}
})

var LtxComment = Class.create(LtxTag, {
	initialize: function(value) {
		this.value = value;
	},
	toDOM: function() {
		var el = document.createComment(this.value);
		return el;
	}
});

var LtxTag_Generic = Class.create(LtxTag,{
	toDOM: function() {
		if (this.name == "")
			return false;
		var el = document.createElement('ltxcmd-'+this.name);
		/*this.options.forEach(function(value) {
			el.setAttribute(strip(value[0]), strip(value[1]));
		});*/
		this.value.forEach(function(value) {
			if (Array.isArray(value)) {
				var parameter = document.createElement('ltx-value');
				value.forEach(function(ivalue) {
					var res = ivalue.toDOM();

					parameter.appendChild(res);
					
				});
				el.appendChild(parameter);
			}
		});


		return el;
	},
	tidy: function() { }
});

var LtxTag_Begin = Class.create(LtxTag_Generic, {
	initialize: function($super, name, value, options) {
		$super("begin", value, options); //forcing name is for compatibility with old code
		this.beginName = name;
	},
	toDOM: function($super) {
		var el = $super();
		
		//our CSS needs to know the tag type
		el.setAttribute("begintype", this.beginName);
		
		if (this.body !== undefined && Array.isArray(this.body)) {
			var content = document.createElement('ltx-content');
			this.body.forEach(function(value) {
				
				var res = value.toDOM();
				if (res)
					content.appendChild(res);
			});
			el.appendChild(content);
		}

		
		return el;
	},
	tidy: function() { }
});

{
	var lstclass = new Class.create(LtxTag_Begin, {
		tidy: function() {
			var p = this;
			var vals = this.body;
			this.body = [];
			var citem = null;
			var current = [];
			vals.forEach(function(value) {
				if (value.name == "item")
				{
					if (citem != null)
					{
						citem.value[0] = current;
						current = [];
						p.body.push(citem);
					}
					citem = value;
				}
				else
				{
					current.push(value);
				}
			});
			//at this point, there's still likely text in the 'current' buffer
			if (current.length > 0) {
				citem.value[0] = current;
				p.body.push(citem);
			}
		}
	});
	LtxTagFactory.RegisterBegin("enumerate", lstclass);
	LtxTagFactory.RegisterBegin("itemize", lstclass);
}

{
	var tableclass = new Class.create(LtxTag_Begin, {
		toDOM: function() {
			var el = document.createElement('ltxcmd-tabular');
			var cRow = document.createElement('ltx-tab-row');
			var cCol = document.createElement('ltx-tab-col');
			var hline = false;
			var vline = false;
			console.log(this.body);
			this.body.forEach(function(value) {
				if (value.name == "sa_separator") {
					cCol.setAttribute("vline", vline);
					cRow.appendChild(cCol);
					
					cCol = document.createElement('ltx-tab-col');
				}
				else if (value.name == "sa_newline") {
					cCol.setAttribute("vline", vline);
					cRow.appendChild(cCol);
					
					cRow.setAttribute("hline", hline);
					el.appendChild(cRow);
					
					cCol = document.createElement('ltx-tab-col');
					cRow = document.createElement('ltx-tab-row');
					
					
					hline = false;
					vline = false;
				}
				else if (value.name == "hline") {
					hline = true;
				}
				else if (value.name == "vline") {
					vline = true;
				}
				else {
					var res = value.toDOM();
					if (res)
						cCol.appendChild(res);
				}
			});
			return el;
		}
	});
	
	LtxTagFactory.RegisterBegin("tabular", tableclass);
	LtxTagFactory.RegisterBegin("tabularx", tableclass);
	LtxTagFactory.RegisterBegin("tabulary", tableclass);
}