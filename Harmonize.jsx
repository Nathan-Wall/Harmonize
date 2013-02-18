(function(Object, String, Number, Error, TypeError, RangeError, isNaN, Infinity, NaN) {

	'use strict';

	// TODO: Get a better detection & shimming system so that this isn't required.
	// Note: There's currently no way to forceShim on Node without modifying this file.
	var forceShim = typeof __Harmonize__ == 'object'
		&& __Harmonize__ != null
		&& __Harmonize__.forceShim;

	// TODO: BinaryData. We have decided not to implement BinaryData at this time because rev 11 of the draft states
	// that this section will be changed significantly, and warns not to waste too much time on it. We will wait for
	// a more final version.

	// If this is not an ES5 environment, we can't do anything.
	if (
		/* We'll at least need the following functions.
		 * While not exhaustive, this should be a good enough list to make sure
		 * we're in an ES5 environment.
		 */
		!Object.getOwnPropertyNames
		|| !Object.getOwnPropertyDescriptor
		|| !Object.defineProperty
		|| !Object.defineProperties
		|| !Object.keys
		|| !Object.create
		|| !Object.freeze
		|| !Object.isFrozen
		|| !Object.isExtensible)
		return;

	!!!standAlone(!!!include('../Secrets/Secrets.js'));

	var undefined,

		_global = (0, eval)('this'),

		lazyBind = Function.prototype.bind.bind(Function.prototype.call),

		// We use these as functions rather than methods so that changes to Object and Array.prototype can't gain
		// unwelcome access to the internal workings of our shims.

		keys = Object.keys,
		create = Object.create,
		freeze = Object.freeze,
		seal = Object.seal,
		isFrozen = Object.isFrozen,
		isSealed = Object.isSealed,
		isExtensible = Object.isExtensible,
		getOwnPropertyNames = Object.getOwnPropertyNames,
		getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
		getPrototypeOf = Object.getPrototypeOf,
		defineProperty = Object.defineProperty,
		hasOwn = lazyBind(Object.prototype.hasOwnProperty),
		toString = lazyBind(Object.prototype.toString),

		call = lazyBind(Function.prototype.call),
		bind = lazyBind(Function.prototype.bind),

		indexOf = lazyBind(Array.prototype.indexOf),
		forEach = lazyBind(Array.prototype.forEach),
		splice = lazyBind(Array.prototype.splice),
		sort = lazyBind(Array.prototype.sort),
		push = lazyBind(Array.prototype.push),
		concat = lazyBind(Array.prototype.concat),

		charCodeAt = lazyBind(String.prototype.charCodeAt),
		StringSlice = lazyBind(String.prototype.slice),
		StringIndexOf = lazyBind(String.prototype.indexOf),

		floor = Math.floor,
		abs = Math.abs,
		min = Math.min,
		max = Math.max,

		Secrets = (function() {
			var $ = createSecret(),
				SecretsMethods = {
					get: function get(name) {
						return this.store[name];
					},
					// Note: This is really `hasOwn` because ECMAScript does not allow prototypal
					// inheritence of internal properties. :(
					has: function hasOwn_(name) {
						return hasOwn(this.store, name);
					},
					set: function set(name, value) {
						return this.store[name] = value;
					},
					delete: function delete_(name) {
						return delete this.store[name];
					}
				};
			return function Secrets(obj) {
				if (obj == null)
					throw new TypeError('Cannot call Secrets on null or undefined.');
				var O = Object(obj),
					secrets = $(O);
				if (secrets && !hasOwn(secrets, 'store')) {
					secrets.store = create(null);
					forEach(keys(SecretsMethods), function(key) {
						secrets[key] = SecretsMethods[key];
					});
				}
				return secrets;
			}
		})(),

		// Symbol operators:
		$$HAS = function($obj, symbolName) {
			return symbolName in $obj;
		},
		$$DELETE = function($obj) {
			return delete $obj[symbolName];
		},

		$$ = (function() {
			var _$$ = createSecret();
			return function(/* symbolOperator, */obj, symbolName/*, value */) {
				// This function should be possible to write in a way that would be
				// compatible with ES6 symbols.
				// TODO: When ES6 symbols are implemented, rewrite this to work with @@iterator, etc.
				if (arguments[0] === $$HAS
					|| arguments[0] === $$DELETE) {
					return arguments[0](_$$(arguments[1]), arguments[2]);
				}
				if (arguments.length > 2)
					return _$$(obj)[symbolName] = arguments[2];
				else
					return _$$(obj)[symbolName];
			};
		})();

	!!!includes('WeakMap.jsx');

	var shims = {
			StopIteration: StopIteration,
			WeakMap: WeakMap,
			Map: Map,
			Set: Set,
			Reflect: Reflect
		},

		is = Object.is;

	// Shim to global.
	forEach(keys(shims), function(key) {
		if (!(key in _global) || forceShim)
			_global[key] = shims[key];
	});

	// Export createSecret.
	if (typeof exports == 'object' && exports != null) {
		exports.createSecret = createSecret;
		exports.$$ = $$;
	}

	function defineValueWC(obj, name, value) {
		defineProperty(obj, name, own({
			value: value,
			enumerable: false,
			writable: true,
			configurable: true
		}));
	}

	function defineValuesWC(obj, map) {
		forEach(keys(map), function(key) {
			var desc = own(Object.getOwnPropertyDescriptor(map, key)),
				value = desc.value;
			if (value)
				defineValueWC(obj, key, value);
			else {
				desc.enumerable = false;
				desc.configurable = true;
				defineProperty(obj, key, desc);
			}
		});
	}

	function shimProps(obj/*, ?attrs, methods */) {

		var attrs, methods,
			enumerable = false, writable = true, configurable = true;

		if (arguments.length > 2) {

			attrs = arguments[1];
			methods = arguments[2];

			if ('enumerable' in attrs) enumerable = attrs.enumerable;
			if ('writable' in attrs) writable = attrs.writable;
			if ('configurable' in attrs) configurable = attrs.configurable;

		} else methods = arguments[1];

		forEach(keys(methods), function(name) {
			if (!(name in obj))
				defineProperty(obj, name, own({
					value: methods[name],
					enumerable: enumerable,
					writable: writable,
					configurable: configurable
				}));
		});

	}

	function getTagOf(obj) {
		return StringSlice(toString(obj), 8, -1);
	}

	function getPropertyDescriptor(obj, key) {

		// TODO: symbols -- also for Object.getOwnPropertyDescriptor (if symbols should work with that)
		// TODO: coerce obj?

		if (!(key in obj))
			return;

		var desc = getOwnPropertyDescriptor(obj, key)
			|| getPropertyDescriptor(getPrototypeOf(obj), key);

	}

	function own(obj) {

		var O = create(null);

		forEach(getOwnPropertyNames(obj), function(key) {
			defineProperty(O, key,
				getOwnPropertyDescriptor(obj, key));
		});

		return O;

	}

})(Object, String, Number, Error, TypeError, RangeError, isNaN, Infinity, NaN);