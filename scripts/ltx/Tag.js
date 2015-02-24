var LtxTag = Class.create({
	initialize: function(name, value, options) {
		this.name = name;
		this.tname = name;
		this.value = value;
		this.options = options;
		
		this.body = [];
		
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

		if (this.body !== undefined && Array.isArray(this.body)) {
			var content = document.createElement('ltx-content');
			this.body.forEach(function(value) {
				
				var res = value.toDOM();
				if (res)
					content.appendChild(res);
			});
			el.appendChild(content);
		}
		if (this.name == "begin") {
			el.setAttribute("begintype", this.value[0][0].value);
		}
		return el;

	},
	tidy: function() {
		if (this.value[0][0].value == "enumerate")
		{
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
