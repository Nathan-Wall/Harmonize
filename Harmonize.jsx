(function(Object, String, Number, Error, TypeError, RangeError, isNaN, Infinity, NaN) {

	'use strict';

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
		|| !Object.isExtensible
	) return;

	var _SymbolsForES5_exports = { },
		undefined,

		lazyBind = Function.prototype.bind.bind(Function.prototype.call),

		// We use these as functions rather than methods so that changes to Object and Array.prototype can't gain
		// unwelcome access to the internal workings of our shims.

		keys = Object.keys,
		create = Object.create,
		freeze = Object.freeze,
		seal = Object.seal,
		isFrozen = Object.isFrozen,
		isSealed = Object.isSealed,
		getOwnPropertyNames = Object.getOwnPropertyNames,
		getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
		getPrototypeOf = Object.getPrototypeOf,
		defineProperty = Object.defineProperty,
		hasOwn = lazyBind(Object.prototype.hasOwnProperty),
		toString = lazyBind(Object.prototype.toString),

		call = lazyBind(Function.prototype.call),

		indexOf = lazyBind(Array.prototype.indexOf),
		forEach = lazyBind(Array.prototype.forEach),
		splice = lazyBind(Array.prototype.splice),
		sort = lazyBind(Array.prototype.sort),
		push = lazyBind(Array.protoype.push),
		concat = lazyBind(Array.prototype.concat),

		charCodeAt = lazyBind(String.prototype.charCodeAt),
		StringSlice = lazyBind(String.prototype.slice),
		StringIndexOf = lazyBind(String.prototype.indexOf),

		floor = Math.floor,
		abs = Math.abs,
		min = Math.min,
		max = Math.max;

	!!!includes('SymbolsForES5');

	var _global = (0, eval)('this'),

		Secrets = _SymbolsForES5_exports.Secrets,

		shims = {
			$$iterator: $$iterator,
			$$toStringTag: $$toStringTag,
			StopIteration: StopIteration,
			WeakMap: WeakMap,
			Map: Map,
			Set: Set
		},

		is = Object.is;

	forEach(keys(shims), function(key) {
		if(typeof _inHarmony_forceShim == 'boolean' && _inHarmony_forceShim || !_global[key])
			_global[key] = shims[key];
	});

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