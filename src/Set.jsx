var Set = (function() {

	var $map = new Symbol();

	function Set(iterable) {

		var iterator;

		this[$map] = new Map();

		if(iterable != null) {
			iterable = Object(iterable);
			if(iterable.iterator) {
				iterator = iterable.iterator();
				try {
					while(true) this.add(iterator.next());
				} catch(x) {
					if(x !== StopIteration) throw x;
				}
			} else if(typeof iterable.length == 'number') {
				for(var i = 0, l = iterable.length >>> 0; i < l; i++) {
					this.add(iterable[i]);
				}
			} else {
				for(var key in iterable) {
					this.add(iterable[key]);
				}
			}
		}

	}

	defineValuesWC(Set.prototype, {

		has: function has(value) {
			return this[$map].get(value);
		},

		add: function add(value) {
			this[$map].set(value, true);
		},

		delete: function _delete(value) {
			this[$map].delete(value);
		},

		values: function values() {
			this[$map].keys();
		}

	});

	defineValueWC(Set.prototype, 'iterator', Set.prototype.values);

	return Set;

})();