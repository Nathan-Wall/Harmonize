(function() {

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

	!!!includes('SymbolsForES5');

	var _global = (0, eval)('this'),

		shims = {
			WeakMap: WeakMap,
			Map: Map,
			Set: Set
		};

	Object.keys(shims).forEach(function(key) {
		if(!_global[key]) _global[key] = shims[key];
	});

	function defineValueWC(obj, name, value) {
		Object.defineProperty(obj, name, {
			value: value,
			enumerable: false,
			writable: true,
			configurable: true
		});
	}

	function defineValuesWC(obj, map) {
		Object.keys(map).forEach(function(key) {
			defineValueWC(obj, key, map[key]);
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

		Object.keys(methods).forEach(function(name) {
			if (!(name in obj))
				Object.defineProperty(obj, name, {
					value: methods[name],
					enumerable: enumerable,
					writable: writable,
					configurable: configurable
				});
		});

	}

})();