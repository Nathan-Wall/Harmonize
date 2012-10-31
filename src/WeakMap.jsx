var WeakMap = (function() {

	var $instanceId = new Symbol(),
		$keys = new Symbol(),
		$values = new Symbol();

	function WeakMap() {

		this[$instanceId] = (function() {
			var symbol = new Symbol();
			// Allow this symbol to work even if the object is frozen.
			// This will allow the WeakMap to function as even if the object is frozen, which is expected.
			symbol.freezable = false;
			return symbol;
		})();

		// We fall back to keys and values arrays when the key is made unextensible from another frame.
		// Though leaky, this is an extreme case, and shouldn't occur often.
		this[$keys] = new SafeList();
		this[$values] = new SafeList();

	}

	defineValuesWC(WeakMap.prototype, {

		get: function get(key) {

			checkVars(this, key);

			var keys, values,

				value = key[this[$instanceId]];

			if(value) return value;

			keys = this[$keys];
			values = this[$values];

			return values[keys.indexOf(key)];

		},

		set: function set(key, value) {
			// TODO: Should there be a return value?

			checkVars(this, key);

			var keys, values, index, check,

				instanceId = this[$instanceId];

			try { key[instanceId] = value; }
			catch(x) { }

			check = key[instanceId];
			if (
				check === value
				// NaN
				|| typeof check == 'number'
					&& typeof value == 'number'
					&& check !== check
					&& value !== value
			) return;
			else if(key.hasOwnProperty(iid))
				throw new TypeError('Could not store with key ' + key + '.');

			keys = this[$keys];
			values = this[$values];
			index = keys.indexOf(key);
			if(~index) values[index] = value;
			else {
				keys.push(key);
				values.push(value);
			}

		},

		has: function has(key) {

			checkVars(this, key);

			var instanceId = this[$instanceId],

				keys;

			if(key.hasOwnProperty(instanceId)) return true;

			keys = this[$keys];
			return !!~keys.indexOf(key);

		},

		delete: function _delete(key) {

			checkVars(this, key);

			var instanceId = this[$instanceId],

				keys, values, index;

			if(key.hasOwnProperty(instanceId)) {
				if(Symbol.__useDeleteFrom__)
					return instanceId.deleteFrom(key);
				else if(delete key[instanceId]) return true;
			}

			keys = this[$keys];
			values = this[$values];
			index = keys.indexOf(key);
			if(!~index) return false;
			keys.splice(index, 1);
			values.splice(index, 1);
			return true;

		}

	});

	function checkVars(obj, key) {

		if (Object(obj) !== obj)
			throw new TypeError('this is not an object: ' + obj);

		if (!obj[$instanceId])
			throw new TypeError('this is not a WeakMap: ' + obj);

		if(Object(key) != key)
			throw new TypeErro('key is not an object: ' + key);

	}

	return WeakMap;

})();