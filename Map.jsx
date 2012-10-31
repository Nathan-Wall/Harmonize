var Map = (function() {

	var DELETED = { DELETED: true },

		$weakMap = new Symbol(),
		$stringHash = new Symbol(),
		$numericHash = new Symbol(),
		$keys = new Symbol(),
		$values = new Symbol(),
		$activeIterators = new Symbol(),
		$pendingDeletion = new Symbol();

	function Map(iterable) {

		var S = Secrets(this), iterator, pair;

		this[$weakMap] = new WeakMap();
		this[$stringHash] = Object.create(null);
		this[$numericHash] = Object.create(null);
		this[$keys] = new SafeList();
		this[$values] = new SafeList();

		// activeIterators and pendingDeletion are used to keep iterators from skipping items if an item is deleted.
		this[$activeIterators] = 0;
		this[$pendingDeletion] = 0;

		if(iterable != null) {
			iterable = Object(iterable);
			if(iterable.iterator) {
				iterator = iterable.iterator();
				try {
					pair = Object(iterator.next());
					while(true) this.set(pair[0], pair[1]);
				} catch(x) {
					if(x !== StopIteration) throw x;
				}
			} else if(typeof iterable.length == 'number') {
				for(var i = 0, l = iterable.length >>> 0; i < l; i++) {
					pair = iterable[i];
					this.set(pair[0], pair[1]);
				}
			} else {
				for(var key in iterable) {
					this.set(key, iterable[key]);
				}
			}
		}

	}

	defineValuesWC(Map.prototype, {

		get: function get(key) {

			var map = getMap(this, key);
			if(typeof map.get == 'function') return map.get(key);
			else if(map) return map[fixKey(key)];

			// This path shouldn't really be followed, as all EcmaScript objects will be caught by
			// something above. However, it is possible a Host object will not be caught, so
			// we use this fallback just in case.
			return this[$values][ this[$keys].search(key) ];

		},

		set: function set(key, value) {

			var map;

			if(!this.has(key)) {
				this[$keys].push(key);
				this[$values].push(value);
			} else this[$values][ this[$keys].search(key) ] = value; // O(n) search. TODO: Improve, could store index in WeakMap?

			map = getMap(this, key);
			if(typeof map.set == 'function') map.set(key, value);

		},

		has: function has(key) {

			var map = getMap(this, key);
			if(typeof map.has == 'function') return map.has(key);
			else if(map) return fixKey(key) in map;

			return ~this[$keys].search(key);

		},

		delete: function _delete(key) {

			if(!this.has(key)) return false;

			var keys = this[$keys],
				values = this[$values],
				index;

			var map = getMap(this, key);
			if(typeof map.delete == 'function') map.delete(key);
			else if(map) delete map[fixKey(key)];

			index = keys.search(key);
			if(this[$activeIterators] == 0) {
				keys.splice(index, 1);
				values.splice(index, 1);
			} else {
				// Lazy delete in order to prevent iterators from skipping items.
				keys[index] = DELETED;
				this[$pendingDeletion]++;
			}

			return true;

		},

		items: function items() {
			var keys = this[$keys],
				values = this[$values],
				current = 0;
			this[$activeIterators]++;
			return {
				next: function next() {
					var activeIterators, pendingDeletion;
					if(current >= keys.length) {
						activeIterators = this[$activeIterators] - 1;
						this[$activeIterators] = activeIterators;
						if(activeIterators == 0) {
							pendingDeletion = this[$pendingDeletion];
							if(pendingDeletion > 0) {
								for(var i = 0; i < keys.length; i++)
									if(keys[i] == DELETED) {
										keys.splice(i, 1);
										values.splice(i, 1);
										i--;
										pendingDeletion--;
										if(pendingDeletion == 0) break;
									}
								this[$pendingDeletion] = 0;
							}
						}
						throw StopIteration;
					}
					do {
						current++;
					} while(keys[current - 1] == DELETED);
					return [ keys[current - 1], values[current - 1] ];
				}
			};
		},

		keys: function keys() {
			var items = this.items(),
				_next = items.next;
			items.next = function next() {
				return _next()[0];
			};
		},

		values: function values() {
			var items = this.items(),
				_next = items.next;
			items.next = function next() {
				return _next()[1];
			};
		}

	});

	defineValueWC(Map.prototype, 'iterator', Map.prototype.items);

	function getMap(map, key) {
		if (Object(key) === key) return map[$weakMap];
		else if (typeof key == 'string') return map[$stringHash];
		else if (typeof key == 'number' || typeof key == 'boolean' || key == null) {
			// null, undefined, true, and false get routed here because, as strings, they
			// don't conflict with any numbers.
			return map[$numericHash];
		}
	}

	function fixKey(key) {
		if (key === 0) return 1 / key === Infinity ? '+0' : '-0';
		else return String(key);
	}

	return Map;

})();