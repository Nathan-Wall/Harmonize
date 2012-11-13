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

	var _SymbolsForES5_exports = { },

		// We use these as functions rather than methods so that changes to Object and Array.prototype can't gain
		// unwelcome access to the internal workings of our shims.
		create = Object.create,
		splice = Function.prototype.call.bind(Array.prototype.splice),
		push = Function.prototype.call.bind(Array.prototype.push);

	(function(exports) {

	'use strict';

	if (
	/* If this is not an ES5 environment, we can't do anything.
	 * We'll at least need the following functions.
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

	/* Retrieve the global object using an indirect eval.
	 * This should work in ES5 compliant environments.
	 * See: http://perfectionkills.com/global-eval-what-are-the-options/#indirect_eval_call_theory
	 */
	var _global = (0, eval)('this');

	// If Symbol is already defined, there's nothing to do.
	if (_global.Symbol) return;

	var Secrets = (function(Object) {
	// TODO: Override Object.create so that it returns an object which works with Symbols (it currently doesn't work because Symbols are set up to work with objects which inherit from Object.prototype).

	var lazyBind = Function.prototype.bind.bind(Function.prototype.call),

		// ES5 functions
		create = Object.create,
		getPrototypeOf = Object.getPrototypeOf,
		isExtensible = Object.isExtensible,
		isFrozen = Object.isFrozen,
		freeze = Object.freeze,
		keys = Object.keys,
		getOwnPropertyNames = Object.getOwnPropertyNames,
		getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
		defineProperty = Object.defineProperty,
		hasOwn = lazyBind(Object.prototype.hasOwnProperty),
		push = lazyBind(Array.prototype.push),
		forEach = lazyBind(Array.prototype.forEach),
		filter = lazyBind(Array.prototype.filter),
		fromCharCode = String.fromCharCode,

		// ES Harmony functions
		getPropertyNames = Object.getPropertyNames,

		// ES.next strawman functions
		getPropertyDescriptors = Object.getPropertyDescriptors,
		getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors,

		// ES Harmony constructors
		_Proxy = typeof Proxy == 'undefined' ? undefined : Proxy,

		// A property name can be prepped to be exposed when object[SECRET_KEY] is accessed.
		preppedName,
		freezable = true,

		// Determines whether object[SECRET_KEY] on an object which doesn't have a SECRET_KEY property
		// should define itself. This is turned off when checking the prototype chain.
		autoDefine = true,

		// Determines whether object[SECRET_KEY] should expose the secret map.
		locked = true,

		random = getRandomGenerator(),
		// idNum will ensure identifiers are unique.
		idNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
		preIdentifier = randStr(7) + '0',
		SECRET_KEY = '!S:' + getIdentifier();

	(function() {
		// Override get(Own)PropertyNames and get(Own)PropertyDescriptors

		var overrides = create(null);

		overrides.getOwnPropertyNames = getOwnPropertyNames
		if (getPropertyNames) overrides.getPropertyNames = getPropertyNames;

		keys(overrides).forEach(function(u) {
			var original = overrides[u];
			defineProperty(Object, u, {
				value: function(obj) {
					return filter(original.apply(this, arguments), function(u) {
						return u != SECRET_KEY;
					});
				},
				enumerable: false,
				writable: true,
				configurable: true
			});
		});

		overrides = create(null);

		if (getPropertyDescriptors) overrides.getPropertyDescriptors = getPropertyDescriptors;
		if (getOwnPropertyDescriptors) overrides.getOwnPropertyDescriptors = getOwnPropertyDescriptors;

		keys(overrides).forEach(function(u) {
			var original = overrides[u];
			defineProperty(Object, u, {
				value: function(obj) {
					var desc = original.apply(this, arguments);
					delete desc[SECRET_KEY];
					return desc;
				},
				enumerable: false,
				writable: true,
				configurable: true
			});
		});

	})();

	// Override functions which prevent extensions on objects to go ahead and add a secret map first.
	[ 'preventExtensions', 'seal', 'freeze' ].forEach(function(u) {
		var original = Object[u];
		defineProperty(Object, u, {
			value: function(obj) {
				// Define the secret map.
				Secrets(obj);
				return original.apply(this, arguments);
			}
		});
	});

	if (typeof _Proxy == 'function') {

		Proxy = (function() {
			/* TODO: This works for "direct_proxies", the current ES6 draft; however, some browsers have
			 * support for an old draft (such as FF 17 and below) which uses Proxy.create(). Should this
			 * version be overridden to protect against discovery of SECRET_KEY on these browsers also?
			 */

			var trapBypasses = create(null);
			trapBypasses.defineProperty = defineProperty;
			trapBypasses.hasOwn = hasOwn;
			trapBypasses.get = function(target, name) { return target[name]; };

			return function Proxy(target, traps) {

				if (!(this instanceof Proxy)) {
					// TODO: The new keyword wasn't used. What should be done?
					return new Proxy(target, traps);
				}

				var _traps = create(traps);

				keys(trapBypasses).forEach(function(trapName) {
					var bypass = trapBypasses[trapName];
					if (typeof traps[trapName] == 'function') {
						// Override traps which could discover SECRET_KEY.
						_traps[trapName] = function(target, name) {
							if (name === SECRET_KEY) {
								// Bypass any user defined trap when name === SECRET_KEY.
								return bypass.apply(null, arguments);
							}
							return traps[trapName].apply(this, arguments);
						};
					}
				});

				return new _Proxy(target, _traps);
			};

		})();

	} else if (_Proxy && _Proxy.create) {

//		Proxy.create = (function() {
//
//			return function create(traps, proto) {
//				// TODO
//			};
//
//		})();

	}

	// Allow Symbol properties to be accessed as keys.
	// Note: this monkey patch prevents Object.prototype from having its own secretMap.
	// Therefore, Secrets(Object.prototype) will fail.
	defineProperty(Object.prototype, SECRET_KEY, {

		get: function() {
			if (!autoDefine) return;
			if (this === Object.prototype) return;
			if (preppedName === undefined) return;
			// null and undefined can't have properties and are non-coercible.
			if (this == null) return;
			var name = preppedName;
			preppedName = undefined;
			autoDefine = false;
			var value = Secrets(this, name);
			autoDefine = true;
			return value;
		},

		set: function(value) {
			if (!autoDefine) return;
			if (this === Object.prototype) return;
			if (preppedName === undefined) return;
			// null and undefined can't have properties and are non-coercible.
			if (this == null) return;
			Secrets(this);
			this[SECRET_KEY] = value;
		},

		enumerable: false,
		configurable: false

	});

	// Override hasOwnProperty to work with preppedNames.
	defineProperty(Object.prototype, 'hasOwnProperty', {

		value: function hasOwnProperty(name) {

			var N = String(name),
				value;

			if (N == SECRET_KEY) {

				if (locked) {
					if (!preppedName) return false;
					var name = preppedName;
					preppedName = undefined;
					value = Secrets(this).hasOwn(name);
					return value;
				}

				return hasOwn(this, SECRET_KEY);

			} else return hasOwn(this, name);

		},

		enumerable: false,
		writable: true,
		configurable: true

	});

	var methods = {

		set: function setSecretProperty(O, name, value) {

			// Prevent secret properties from disobeying Object.freeze and Object.preventExtensions
			// unless freezable is false.
			if (!permitChange(this, O, name, true))
				throw new TypeError('Can\'t set property; object is frozen or not extensible.');

			locked = false;
			O[SECRET_KEY][name] = value;

			return value;

		},

		get: function getSecretProperty(O, name) {
			var secretMap, secretProp;
			name = String(name);
			// Turn off autoDefine because we'll be checking the prototype chain
			autoDefine = false;
			do {
				locked = false;
				secretMap = O[SECRET_KEY];
				// We check in case the prototype doesn't have a secret map.
				secretProp = secretMap && secretMap[name];
				if (secretProp !== undefined) {
					autoDefine = true;
					return secretProp;
				}
			} while (O = getPrototypeOf(O));
			autoDefine = true;
		},

		getOwn: function getOwnSecretProperty(O, name) {
			locked = false;
			return O[SECRET_KEY][name];
		},

		has: function hasSecretProperty(O, name) {
			// Doesn't use get because can't distinguish between value *set* to undefined and unassigned.
			var secretMap;
			name = String(name);
			// Turn off autoDefine because we'll be checking the prototype chain
			autoDefine = false;
			do {
				locked = false;
				secretMap = O[SECRET_KEY];
				if (secretMap && name in secretMap) {
					autoDefine = true;
					return true;
				}
			} while (O = getPrototypeOf(O));
			autoDefine = true;
			return false;
		},

		hasOwn: function hasOwnSecretProperty(O, name) {
			locked = false;
			return name in O[SECRET_KEY];
		},

		delete: function deleteSecretProperty(O, name, _freezable) {
			freezable = _freezable;
			if (!permitChange(this, O, name, true))
				throw new TypeError('Can\'t delete property from ' + O);
			locked = false;
			return delete O[SECRET_KEY][name];
		}

	};

	defineProperty(Secrets, 'version', {
		value: freeze({
			major: 1,
			minor: 1,
			revision: 0,
			alpha: true
		}),
		enumerable: true
	});

	extend(Secrets, {

		// Note to users of this library:
		// Consider deleting the following properties if they are not used by the outside.

		SECRET_KEY: SECRET_KEY,

		prepName: function prepName(name, _freezable) {
			// Allows one access to Secrets(object).get(preppedName)
			// via object[SECRET_KEY] while in locked mode.
			freezable = _freezable;
			preppedName = String(name);
		},

		getIdentifier: getIdentifier,

		toString: function toString() {
			return '[ Secrets '
				+ [
					Secrets.version.major, Secrets.version.minor, Secrets.version.revision
				].join('.')
				+ ' ]';
		}

	});

	return Secrets;

	function Secrets(O, name) {
		if(O === Object.prototype) return;
		if (O !== Object(O)) throw new Error('Not an object: ' + O);
		if (!hasOwn(O, SECRET_KEY)) {
			if (!autoDefine) return;
			if (!isExtensible(O)) return;
			defineProperty(O, SECRET_KEY, {

				get: (function() {
					var secretMap = create(
						// Prevent the secret map from having a prototype chain.
						null,
						{
							Secrets: { value: preloadMethods(methods, O) }
						}
					);
					return function getSecret() {
						var value;
						// The lock protects against retrieval in the event that the SECRET_KEY is found.
						if (locked) {
							if (!preppedName) return;
							var name = preppedName;
							preppedName = undefined;
							value = secretMap.Secrets.get(name);
							return value;
						}
						locked = true;
						return secretMap;
					};
				})(),

				set: function setSecret(value) {
					// Weird Chrome behavior where getOwnPropretyNames seems to call object[key] = true...
					// Let's ignore it.
					if(preppedName === undefined) return;
					var ret;
					locked = false;
					var name = preppedName;
					preppedName = undefined;
					ret = this[SECRET_KEY].Secrets.set(name, value);
					return ret;
				},

				enumerable: false,
				configurable: false

			});
		}
		locked = false;
		if (name) return O[SECRET_KEY].Secrets.get(name);
		return O[SECRET_KEY].Secrets;
	}

	function getIdentifier() {
		var range = 125 - 65, idS = '';
		idNum[0]++;
		for(var i = 0; i < idNum.length; i++) {
			if (idNum[i] > range) {
				idNum[i] = 0;
				if (i < idNum.length) idNum[i + 1]++;
				else idNum = idNum.map(function() { return 0; });
			}
			idS += encodeStr(idNum[i]);
		}
		return preIdentifier + ':' + getRandStrs(8, 11).join('/') + ':' + idS;
	}

	function permitChange(methods, O, name, checkExtensible) {
		var _freezable = freezable;
		freezable = true;
		return !(_freezable && (
				isFrozen(O)
				|| checkExtensible && !isExtensible(O) && !methods.hasOwn(name)
			));
	}

	function encodeStr(num) {
		return fromCharCode(num + 65);
	}

	function getRandStrs(count, length) {
		var r = [ ];
		for(var i = 0; i < count; i++) {
			push(r, randStr(length));
		}
		return r;
	}

	function randStr(length) {
		var s = '';
		for (var i = 0; i < length; i++) {
			s += encodeStr(random() * (125 - 65 + 1));
		}
		return s;
	}

	function getRandomGenerator() {
		var getRandomValues
			= typeof crypto != 'undefined' && crypto != null
				? (function() {
					var f = crypto.random || crypto.getRandomValues;
					if (f) return f.bind(crypto);
					return undefined;
				})()
				: undefined;
		if (getRandomValues) {
			// Firefox (15 & 16) seems to be throwing a weird "not implemented" error on getRandomValues.
			// Not sure why?
			try { getRandomValues(new UIntArray(4)); }
			catch(x) { getRandomValues = undefined }
		}
		if (typeof getRandomValues == 'function' && typeof Uint8Array == 'function') {
			return (function() {
				var values = new Uint8Array(4), index = 4;
				return function random() {
					if (index >= values.length) {
						getRandomValues(values);
						index = 0;
					}
					return values[index++] / 256;
				};
			})();
		} else return Math.random;
	}

	function preloadMethods(methods, arg) {
		var bound = create(null);
		keys(methods).forEach(function(method) {
			bound[method] = methods[method].bind(bound, arg);
		});
		return bound;
	}

	function extend(extendWhat, extendWith) {
		forEach(keys(extendWith), function(key) {
			defineProperty(extendWhat, key, getOwnPropertyDescriptor(extendWith, key));
		});
	}

// We pass in Object to ensure that it cannot be changed later to something else.
})(Object);
var Symbol = (function() {

	function Symbol(/* params */) {
		// TODO: I think some of the code that's intended to make Symbol work should be pulled
		// out of Secrets and put here instead ... such as the Object.prototype[SECRET_KEY] getter
		// and the handling of freezable.

		Secrets(this).set('id', '!Y:' + Secrets.getIdentifier());

	}

	Object.defineProperties(Symbol.prototype, {

		toString: {
			value: function() {
				var S = Secrets(this);
				Secrets.prepName(S.get('id'), this.freezable);
				return Secrets.SECRET_KEY;
			},
			enumerable: false,
			writable: true,
			configurable: true
		},

		// We can't simulate "delete obj[symbol]" in ES5. So we'll have to resort to
		// "symbol.deleteFrom(obj)" in this situation.
		deleteFrom: {
			value: function(obj) {
				var S = Secrets(obj), T = Secrets(this);
				if (!S || !T) return false;
				return S.delete(T.get('id'), this.freezable);
			},
			enumerable: false,
			writable: true,
			configurable: true
		},

		// We also can't simulate "symbol in obj" in ES5. So we'll have to resort to
		// "symbol.isIn(obj)" in this situation.
		isIn: {
			value: function(obj) {
				var S = Secrets(obj), T = Secrets(this);
				if (!S || !T) return false;
				return S.has(T.get('id'));
			},
			enumerable: false,
			writable: true,
			configurable: true
		},

		freezable: {
			value: true,
			enumerable: false,
			writable: true,
			configurable: true
		}

	});

	Object.defineProperties(Symbol, {
		'__useDeleteFrom__': {
			value: true,
			enumerable: false,
			writable: true,
			configurable: true
		},
		'__useIsIn__': {
			value: true,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	return Symbol;

})();

	_global.Symbol = Symbol;

	if (exports)
		exports.Secrets = Secrets;

})(typeof _SymbolsForES5_exports == 'undefined' ? undefined : _SymbolsForES5_exports);
// TODO: Can we use @@iterator if in ES6 environment?
var $$iterator = new Symbol();

// TODO: Can we use @@toStringTag if in ES6 environment?
var $$toStringTag = new Symbol();

(function() {

	shimProps(Array, {

		of: function of(/* ...items */) {

			var items = arguments;

			// 1. Let lenValue be the result of calling the [[Get]] internal method of items with the argument "length".
			var lenValue = items.length;

			// 2. Let len be ToInteger(lenValue).
			var len = Number.toInt(lenValue);

			// 3. Let C be the this value.
			var C = this;

			var newObj, A;

			// 4. If isConstructor(C) is true, then
			if (typeof C == 'function') {

				try {

					// a. Let newObj be the result of calling the [[Construct]] internal method of C with an argument
					// list containing the single item len.
					newObj = new C(len);

					// b. Let A be ToObject(newObj).
					A = Object(newObj);

				} catch(x) {
					// C was not a constructor.
				}

			}

			// 5. Else,
			if (A === undefined)
				// a. Let A be the result of the abstract operation ArrayCreate (15.4) with argument len.
				A = new Array(len);

			// 6. ReturnIfAbrupt(A).

			// 7. Let k be 0.
			var k = 0;

			var Pk, kValue;

			// 8. Repeat, while k < len
			while (k < len) {

				// a. Let Pk be ToString(k).
				Pk = String(k);

				// b. Let kValue be the result of calling the [[Get]] internal method of items with argument Pk.
				kValue = items[Pk];

				// c. Let defineStatus be the result of calling the [[DefineOwnProperty]] internal method of A with
				// arguments Pk, Property Descriptor {[[Value]]: kValue.[[value]], [[Writable]]: true, [[Enumerable]]: true,
				// [[Configurable]]: true}, and true.
				// d. ReturnIfAbrupt(defineStatus).
				A[Pk] = kValue;

				// e. Increase k by 1.
				k++;

			}

			// 9. Let putStatus be the result of calling the [[Put]] internal method of A with arguments "length", len,
			// and true.
			// 10. ReturnIfAbrupt(putStatus).
			A.length = len;

			// 11. Return A.
			return A;

		},

		from: function from(arrayLike) {

			// 1. Let items be ToObject(arrayLike).
			// 2. ReturnIfAbrupt(items).
			var items = Object(arrayLike);

			// 3. Let lenValue be the result of calling the [[Get]] internal method of items with the argument "length".
			var lenValue = items.length;

			// 4. Let len be ToInteger(lenValue).
			// 5. ReturnIfAbrupt(len).
			var len = Number.toInteger(lenValue);

			// 6. Let C be the this value.
			var C = this;

			var newObj, A;

			// 7. If isConstructor(C) is true, then
			if (typeof C == 'function') {
				try {

					// a. Let newObj be the result of calling the [[Construct]] internal method of C with an argument
					// list containing the single item len.
					newObj = new C(len);

					// b. Let A be ToObject(newObj).
					A = Object(newObj);

				} catch(x) {

				}
			}

			// 8. Else,
			if (A === undefined)

				// a. Let A be the result of the abstract operation ArrayCreate (15.4) with argument len.
				A = new Array(len);

			// 9. ReturnIfAbrupt(A).

			// 10. Let k be 0.
			var k = 0;

			var Pk, kPresent, kValue;

			// 11. Repeat, while k < len
			while (k < len) {

				// a. Let Pk be ToString(k).
				Pk = String(k);

				// b. Let kPresent be the result of calling the [[HasProperty]] internal method of items with
				// argument Pk.
				kPresent = Pk in items;

				// c. If kPresent is true, then
				if (kPresent) {

					// i. Let kValue be the result of calling the [[Get]] internal method of items with argument Pk.
					// ii. ReturnIfAbrupt(kValue).
					kValue = items[Pk];

					// iii. Let defineStatus be the result of calling the [[DefineOwnProperty]] internal method of A
					// with arguments Pk, Property Descriptor {[[Value]]: kValue.[[value]], [[Writable]]: true,
					// [[Enumerable]]: true, [[Configurable]]: true}, and true.
					// iv.	ReturnIfAbrupt(defineStatus).
					A[Pk] = kValue;

				}

				// d.	Increase k by 1.
				k++;

			}

			// 12. Let putStatus be the result of calling the [[Put]] internal method of A with arguments "length",
			// len, and true.
			// 13. ReturnIfAbrupt(putStatus).
			A.length = len;

			// 14. Return A.
			return A;

		}

	});

	shimProps(Array.prototype, {

		contains: (function() {
			var indexOf = Function.prototype.call.bind(Array.prototype.indexOf);
			return function contains(value) {
				// Note: It's uncertain whether this will go with egal, ===, or a mixture from recent ES6 discussions.
				// For now, we have chosen to throw if 0 or NaN is used, since we don't know how ES6 will behave in these
				// circumstances. That should make this implementation a subset of the future ES6 specification, which will
				// prevent code using it from breaking once the ES6 specification version is complete and implemented.
				// TODO: Keep up with the spec as it evolves and what algorithm it ends up using for comparison.

				if (value !== value || value === 0)
					throw new Error('Invalid value: ' + value);

				var O = Object(this),
					L = O.length >>> 0;

				// We also expect the spec will allow contains to be called on non-objects, but we throw for now because
				// it is the most forward compatible solution (just in case the spec ends up throwing for non-objects).
				if (O !== this)
					throw new Error('contains called on non-object.');

				return !!~indexOf(O, value);

			}
		})(),

		items: function items() {
			// 15.4.4.23 Array.prototype.items ( )
			// The following steps are taken:

			// 1. Let O be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(O).
			var O = Object(this);

			// 3. Return the result of calling the CreateArrayIterator abstract operation with arguments O and
			// "key+value".
			return CreateArrayIterator(O, 'key+value');

		},

		keys: function keys() {
			// 15.4.4.24 Array.prototype.keys ( )
			// The following steps are taken:

			// 1. Let O be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(O).
			var O = Object(this);

			// 3. Return the result of calling the CreateArrayIterator abstract operation with arguments O and "key".
			return CreateArrayIterator(O, 'key');

		},

		values: function values() {
			// 15.4.4.25 Array.prototype.values
			// The following steps are taken:

			// 1. Let O be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(O).
			var O = Object(this);

			// 3. Return the result of calling the CreateArrayIterator abstract operation with arguments O and "value".
			return CreateArrayIterator(O, 'value');

		}

	});

	// 15.4.4.26 Array.prototype.@@iterator ( )
	// The initial value of the @@iterator property is the same function object as the initial value of the
	// Array.prototype.items property.
	// TODO: Check later drafts; rev. 11 has a comment saying: "Or should it be values?" so it could change.
	if (!Array.prototype.hasOwnProperty($$iterator))
		Array.prototype[$$iterator] = Array.prototype.items;

	function CreateArrayIterator(array, kind) {
		// 15.4.6.1 CreateArrayIterator Abstract Operation
		// Several methods of Array objects return iterator objects. The abstract operation CreateArrayIterator with
		// arguments array and kind is used to create and such iterator objects. It performs the following steps:

		// 1. Let O be the result of calling ToObject(array).
		// 2. ReturnIfAbrupt(O).
		var O = Object(array);

		// 3. Let itr be the result of the abstract operation ObjectCreate with the intrinsic object
		// %ArrayIteratorPrototype% as its argument.
		var itr = create(ArrayIteratorPrototype);

		var S = Secrets(itr);

		// 4. Add a [[IteratedObject]] internal property to itr with value O.
		S.set('[[IteratedObject]]', O);

		// 5. Add a [[ArrayIteratorNextIndex]] internal property to itr with value 0.
		S.set('[[ArrayIteratorNextIndex]]', 0);

		// 6. Add a [[ArrayIterationKind]] internal property of itr with value kind.
		S.set('[[ArrayIterationKind]]', kind);

		// 7. Return itr.
		return itr;

	}

	var ArrayIteratorPrototype = {

		next: function next() {
			// 15.4.6.2.2 ArrayIterator.prototype.next( )

			// 1. Let O be the this value.
			var O = this;

			// 2. If Type(O) is not Object, throw a TypeError exception.
			if (Object(O) != O)
				throw new TypeError('Object expected: ' + O);

			var S = Secrets(O);

			// 3. If O does not have all of the internal properties of a Array Iterator Instance (15.4.6.1.2), throw a
			// TypeError exception.
			if (!S
				|| !S.has('[[IteratedObject]]')
				|| !S.has('[[ArrayIteratorNextIndex]]'
				|| !S.has('[[ArrayIterationKind]]')))
				throw new TypeError('ArrayIterator expected.');

			// 4. Let a be the value of the [[IteratedObject]] internal property of O.
			var a = S.get('[[IteratedObject]]');

			// 5. Let index be the value of the [[ArrayIteratorNextIndex]] internal property of O.
			var index = S.get('[[ArrayIteratorNextIndex]]');

			// 6. Let itemKind be the value of the [[ArrayIterationKind]] internal property of O.
			var itemKind = S.get('[[ArrayIterationKind]]');

			// 7. Let lenValue be the result of calling the [[Get]] internal method of a with the argument "length".
			var lenValue = a.length;

			// 8. Let len be ToUint32(lenValue).
			// 9. ReturnIfAbrupt(len).
			var len = lenValue >>> 0;

			var found, elementKey;

			// 10. If itemKind contains the substring "sparse", then
			if (~itemKind.indexOf('sparse')) {

				// a. Let found be false.
				found = false;

				// b. Repeat, while found is false and index < len
				while (!found && index < len) {

					// i. Let elementKey be ToString(index).
					elementKey = String(index);

					// ii. Let found be the result of calling the [[HasProperty]] internal method of a with argument
					// elementKey.
					found = elementKey in a;

					// iii. If found is false, then
					if (!found)

						// 1. Increase index by 1.
						index++;

				}

			}

			// 11. If index ≥ len, then
			if (index >= len) {

				// a. Set the value of the [[ArrayIteratorNextIndex]] internal property of O to +Infinity.
				S.set('[[ArrayIteratorNextIndex]]', Infinity);

				// b. Return Completion {[[type]]: throw, [[value]]: %StopIteration%, [[target]]: empty}.
				throw StopIteration;

			}

			// 12. Let elementKey be ToString(index).
			elementKey = String(index);

			// 13. Set the value of the [[ArrayIteratorNextIndex]] internal property of O to index+1.
			S.set('[[ArrayIteratorNextIndex]]', index + 1);

			var elementValue, result;

			// 14. If itemKind contains the substring "value", then
			if (~itemKind.indexOf('value'))

				// a. Let elementValue be the result of calling the [[Get]] internal method of a with argument
				// elementKey.
				// b. ReturnIfAbrupt(elementValue).
				elementValue = a[elementKey];

			if (~itemKind.indexOf('key+value')) {
			// 15. If itemKind contains the substring "key+value", then

				// a. Let result be the result of the abstract operation ArrayCreate with argument 2.
				// b. Assert: result is a new, well-formed Array object so the following operations will never fail.
				result = new Array(2);

				// c. Call the [[DefineOwnProperty]] internal method of result with arguments "0", Property Descriptor
				// {[[Value]]:	elementKey, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and
				// false.
				result[0] = elementKey;

				// d. Call the [[DefineOwnProperty]] internal method of result with arguments "1", Property Descriptor
				// {[[Value]]: elementValue, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}, and
				// false.
				result[1] = elementValue;

				// e. Return result.
				return result;

			}

			// 16. Else If itemKind contains the substring "key" then, return elementKey.
			else if(~itemKind.indexOf('key'))
				return elementKey;

			// 17. Else itemKind is "value",
			else if(itemKind === 'value')

				// a. Return elementValue.
				return elementValue;

		}

	};

	ArrayIteratorPrototype[$$iterator] = function $$iterator() {
		// 15.4.6.2.3 ArrayIterator.prototype.@@iterator ( )
		// The following steps are taken:

		// 1. Return the this value.
		return this;

	};

	// 15.4.6.2.4 ArrayIterator.prototype.@@toStringTag
	// The initial value of the @@toStringTag property is the string value "Array Iterator".
	ArrayIteratorPrototype[$$toStringTag] = 'Array Iterator';

})();
var Map = (function() {
	// TODO: It would probably be good to clean up deleted keys when possible. This is not a trivial task, however,
	// as cleanup can't break forEach and MapIterator, and it must update indices in object-keys and primitive-keys.

	var mNumber = 0,

		// We use these as functions rather than methods so that changes to Array.prototype can't gain unwelcomed access
		// to the internal workings of our WeakMap.
		push = Function.prototype.call.bind(Array.prototype.push);

	function MapInitialisation(obj, iterable) {
		// 15.14.1.1 MapInitialisation

		// The abstract operation MapInitialisation with arguments obj and iterable is used to initialize an object
		// as a map. It performs the following steps:

		// 1. If Type(obj) is not Object, throw a TypeError exception.
		if (Object(obj) != obj)
			throw new TypeError('Object expected: ' + obj);

		var S = Secrets(obj);

		// [The following line is in line with step 3. Note that step 3 is still performed below because a secrets object
		// can be returned even if the object is not extensible.]
		if (!S) throw new TypeError('Object is not extensible.');

		// 2. If obj already has a [[MapData]] internal property, throw a TypeError exception.
		if (S.has('[[MapData]]'))
			throw new TypeError('Object is a Map.');

		// 3. If the [[Extensible]] internal property of obj is false, throw a TypeError exception.
		if (!Object.isExtensible(obj))
			throw new TypeError('Object is not extensible.');

		var iterator, itr, adder;

		// 4. If iterable is not undefined, then
		if (iterable !== undefined) {

			// a. Let iterable be ToObject(iterable).
			// b. ReturnIfAbrupt(iterable)
			iterable = Object(iterable);

			// c. Let iterator be the intrinsic symbol @@iterator.
			// TODO: What to do about @@iterator/$$iterator?
			iterator = $$iterator;

			// d. Let itr be the result of calling the Invoke abstraction operation with iterator, obj, and an empty
			// List as arguments.
			// e. ReturnIfAbrupt(itr).
			itr = obj[iterator]();

			// f. Let adder be the result of calling the [[Get]] internal method of obj with argument "set".
			// g. ReturnIfAbrupt(adder).
			adder = obj.set;

			// h. If IsCallable(adder) is false, throw a TypeError Exception.
			if (typeof adder != 'function')
				throw new TypeError('Property "set" is not a function.');

		}

		// 5. Add a [[MapData]] internal property to obj.
		// 6. Set obj’s [[MapData]] internal property to a new empty List.
		S.set('[[MapData]]', create(null));
		S.set('#MapRecordId', 'Map:id:' + (mNumber++));
		// [Store size for efficiency.]
		S.set('Map:size', 0);
		// [Store indices by key for efficiency.]
		S.set('Map:primitive-keys', create(null));
		S.set('Map:object-keys', new WeakMap());

		// 7. If iterable is undefined, return obj.
		if (iterable === undefined) return obj;

		var next, k, v;

		// 8. Repeat
		while (true) {

			try {

				// a. Let next be the result of performing Invoke with arguments "next", itr, and an empty arguments
				// List.
				next = itr.next();

			} catch(x) {

				// b. If IteratorComplete(next) is true, then return NormalCompletion(obj).
				if (x === StopIteration) return obj;
				else throw x;

			}

			// c. Let next be ToObject(next).
			// d. ReturnIfAbrupt(next).
			next = Object(next);

			// e. Let k be the result of calling the [[Get]] internal method of next with argument "0".
			// f. ReturnIfAbrupt(k).
			k = next[0];

			// g. Let v be the result of calling the [[Get]] internal method of next with argument "1".
			// h. ReturnIfAbrupt(v).
			v = next[1];

			// i. Let status be the result of calling the [[Call]] internal method of adder with obj as thisArgument
			// and a List whose elements are k and v as argumentsList.
			// j. ReturnIfAbrupt(status).
			adder.call(obj, k, v);

		}

	}

	function MapFunction(iterable) {
		// 15.14.2 The Map Constructor Called as a Function

		// When Map is called as a function rather than as a constructor, it initializes its this value with the
		// internal state necessary to support the Map.prototype internal methods. This premits super invocation of
		// the Map constructor by Map subclasses.

		// 15.14.2.1 Map (iterable = undefined )

		// 1. Let m be the this value.
		var m = this;

		var map;

		// 2. If m is undefined or the intrinsic %MapPrototype%
		if (m === undefined || m === Map.prototype)

			// a. Let map be the result of the abstract operation ObjectCreate (15.2) with the intrinsic
			// %WeakMapPrototype% as the argument.
			map = create(Map.prototype);

		// 3. Else
		else

			// a. Let map be the result of ToObject(m).
			map = Object(m);

		// 4. ReturnIfAbrupt(map).

		// 5. If iterable is not present, let iterable be undefined.

		// 6. Let status be the result of MapInitialisation with map and iterable as arguments.
		// 7. ReturnIfAbrupt(status).
		MapInitialisation(map, iterable);

		// 8. Return map.
		return map;

	}

	function MapConstructor(iterable) {
		// 15.14.3.1 new Map (iterable = undefined )

		// 1. Let map be the result of the abstract operation ObjectCreate (15.2) with the intrinsic %MapPrototype%
		// as the argument.
		var map = this;

		// 2. If iterable is not present, let iterable be undefined.

		// 3. Let status be the result of MapInitialisation with map and iterable as arguments.
		// 4. ReturnIfAbrupt(status).
		MapInitialisation(map, iterable);

		// 5. Return map.
		// [This step is automatic.]

	}

	function Map(/* iterable */) {

		var S, iterable = arguments[0];

		// [Map.prototype will always be the firstborn, since this property is non-configurable and non-writable.]
		if (this instanceof Map
			&& this != Map.prototype
			&& (S = Secrets(this))
			&& !S.has('Map:#constructed')
			) {

			MapConstructor.call(this, iterable);
			S.set('Map:#constructed', true);

		} else return MapFunction.call(this, iterable);

	}

	// 15.14.4.1 Map.prototype
	// The initial value of Map.prototype is the Map prototype object (15.14.4).
	// This property has the attributes { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }.
	Object.defineProperty(Map, 'prototype', {
		value: Map.prototype,
		enumerable: false,
		writable: false,
		configurable: false
	});

	defineValuesWC(Map.prototype, {

		clear: function clear() {
			// 15.14.5.2 Map.prototype.clear()

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// 4. Set the value of M’s [[MapData]] internal property to a new empty List.
			S.set('[[MapData]]', create(null));
			S.set('Map:size', 0);
			S.set('#MapRecordId', 'Map:id:' + (mNumber++));
			S.set('Map:primitive-keys', create(null));
			S.get('Map:object-keys').clear();

			// 5. Return undefined.

		},

		delete: function delete_(key) {
			// 15.14.5.3 Map.prototype.delete ( key )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// 4. Let entries be the List that is the value of M’s [[MapData]] internal property.
			var entries = S.get('[[MapData]]');

			var p;

			// 5. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
			// for (var i = 0; i < entries.length; i++) {
			// [We deviate from the steps for efficiency; we can find most indices in O(1) rather than O(n).]
			var i = getRecordIndex(S, key);
			if (i !== false) {

				p = entries[i];

				// a. If SameValue(p.[[key]], key), then
				if (Object.is(p.key, key)) {

					// i.   Set p.[[key]] to empty.
					delete p.key;

					// ii.  Set p.[[value]] to empty.
					delete p.value;

					// [Don't splice; it will break forEach.]
					S.set('Map:size', S.get('Map:size') - 1);

					// iii. Return true.
					return true;

				}

			}

			// 6. Return false.
			return false;

		},

		forEach: function forEach(callbackfn/*, thisArg = undefined */) {
			// 15.14.5.4 Map.prototype.forEach ( callbackfn , thisArg = undefined )

			// callbackfn should be a function that accepts three arguments. forEach calls callbackfn once for each
			// key/value pair present in the map object, in key insertion order. callbackfn is called only for keys of
			// the map which actually exist; it is not called for keys that have been deleted from the map.

			// If a thisArg parameter is provided, it will be used as the this value for each invocation of callbackfn.
			// If it is not provided, undefined is used instead.

			// NOTE If callbackfn is an Arrow Function, this was lexically bound when the function was created so
			// thisArg will have no effect.

			// callbackfn is called with three arguments: the value of the item, the key of the item, and the Map object
			// being traversed.

			// forEach does not directly mutate the object on which it is called but the object may be mutated by the
			// calls to callbackfn.

			// NOTE Each key is visited only once with the value that is current at the time of the visit. If the value
			// associated with a key is modified after it has been visited, it is not re-visited. Keys that are deleted
			// after the call to forEach begins and before being visited are not visited. New keys added, after the call
			// to forEach begins are visited.

			var thisArg = arguments[1];

			// When the forEach method is called with one or two arguments, the following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
			if (typeof callbackfn != 'function')
				throw new TypeError('Function expected in call to forEach.');

			// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var T = thisArg;

			// 6. Let entries be the List that is the value of M’s [[MapData]] internal property.
			var entries = S.get('[[MapData]]');

			var e, funcResult;

			// 7. Repeat for each Record {[[key]], [[value]]} e that is an element of entries,in original key insertion
			// order
			for (var i = 0; i < entries.length; i++) {
				e = entries[i];

				// a. If e.[[key]] is not empty, then
				if ('key' in e) {

					// i. Let funcResult be the result of calling the [[Call]] internal method of callbackfn with T as
					// thisArgument and a List containing e.[[value]], e.[[key]], and M as argumentsList.
					// ii. ReturnIfAbrupt(funcResult).
					funcResult = callbackfn.call(T, e.value, e.key, M);

				}

			}

			// 8. Return undefined.

			// The length property of the forEach method is 1.

		},

		get: function get(key) {
			// 15.14.5.5 Map.prototype.get ( key )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value the as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// 4. Let entries be the List that is the value of M’s [[MapData]] internal property.
			var entries = S.get('[[MapData]]');

			var p;

			// 5. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
			// for (var i = 0; i < entries.length; i++) {
			// [We deviate from the steps for efficiency; we can find most indices in O(1) rather than O(n).]
			var i = getRecordIndex(S, key);
			if (i !== false) {

				p = entries[i];

				// a. If SameValue(p.[[key]], key), then return p.[[value]]
				if (Object.is(p.key, key))
					return p.value;

			}

			// 6. Return undefined.

		},

		has: function has(key) {
			// 15.14.5.6 Map.prototype.get ( key )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value the as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// 4. Let entries be the List that is the value of M’s [[MapData]] internal property.
			var entries = S.get('[[MapData]]');

			var p;

			// 5. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
			// for (var i = 0; i < entries.length; i++) {
			// [We deviate from the steps for efficiency; we can find most indices in O(1) rather than O(n).]
			var i = getRecordIndex(S, key);
			if (i !== false) {

				p = entries[i];

				// a. If SameValue(p.[[key]], key), then return true.
				if (Object.is(p.key, key))
					return true;

			}

			// 6. Return false.
			return false;

		},

		items: function items() {
			// 15.14.5.7 Map.prototype.items ( )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			// 3. Return the result of calling the CreateMapIterator abstract operation with arguments M and
			// "key+value".
			// TODO: CreateMapIterator
			return CreateMapIterator(M, 'key+value');

		},

		keys: function keys() {
			// 15.14.5.8 Map.prototype.keys ( )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			// 3. Return the result of calling the CreateMapIterator abstract operation with arguments M and "key".
			return CreateMapIterator(M, 'key');

		},

		set: function set(key, value) {
			// 15.14.5.9 Map.prototype.set ( key , value )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(this);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// 4. Let entries be the List that is the value of M’s [[MapData]] internal property.
			var entries = S.get('[[MapData]]');

			var p;

			// 5. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
			// for (var i = 0; i < entries.length; i++) {
			// [We deviate from the steps for efficiency; we can find most indices in O(1) rather than O(n).]
			var i = getRecordIndex(S, key);
			if (i !== false) {

				p = entries[i];

				// a. If SameValue(p.[[key]], key), then
				if (Object.is(p.key, key)) {

					// i.  Set p.[[value]] to value.
					p.value = value;

					// ii. Return undefined.
					return;

				}

			}

			// 6. Let p be the Record {[[key]]: key, [[value]]: value}
			p = create(null);
			p.key = key;
			p.value = value;

			// 7. Append p as the last element of entries.
			push(entries, p);
			S.set('Map:size', S.get('Map:size') + 1);

			// [We store the index in a WeakMap or hash map for efficiency.]
			var index = entries.length - 1;
			if (Object(key) === key)
				S.get('Map:object-keys').set(key, index);
			else
				S.get('Map:primitive-keys')[convertPrimitive(key)] = index;

			// 8. Return undefined.

		},

		get size() {
			// 15.14.5.10 get Map.prototype.size

			// Map.prototype.size is an accessor property whose set accessor function is undefined. Its get accessor
			// function performs the following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[MapData]]'))
				throw new TypeError('Object is not a Map.');

			// [From here on we take a much more efficient approach than the steps, using a stored size.]
			return S.get('Map:size');

			// 4. Let entries be the List that is the value of M’s [[MapData]] internal property.
			// 5. Let count be 0.
			// 6. For each Record {[[key]], [[value]]} p that is an element of entries
				// a. If p.[[key]] is not empty then
					// i. Set count to count+1.
			// 7. Return count.

		},

		values: function values() {
			// 15.14.5.11 Map.prototype.values ( )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			// 3. Return the result of calling the CreateMapIterator abstract operation with arguments M and "value".
			return CreateMapIterator(M, 'value');

		}

	});

	Map.prototype[$$iterator] = Map.prototype.items;

	// 15.14.5.7 Map.prototype.@@toStringTag
	// The initial value of the @@toStringTag property is the string value "Map".
	Map.prototype[$$toStringTag] = 'Map';

	// 15.14.7 Map Iterator Object Structure

	// A Map Iterator is an object, with the structure defined below, that represent a specific iteration over some
	// // specific Map instance object. There is not a named constructor for Map Iterator objects. Instead, map iterator
	// objects are created by calling certain methods of Map instance objects.

	function CreateMapIterator(map, kind) {
		// 15.14.7.1 CreateMapIterator Abstract Operation

		// Several methods of Map objects return interator objects. The abstract operation CreateMapIterator with
		// arguments map and kind is used to create and such iterator objects. It performs the following steps:

		// 1. Let M be the result of calling ToObject(map).
		// 2. ReturnIfAbrupt(M).
		var M = Object(map);

		var S = Secrets(M);

		// 3. If M does not have a [[MapData]] internal property throw a TypeError exception.
		if (!S || !S.has('[[MapData]]'))
			throw new TypeError('Object is not a Map.');

		// 4. Let entries be the List that is the value of M’s [[MapData]] internal property.
		// TODO: entries is defined but never used.
		var entries = S.get('[[MapData]]');

		// 5. Let itr be the result of the abstract operation ObjectCreate with the intrinsic object
		// %MapIteratorPrototype% as its argument.
		var itr = create(MapIteratorPrototype);

		var Si = Secrets(itr);

		// 6. Add a [[Map]] internal property to itr with value M.
		Si.set('[[Map]]', M);

		// 7. Add a [[MapNextIndex]] internal property to itr with value 0.
		Si.set('[[MapNextIndex]]', 0);

		// 8. Add a [[MapIterationKind]] internal property of itr with value kind.
		Si.set('[[MapIterationKind]]', kind);

		// 9. Return itr.
		return itr;

	}

	// 5.14.7.2 The Map Iterator Prototype

	// All Map Iterator Objects inherit properties from a common Map Iterator Prototype object. The [[Prototype]]
	// internal property of the Map Iterator Prototype is the %ObjectPrototype% intrinsic object. In addition, the Map
	// Iterator Prototype as the following properties:

	var MapIteratorPrototype = { };

	defineValuesWC(MapIteratorPrototype, {

		next: function() {
			// 15.14.7.2.2 MapIterator.prototype.next( )

			// 1. Let O be the this value.
			var O = this;

			// 2. If Type(O) is not Object, throw a TypeError exception.
			if (Object(O) != O)
				throw new TypeError('Object expected.');

			var S = Secrets(O);

			// 3. If O does not have all of the internal properties of a Map Iterator Instance (15.14.7.1.2), throw a
			// TypeError exception.
			if (!S || !S.has('[[Map]]') || !S.has('[[MapNextIndex]]') || !S.has('[[MapIterationKind]]'))
				throw new TypeError('MapIterator expected.');

			// 4. Let m be the value of the [[Map]] internal property of O.
			var m = S.get('[[Map]]');

			// 5. Let index be the value of the [[MapNextIndex]] internal property of O.
			var index = S.get('[[MapNextIndex]]');

			// 6. Let itemKind be the value of the [[MapIterationKind]] internal property of O.
			var itemKind = S.get('[[MapIterationKind]]');

			var Sm = Secrets(m);

			// 7. Assert: m has a [[MapData]] internal property.
			if (!Sm || !Sm.has('[[MapData]]'))
				throw new TypeError('Map expected.');

			// 8. Let entries be the List that is the value of the [[MapData]] internal property of m.
			var entries = Sm.get('[[MapData]]');

			var e, result;

			// 9. Repeat while index is less than the total number of element of entries. The number of elements must be
			// redetermined each time this method is evaluated.
			while (index < entries.length) {

				// a. Let e be the Record {[[key]], [[value]]} at 0-origined insertion position index of entries.
				e = entries[index];

				// b. Set index to index+1;
				index++;

				// c. Set the [[MapNextIndex]] internal property of O to index.
				S.set('[[MapNextIndex]]', index);

				// d. If e.[[key]] is not empty, then
				if ('key' in e) {

					// i. If itemKind is "key" then, let result be e.[[key]].
					if (itemKind == 'key')
						result = e.key;

					// ii. Else if itemKind is "value" then, let result be e.[[value]].
					else if (itemKind == 'value')
						result = e.value;

					// iii. Else,
					else {

						// 1. Assert: itemKind is "key+value".
						if (itemKind != 'key+value')
							throw new Error('Invalid item kind: ' + itemKind);

						// 2. Let result be the result of the abstract operation ArrayCreate with argument 2.
						result = new Array(2);

						// 3. Assert: result is a new, well-formed Array object so the following operations will never
						// fail.

						// 4. Call the [[DefineOwnProperty]] internal method of result with arguments "0", Property
						// Descriptor {[[Value]]: e.[[key]], [[Writable]]: true, [[Enumerable]]: true,
						// [[Configurable]]: true}, and false.
						result[0] = e.key;

						// 5. Call the [[DefineOwnProperty]] internal method of result with arguments "1", Property
						// Descriptor {[[Value]]: e.[[value]], [[Writable]]: true, [[Enumerable]]: true,
						// [[Configurable]]: true}, and false.
						result[1] = e.value;

					}

					// iv. Return result.
					return result;

				}

			}

			// 10. Return Completion {[[type]]: throw, [[value]]: %StopIteration%, [[target]]: empty}.
			throw StopIteration;

		}


	});


	MapIteratorPrototype[$$iterator] = function $$iterator() {
		// 	15.14.7.2.3MapIterator.prototype.@@iterator ( )
		// The following steps are taken:

		// 1. Return the this value.
		return this;

	};

	// 15.14.7.2.4MapIterator.prototype.@@toStringTag
	// The initial value of the @@toStringTag property is the string value "Map Iterator".
	MapIteratorPrototype[$$toStringTag] = 'Map Iterator';

	function getRecordIndex(S, k) {

		var index;

		if (Object(k) === k)
			index = S.get('Map:object-keys').get(k);
		else
			index = S.get('Map:primitive-keys')[convertPrimitive(k)];

		if (index === undefined) return false;
		return index;

	}

	function convertPrimitive(k) {
		switch(typeof k) {
			case 'object': return 'null'; // should only be null
			case 'undefined': return 'undefined';
			case 'boolean': return String(k);
			case 'number': return String(k);
			case 'string': return '"' + k + '"';
			default: throw new TypeError('Key type unexpected: ' + typeof k);
		}
	}

	return Map;

})();
(function() {

	shimProps(Math, {

		log10: getLogFunction(10),
		log2: getLogFunction(2),

		log1p: function(x) {

			// Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
			// The result is computed in a way that is accurate even when the value of x is close to zero.
			var value = 0,
				precision = 256,

				number = Number(x);

			// If x is NaN, the result is NaN.
			if (isNaN(number)) return NaN;

			// If x is less than 0, the result is NaN.
			if (number < -1) return NaN;

			// If x is +0, the result is −Infinity.
			// If x is −0, the result is −Infinity.
			if (number == -1) return -Infinity;

			// If x is 1, the result is +0.
			if (number == 0) return 0;

			// If x is +Infinity, the result is +Infinity.
			if (x == Infinity) return Infinity;

			if (number <= 0 || number >= 1e-5) return Math.log(1 + number);

			for (var i = 1; i < precision; i++)
				if ((i % 2) === 0)
					value += (i % 2 == 0 ? -1 : 1) * Math.pow(number, i) / i;

			return value;

		},

		expm1: function(x) {
			// TODO
		},
		// TODO: Several functions: 15.8.23+

		trunc: function trunc(x) {

			// Returns the integral part of the number x, removing any fractional digits. If x is already an integer,
			// the result is x.

			var number = Number(x);

			// If x is NaN, the result is NaN.
			if (isNaN(number)) return NaN;

			// If x is -0, the result is -0.
			// If x is +0, the result is +0.
			if (number == 0) return number;

			// If x is +Infinity, the result is +Infinity.
			if (number == Infinity) return Infinity;

			// If x is -Infinity, the result is -Infinity.
			if (number == -Infinity) return -Infinity;

			return Number.toInt(number);

		},

		sign: function sign(x) {

			// Returns the sign of the x, indicating whether x is positive, negative or zero.

			var number = Number(x);

			// If x is NaN, the result is NaN.
			if (isNaN(number)) return NaN;

			// If x is -0, the result is -0.
			// If x is +0, the result is +0.
			if (number == 0) return number;

			// If x is negative and not -0, the result is -1.
			if (number < 0) return -1;

			// If x is positive and not +0, the result is +1.
			if (number > 0) return 1;

		},

		cbrt: function cbrt(x) {

			// Returns an implementation-dependent approximation to the cube root of x.

			var number = Number(x);

			// If x is NaN, the result is NaN.
			if (isNaN(number)) return NaN;

			// If x is +0, the result is +0.
			// If x is -0, the result is -0.
			if (number == 0) return number;

			// If x is +Infinity, the result is +Infinity.
			if (number == Infinity) return Infinity;

			// If x is -Infinity, the result is -Infinity.
			if (number == -Infinity) return -Infinity;

			return Math.pow(number, 1 / 3);

		}


	});

	function getLogFunction(base) {
		return function logB(x) {

			// Returns an implementation-dependent approximation to the specified base logarithm of x.

			var number = Number(x);

			// If x is NaN, the result is NaN.
			if (isNaN(number)) return NaN;

			// If x is less than 0, the result is NaN.
			if (number < 0) return NaN;

			// If x is +0, the result is −Infinity.
			// If x is −0, the result is −Infinity.
			if (number == 0) return -Infinity;

			// If x is 1, the result is +0.
			if (number == 1) return 0;

			// If x is +Infinity, the result is +Infinity.
			if (x == Infinity) return Infinity;

			return Math.log(x) / Math.log(base);

		};
	}

})();
(function() {

	var firstBit1 = -1 >>> 0;

	shimProps(Number, {

		isNaN: function isNaN(number) {

			// 1. If Type(number) is not Number, return false.
			if (typeof number != 'number') return false;

			// 2. If number is NaN, return true.
			if (Object.is(number, NaN)) return true;

			// 3. Otherwise, return false.
			return false;

		},

		isFinite: function isFinite(number) {
			// 15.7.3.12
			// This is different from the global isFinite.

			// 1. If Type(number) is not Number, return false.
			if (typeof number != 'number') return false;

			// 2. If number is NaN, +Infinity, or -Infinity, return false.
			if (Number.isNaN(number) || number == Infinity || number == -Infinity) return false;

			// 3. Otherwise, return true.
			return true;

		},

		isInteger: function isInteger(number) {

			// 1. If Type(number) is not Number, return false.
			if (typeof number != 'number') return false;

			// 2. Let integer be ToInteger(number).
			var integer = Number.toInt(number);

			// 3. If integer is not equal to number, return false.
			if (integer != number) return false;

			// 4. Otherwise, return true.
			return true;

		},

		toInt: function toInt(value) {
			// ECMA-262 Ed. 6, 9-27-12. 9.1.4

			// 1. Let number be the result of calling ToNumber on the input argument.
			// 2. ReturnIfAbrupt(number).
			var number = Number(value);

			// 3. If number is NaN, return +0.
			if (isNaN(number)) return 0;

			// 4. If number is +0, -0, +Infinity, or -Infinity, return number.
			if (number == 0 || number == Infinity || number == -Infinity) return number;

			// 5. Return the result of computing sign(number) * floor(abs(number)).
			return (n < 0 ? -1 : 1) * Math.floor(Math.abs(number));

		}

	});

	shimProps(Number, {

		// The following properties have the attributes
		// { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }.
		enumerable: false,
		writable: false,
		configurable: false

	}, {

		// The value of Number.EPSILON is the difference between 1 and the smallest value greater than 1 that is
		// representable as a Number value, which is approximately 2.2204460492503130808472633361816 * 10 ^ -16.
		EPSILON: 2.2204460492503130808472633361816e-16,

		// The value of Number.MAX_INTEGER is the largest integer value that can be represented as a Number value
		// without losing precision, which is 9007199254740991.
		MAX_INTEGER: 9007199254740991

	});

	shimProps(Number.prototype, {

		clz: function clz() {
			// TODO: Performance could probably be improved.
			// clz: Count Leading Zeros

			// 1. Let x be this Number value.
			var x = Number(this);

			// 2. Let n be ToUint32(x).
			// 3. ReturnIfAbrupt(n).
			var n = x >>> 0;

			// 4. Let p be the number of leading zero bits in the 32-bit binary representation of n.
			// 5. Return p.
			for (var p = 32; p > 0; p--) {
				if (n == 0) return p;
				n = n >>> 1;
			}
			return 0;

		}

	});

})();
// TODO: Object.prototype.assign if possible.

(function() {

	shimProps(Object, {

		getPropertyNames: function getPropertyNames(obj) {

			if (Object(obj) !== obj)
				throw new Error('Object.getPropertyNames called on non-object: ' + obj);

			var names = [ ];

			do {
				names = names.concat(Object.getOwnPropertyNames(obj));
			} while (obj = Object.getPrototypeOf(obj));

			return names;

		},

		getPropertyDescriptor: function getPropertyDescriptor(obj, name) {

			if (Object(obj) !== obj)
				throw new Error('Object.getPropertyDescriptor called on non-object: ' + obj);

			var desc;

			do {
				desc = Object.getOwnPropertyDescriptor(obj, name);
			} while (!desc && (obj = Object.getPrototypeOf(obj)));

			return desc;

		},

		is: function is(a, b) {
			// egal function. Exposes ES5 SameValue function.
			return a === b && (a !== 0 || 1 / a === 1 / b) // false for +0 vs -0
				|| a !== a && b !== b; // true for NaN vs NaN
		}

	});

})();

Object.prototype.toString = (function() {

	var original = Object.prototype.toString,
		nativeBrands = { };

	[
		"Arguments", "Array", "Boolean", "Date", "Error", "Function", "JSON", "Math", "Number", "Object", "RegExp",
		"String"
	].forEach(function(u) {
		nativeBrands[u] = true;
	});

	return function toString() {

		// 15.2.4.2 Object.prototype.toString ( )

		// When the toString method is called, the following steps are taken:

		// 1. If the this value is undefined, return "[object Undefined]".
		if (this === undefined) return '[object Undefined]';

		// 2. If the this value is null, return "[object Null]".
		if (this === null) return '[object Null]';

		// 3. Let O be the result of calling ToObject passing the this value as the argument.
		var O = Object(this);

		// 4. If O has a [[NativeBrand]] internal property, let tag be the corresponding value from
		// 5. Table 27.
		// [[[NativeBrand]] corresponds loosely to ES5 [[Class]]].
		var NativeBrand = original.call(O).slice(8, -1);
		if (nativeBrands[NativeBrand] && NativeBrand != 'Object')
			return NativeBrand;

		// 6. Else
		else {

			// a. Let hasTag be the result of calling the [[HasProperty]] internal method of O with argument
			// @@toStringTag.
			var hasTag = Symbol.__useIsIn__ ? $$toStringTag.isIn(O) : $$toStringTag in O;

			// b. If hasTag is false, let tag be "Object".
			// [We use NativeBrand here instead of Object to defer to the built-in toString, which may be an ES6-
			// compliant toString. This allows us to extend toString to support $$toStringTag without possibly
			// breaking an existing support for @@toStringTag. In ES5 accessing [[Class]] through toString and
			// accessing @@toStringTag on an extended object are functionally equivalent, so this shouldn't produce
			// any discernible differences in ES5 and ES6 environments.]
			if (!hasTag) tag = NativeBrand;

			// c. Else,
			else {

				var tag;

				try {

					// i. Let tag be the result of calling the [[Get]] internal method of O with argument @@toStringTag.
					tag = O[$$toStringTag];

				} catch(x) {

					// ii. If tag is an abrupt completion, let tag be NormalCompletion("???").
					tag = '???';

				}

				// iii. Let tag be tag.[[value]].

				// iv. If Type(tag) is not String, let tag be "???".
				if (typeof tag != 'string')
					tag = '???';

				// v. If tag is any of "Arguments", "Array", "Boolean", "Date", "Error", "Function", "JSON", "Math",
				// "Number", "Object", "RegExp", or "String" then let tag be the string value "~" concatenated with the
				// current value of tag.
				if (nativeBrands[tag])
					tag = '~' + tag;

			}

		}

		// 7. Return the String value that is the result of concatenating the three Strings "[object ", tag, and "]".
		return '[object ' + tag + ']';

	};

})();
var Set = (function() {

	// 15.16.1 Abstract Operations For Set Objects

	function SetInitialisation(obj, iterable) {
		// 15.16.1.1 SetInitialisation

		// The abstract operation SetInitialisation with arguments obj and iterable is used to initialize an object as a
		// set instance. It performs the following steps:

		// [Step numbers are [sic].]
		// 3. If Type(obj) is not Object, throw a TypeError exception.
		if (Object(obj) !== obj)
			throw new TypeError('Object expected: ' + obj);

		var S = Secrets(obj);

		// [The following line is in line with step 5. Note that step 5 is still performed below because a secrets object
		// can be returned even if the object is not extensible.]
		if (!S) throw new TypeError('Object is not extensible.');

		// 4. If obj already has a [[SetData]] internal property, throw a TypeError exception.
		if (S.has('[[SetData]]'))
			throw new TypeError('Object is a Set.');

		// 5. If the [[Extensible]] internal property of obj is false, throw a TypeError exception.
		if (!Object.isExtensible(obj))
			throw new TypeError('Object is not extensible.');

		var hasValues, iterator, itr, adder;

		// 6. If iterable is not undefined, then
		if (iterable !== undefined) {

			// a. Let iterable be ToObject(iterable).
			// b. ReturnIfAbrupt(iterable)
			iterable = Object(iterable);

			// c. Let hasValues be the result of calling the [[HasProperty]] internal method of iterable with argument
			// "values"
			hasValues = 'values' in iterable;

			// d. If hasValues is true, then
			if (hasValues)

				// i. Let itr be the result of calling the Invoke abstraction operation with "values", obj, and an empty
				// List as arguments.
				// TODO: I think the draft is wrong. It should say "iterable" instead of "obj". Confirm this.
				itr = iterable.values();

			// e. Else,
			else {

				// i. Let iterator be the @@iterator symbol.
				iterator = $$iterator;

				// ii. Let itr be the result of calling the Invoke abstraction operation with iterator, obj, and an
				// empty List as arguments.
				// TODO: I think the draft is wrong. It should say "iterable" instead of "obj". Confirm this.
				itr = iterable[iterator]();

			}

			// f. ReturnIfAbrupt(itr).

			// g. Let adder be the result of calling the [[Get]] internal method of obj with argument "add".
			// h. ReturnIfAbrupt(adder).
			adder = obj.add;

			// i. If IsCallable(adder) is false, throw a TypeError Exception.
			if (typeof adder != 'function')
				throw new TypeError('Property "add" is not a function.');

		}

		// 7. Add a [[SetData]] internal property to obj.
		// 8. Set obj’s [[SetData]] internal property to a new empty List.
		// [We can make things more efficient by using a Map.]
		S.set('[[SetData]]', new Map());

		// 9. If iterable is undefined, return obj.
		if (iterable === undefined)
			return obj;

		var next;

		// 10. Repeat
		while (true) {

			try {
				// a. Let next be the result of performing Invoke with arguments "next", itr, and an empty arguments List.
				next = itr.next();
			} catch(x) {
				// b. If IteratorComplete(next) is true, then return NormalCompletion(obj).
				if (x === StopIteration) return obj;
				else throw x;
			}

			// c. Let next be ToObject(next).
			// d. ReturnIfAbrupt(next).
			// TODO: This seems wrong. Why convert to object? check with ES Discuss. I'm commenting it out for now.
			// next = Object(next);

			// e. Let status be the result of calling the [[Call]] internal method of adder with obj as thisArgument and
			// a List whose sole element is v as argumentsList.
			// f. ReturnIfAbrupt(status).
			adder.call(obj, next);

		}

	}

	function SetFunction(iterable) {
		// 15.16.2 The Set Constructor Called as a Function
		// When Set is called as a function rather than as a constructor, it initializes its this value with the
		// internal state necessary to support the Set.prototype internal methods. This permits super invocation of the
		// Set constructor by Set subclasses.

		// 15.16.2.1 Set (iterable = undefined )

		// 1. Let O be the this value.
		var O = this;

		var set;

		// 2. If O is undefined or the intrinsic %SetPrototype%
		if (O === undefined || O === Set.prototype)

			// a. Let set be the result of the abstract operation ObjectCreate (15.2) with the intrinsic %SetPrototype%
			// as the argument.
			set = create(Set.prototype);

		// 3. Else
		else

			// a. Let set be the result of ToObject(O).
			set = Object(O);

		// 4. ReturnIfAbrupt(map).

		// 5. If iterable is not present, let iterable be undefined.

		// 6. Let status be the result of SetInitialisation with set and iterable as arguments.
		// 7. ReturnIfAbrupt(status).
		SetInitialisation(set, iterable);

		// 8. Return set.
		return set;

		// NOTE If the parameter iterable is present, it is expected to be an object that implements an @@iterator
		// method that returns an iterator object that produces two element array-like objects whose first element is a
		// value that will be used as an Map key and whose second element is the value to associate with that key.

	}

	function SetConstructor(iterable) {
		// 15.16.3 The Set Constructor
		// When Set is called as part of a new expression it is a constructor: it initialises the newly created object.

		// 15.16.3.1 new Set (iterable = undefined )

		// 1. Let set be the result of the abstract operation ObjectCreate (15.2) with the intrinsic %SetPrototype% as
		// the argument.
		var set = this;

		// 2. If iterable is not present, let iterable be undefined.

		// 3. Let status be the result of SetInitialisation with set and iterable as arguments.
		// 4. ReturnIfAbrupt(status).
		SetInitialisation(set, iterable);

		// 5. Return set.
		return set;

		// NOTE If the parameter iterable is present, it is expected to be an object that implements either a values
		// method or an @@iterator method. Either method is expected to return an interator object that returns the
		// values that will be the initial elements of the set.

	}

	function Set(/* iterable */) {

		var S, iterable = arguments[0];

		// [WeakMap.prototype will always be the firstborn, since this property is non-configurable and non-writable.]
		if (this instanceof Set
			&& this != Set.prototype
			&& (S = Secrets(this))
			&& !S.has('Set:#constructed')
			) {

			SetConstructor.call(this, iterable);
			S.set('Set:#constructed', true);

		} else return SetFunction.call(this, iterable);

	}

	// 15.16.4	Properties of the Set Constructor
	// The value of the [[Prototype]] internal property of the Set constructor is the Function prototype object (15.3.4).
	// Besides the internal properties and the length property (whose value is 0), the Set constructor has the following
	// property:

	// 15.16.4.1 Set.prototype
	// The initial value of Set.prototype is the intrinsic %SetPrototype% object (15.16.4).
	// This property has the attributes { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }.
	Object.defineProperty(Set, 'prototype', {
		value: Set.prototype,
		enumerable: false,
		writable: false,
		configurable: false
	});

	defineValuesWC(Set.prototype, {

		add: function add(value) {
			// 15.16.5.2 Set.prototype.add (value)
			// The following steps are taken:

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			var $ = Secrets(S);

			// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
			if (!$ || !$.has('[[SetData]]'))
				throw new TypeError('Object is not a Set.');

			// 4. Let entries be the List that is the value of S’s [[SetData]] internal property.
			var entries = $.get('[[SetData]]');

			// 5. Repeat for each p that is an element of entries,
				// a. If p is not empty and SameValue(p, value) is true, then
					// i. Return undefined.
			if (entries.has(value))
				return;

			// 6. Append p as the last element of entries.
			entries.set(value, true);

			// 7. Return undefined.

		},

		clear: function clear() {
			// 15.14.5.3 Set.prototype.clear ()
			// The following steps are taken:

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			var $ = Secrets(S);

			// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
			if (!$ || !$.has('[[SetData]]'))
				throw new TypeError('Object is not a Set.');

			// 4. Set the value of S’s [[SetData]] internal property to a new empty List.
			$.set('[[SetData]]', new Map());

			// 5. Return undefined.

		},

		delete: function delete_(value) {
			// 15.16.5.4 Map.prototype.delete ( value )
			// The following steps are taken:

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			var $ = Secrets(S);

			// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
			if (!$ || !$.has('[[SetData]]'))
				throw new TypeError('Object is not a Set.');

			// 4. Let entries be the List that is the value of S’s [[SetData]] internal property.
			var entries = $.get('[[SetData]]');

			// 5. Repeat for each e that is an element of entries, in original insertion order
				// a. If e is not empty and SameValue(e, value) is true, then
					// i. Replace the element of entries whose value is e with an element whose value is empty.
					// ii. Return true.
			// 6. Return false.

			return $.get('[[SetData]]').delete(value);

		},

		forEach: function forEach(callbackfn/*, thisArg */) {
			// 15.16.5.5 Set.prototype.forEach ( callbackfn , thisArg = undefined )
			// callbackfn should be a function that accepts two arguments. forEach calls callbackfn once for each value
			// present in the set object, in value insertion order. callbackfn is called only for values of the map
			// which actually exist; it is not called for keys that have been deleted from the set.
			// If a thisArg parameter is provided, it will be used as the this value for each invocation of callbackfn.
			// If it is not provided, undefined is used instead.
			// NOTE	If callbackfn is an Arrow Function, this was lexically bound when the function was created so
			// thisArg will have no effect.
			// callbackfn is called with two arguments: the value of the item and the Set object being traversed.
			// forEach does not directly mutate the object on which it is called but the object may be mutated by the
			// calls to callbackfn.
			// NOTE	Each value is normally visited only once. However, if a value will be revisited if it is deleted
			// after it has been visited and then re-added before the to forEach call completes. Values that are deleted
			// after the call to forEach begins and before being visited are not visited unless the value is added again
			// before the to forEach call completes. New values added, after the call to forEach begins are visited.
			// When the forEach method is called with one or two arguments, the following steps are taken:

			var thisArg = arguments[1];

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			var $ = Secrets(S);

			// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
			if (!$ || !$.has('[[SetData]]'))
				throw new TypeError('Object is not a Set.');

			// 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
			if (typeof callbackfn != 'function')
				throw new TypeError('Function expected in call to forEach.');

			// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
			var T = thisArg;

			// 6. Let entries be the List that is the value of S’s [[SetData]] internal property.
			var entries = $.get('[[SetData]]');

			// 7. Repeat for each e that is an element of entries,in original insertion order
				// a. If e is not empty, then
					// i. Let funcResult be the result of calling the [[Call]] internal method of callbackfn with T as
					// thisArgument and a List containing e and S as argumentsList.
					// ii.	ReturnIfAbrupt(funcResult).
			entries.forEach(function(value, key) {
				callbackfn.call(T, key, S);
			});

			// 8. Return undefined.

			// The length property of the forEach method is 1.

		},

		has: function has(value) {
			// 15.16.5.6 Set.prototype.has ( value )
			// The following steps are taken:

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			var $ = Secrets(S);

			// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
			if (!$ || !$.has('[[SetData]]'))
				throw new TypeError('Object is not a Set.');

			// 4. Let entries be the List that is the value of S’s [[SetData]] internal property.
			var entries = $.get('[[SetData]]');

			// 5. Repeat for each e that is an element of entries,
				// a. If e is not empty and SameValue(e, value), then return true.
			// 6. Return false.

			return entries.has(value);

		},

		get size() {
			// 15.16.5.7 get Set.prototype.size
			// Set.prototype.size is an accessor property whose set accessor function is undefined. Its get accessor
			// function performs the following steps are taken:

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			var $ = Secrets(S);

			// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
			if (!$ || !$.has('[[SetData]]'))
				throw new TypeError('Object is not a Set.');

			// 4. Let entries be the List that is the value of S’s [[SetData]] internal property.
			var entries = $.get('[[SetData]]');

			// 5. Let count be 0.
			// 6. For each e that is an element of entries
				// a. If e is not empty then i.	Set count to count+1.
			// 7. Return count.

			return entries.size;

		},

		values: function values() {
			// 15.16.5.8 Map.prototype.values ( )
			// The following steps are taken:

			// 1. Let S be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(S).
			var S = Object(this);

			// 3. Return the result of calling the CreateSetIterator abstract operation with argument S.
			return CreateSetIterator(S);

		}

	});

	// 15.16.5.9 Map.prototype.@@iterator ( )
	// The initial value of the @@iterator property is the same function object as the initial value of the values
	// property.
	Set.prototype[$$iterator] = Set.prototype.values;

	// 15.16.5.10 Set.prototype.@@toStringTag
	// The initial value of the @@toStringTag property is the string value "Set".
	Set.prototype[$$toStringTag] = 'Set';

	function CreateSetIterator(set) {
		// 15.16.7.1 CreateSetIterator Abstract Operation
		// The value and @@iterator methods of Set objects return interator objects. The abstract operation
		// CreateSetIterator with argument set is used to create and such iterator objects. It performs the following
		// steps:

		// 1. Let S be the result of calling ToObject(set).
		// 2. ReturnIfAbrupt(S).
		var S = Object(set);

		var $ = Secrets(S);

		// 3. If S does not have a [[SetData]] internal property throw a TypeError exception.
		if (!$ || !$.has('[[SetData]]'))
			throw new TypeError('Object is not a Set.');

		// 4. Let entries be the List that is the value of S’s [[SetData]] internal property.
		// TODO: Step 4 will probably be removed (since entries is never used in the spec) but we need to still get it
		// due to our divergence from steps 6 and 7.
		var entries = $.get('[[SetData]]');

		// 5. Let itr be the result of the abstract operation ObjectCreate with the intrinsic object
		// %SetIteratorPrototype% as its argument.
		var itr = create(SetIteratorPrototype);

		var $i = Secrets(itr);

		// 6. Add a [[IteratedSet]] internal property to itr with value S.
		// 7. Add a [[SetNextIndex]] internal property to itr with value 0.

		// [We get the Map's keys() iterator instead of the steps above.]
		$i.set('SetIterator:MapIterator:values', entries.keys());

		// 8. Return itr.
		return itr;

	}

	var SetIteratorPrototype = { };

	defineValuesWC(SetIteratorPrototype, {

		next: function next() {
			// 15.16.7.2.2 SetIterator.prototype.next( )

			// 1. Let O be the this value.
			var O = this;

			// 2. If Type(O) is not Object, throw a TypeError exception.
			if (Object(O) !== O)
				throw new TypeError('Object expected: ' + O);

			var $ = Secrets(O);

			// 3. If O does not have all of the internal properties of a Set Iterator Instance (15.16.7.1.2), throw a
			// TypeError exception.
			if (!$ || !$.has('SetIterator:MapIterator:values'))
				throw new TypeError('SetIterator expected.');

			// 4. Let s be the value of the [[IteratedSet]] internal property of O.
			// 5. Let index be the value of the [[SetNextIndex]] internal property of O.
			var values = $.get('SetIterator:MapIterator:values');

			// 6. Assert: s has a [[SetData]] internal property.
			// 7. Let entries be the List that is the value of the [[SetData]] internal property of s.
			// 8. Repeat while index is less than the total number of element of entries. The number of elements must be
			// redetermined each time this method is evaluated.
				// a. Let e be the element at 0-origined insertion position index of entries.
				// b. Set index to index+1;
				// c. Set the [[SetNextIndex]] internal property of O to index.
				// d. If e is not empty, then
					// i. If itemKind is "key" then, return e.
			// 9. Return Completion {[[type]]: throw, [[value]]: %StopIteration%, [[target]]: empty}.

			return values.next();

		}

	});

	SetIteratorPrototype[$$iterator] = function $$iterator() {
		// 15.16.7.2.3 SetIterator.prototype.@@iterator ( )
		// The following steps are taken:

		// 1.	Return the this value.
		return this;

	};

	// 15.16.7.2.4 SetIterator.prototype.@@toStringTag
	// The initial value of the @@toStringTag property is the string value "Set Iterator".
	SetIteratorPrototype[$$toStringTag] = 'Set Iterator';

	return Set;

})();
var StopIteration = (function() {

	return new (function StopIteration() { })();

})();
(function() {

	function pad(s) {
		while (s.length < 4) s = '0' + s;
		return s;
	}

	shimProps(String, {

		fromCodePoint: function fromCodePoint(/* ...codePoints */) {

			// 1. Assert: codePoints is a well-formed rest parameter object.
			// TODO: ?
			var codePoints = arguments;

			// 2. Let length be the result of calling the [[Get]] internal method of codePoints with argument "length".
			var length = codePoints.length;

			// 3. Let elements be a new List.
			var elements = [ ];

			// 4. Let nextIndex be 0.
			var nextIndex = 0;

			var next, nextCP;

			// 5. Repeat while nextIndex < length
			while (nextIndex < length) {

				// a. Let next be the result of calling the [[Get]] internal method of codePoints with argument
				// ToString(nextIndex).
				next = codePoints[nextIndex];

				// b. Let nextCP be ToNumber(next).
				// c. ReturnIfAbrupt(nextCP).
				nextCP = Number(next);

				// d. If SameValue(nextCP, ToInteger(nextCP)) is false,then throw a RangeError exception.
				if (nextCP != Number.toInteger(nextCP))
					throw new RangeError('Integer expected: ' + nextCP);

				// e. If nextCP < 0 or nextCP > 0x10FFFF, then throw a RangeError exception.
				if (nextCP < 0 || nextCP > 0x10ffff)
					throw new RangeError('Index out of range: ' + nextCP);

				// f. Append the elements of the UTF-16 Encoding (clause 6) of nextCP to the end of elements.
				elements.push(eval('"\\u' + pad(String.toString(16)) + '"'));

				// g. Let nextIndex be nextIndex + 1.
				nextIndex++;

			}

			// 6. Return the string value whose elements are, in order, the elements in the List elements.
			// If length is 0, the empty string is returned.
			return elements.join('');

		},

		raw: function raw(callSite/*, ...substitutions */) {

			// 1. Assert: substitutions is a well-formed rest parameter object.
			// TODO: ?
			var substitutions = Array.prototype.slice.call(arguments, 1);

			// 2. Let cooked be ToObject(callSite).
			// 3. ReturnIfAbrupt(cooked).
			var cooked = Object(callSite);

			// 4. Let rawValue be the result of calling the [[Get]] internal method of cooked with argument "raw".
			var rawValue = cooked.raw;

			// 5. Let raw be ToObject(rawValue).
			// 6. ReturnIfAbrupt(raw).
			var raw = Object(rawValue);

			// 7. Let len be the result of calling the [[Get]] internal method of raw with argument "length".
			var len = raw.length;

			// 8. Let literalSegments be ToUint(len)
			// 9. ReturnIfAbrupt(literalSegments).
			var literalSegments = len >>> 0;

			// 10. If literalSegments = 0, then return the empty string.
			if (literalSegments == 0) return '';

			// 11. Let stringElements be a new List.
			var stringElements = [ ];

			// 12. Let nextIndex be 0.
			var nextIndex = 0;

			var nextKey, next, nextSeg, nextSub;

			// 13. Repeat while nextIndex < literalSegments
			while (nextIndex < literalSegments) {

				// a. Let nextKey be ToString(nextIndex).
				nextKey = String(nextIndex);

				// b. Let next be the result of calling the [[Get]] internal method of raw with argument nextKey.
				next = raw[nextKey];

				// c. Let nextSeg be ToString(next).
				// d. ReturnIfAbrupt(nextSeg).
				nextSeg = String(next);

				// e. Append in order the code unit elements of nextSeg to the end of stringElements.
				stringElements.push(nextSeg);

				// f. If nextIndex + 1 = literalSegments, then
				if (nextIndex + 1 == literalSegments)
					// i. Return the string value whose elements are, in order, the elements in the List stringElements.
					// If length is 0, the empty string is returned.
					return stringElements.join('');

				// g. Let next be the result of calling the [[Get]] internal method of substitutions with argument
				// nextKey.
				next = substitutions[nextKey];

				// h. Let nextSub be ToString(next).
				// i. ReturnIfAbrupt(nextSub).
				nextSub = String(next);

				// j. Append in order the code unit elements of nextSub to the end of stringElements.
				stringElements.push(nextSub);

				// k. Let nextIndex be nextIndex + 1.
				nextIndex++;

			}

			// TODO: return?

		}

	});

	shimProps(String.prototype, {

		repeat: function repeat(count) {
			// ECMA-262 Ed. 6, 9-27-12. 15.5.4.21

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let n be the result of calling ToInteger(count).
			// According to Jason Orendorff, "Evaluating x | 0 produces ToInteger(x)." (http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger, comment)
			// I believe this is incorrect because ECMA-262 Ed. 6 9-27-12. 9.1.4 says ToInteger
			// can result in Infinity, while x | 0 cannot.
			// 5. ReturnIfAbrupt(n).
			var n = Number.toInt(count);

			// 6. If n ≤ 0, then throw a RangeError exception.
			if (n <= 0) throw new RangeError('count must be greater than 0: ' + count);

			// 7. If n is +Infinity, then throw a RangeError Exception.
			if (n == Infinity) throw new RangeError('count cannot be Infinity.');

			// 8. Let T be a String value that is made from n copies of S appended together.
			var T = '';
			for (var i = 0; i < n; i++)
				T += S;

			// 9. Return T.
			return T;

		},

		startsWith: function startsWith(searchString/*, position */) {

			// The length property of the startsWith method is 1.
			var position = arguments[1];

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let searchStr be ToString(searchString).
			// 5. ReturnIfAbrupt(searchStr).
			var searchStr = String(searchString);

			// 6. Let pos be ToInteger(position). (If position is undefined, this step produces the value 0).
			// 7. ReturnIfAbrupt(pos).
			var pos = Number.toInt(position);

			// 8. Let len be the number of elements in S.
			var len = S.length;

			// 9. Let start be min(max(pos, 0), len).
			var start = Math.min(Math.max(pos, 0), len);

			// 10. Let searchLength be the number of elements in searchString.
			var searchLength = searchStr.length;

			// 11. If searchLength+start is greater than len, return false.
			if (searchLength + start > len)
				return false;

			// 12. If the searchLength sequence of elements of S starting at start is the same as the full
			// element sequence of searchString, return true.
			if (S.substring(start, start + searchLength) == searchStr)
				return true;

			// 13. Otherwise, return false.
			return false;

		},

		endsWith: function endsWith(searchString/*, endPosition*/) {

			// The length property of the endsWith method is 1.
			var endPosition = arguments[1];

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let searchStr be ToString(searchString).
			// 5. ReturnIfAbrupt(searchStr).
			var searchStr = String(searchString);

			// 6. Let len be the number of elements in S.
			var len = S.length;

			// 7. If endPosition is undefined, let pos be len, else let pos be ToInteger(endPosition).
			// 8. ReturnIfAbrupt(pos).
			var pos = endPosition === undefined ? len : Number.toInt(endPosition);

			// 9. Let end be min(max(pos, 0), len).
			var end = Math.min(Math.max(pos, 0), len);

			// 10. Let searchLength be the number of elements in searchString.
			var searchLength = searchStr.length;

			// 11. Let start be end - searchLength.
			var start = end - searchLength;

			// 12. If start is less than 0, return false.
			if (start < 0) return false;

			// 13. If the searchLength sequence of elements of S starting at start is the same as the full element
			// sequence of searchString, return true.
			if (S.substring(start, start + searchLength) == searchStr)
				return true;

			// 14. Otherwise, return false.
			return false;

		},

		contains: function contains(searchString/*, position */) {

			var position = arguments[1];

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let searchStr be ToString(searchString).
			// 5. ReturnIfAbrupt(searchStr).
			var searchStr = String(searchString);

			// 6. Let pos be ToInteger(position). (If position is undefined, this step produces the value 0).
			// 7. ReturnIfAbrupt(pos).
			var pos = Number.toInt(position);

			// 8. Let len be the number of elements in S.
			var len = S.length;

			// 9. Let start be min(max(pos, 0), len).
			var start = Math.min(Math.max(pos, 0), len);

			// 10. Let searchLen be the number of characters in searchStr.
			var searchLen = searchStr.length;

			// 11. If there exists any integer k not smaller than start such that k + searchLen is not greater than
			// len, and for all nonnegative integers j less than searchLen, the character at position k+j of S is
			// the same as the character at position j of searchStr, return true; but if there is no such integer k,
			// return false.
			/* var test;
			for (var k = start; k + searchLen <= len; k++) {
				test = true;
				for (var j = 0; j < searchLen; j++) {
					if (S.charAt(k + j) != searchStr.charAt(j)) {
						test = false;
						break;
					}
				}
				if (test) return true;
			}
			return false; */

			return S.indexOf(searchStr, start) != -1;

		},

		codePointAt: function codePointAt(pos) {

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let position be ToInteger(pos).
			// 5. ReturnIfAbrupt(position).
			var position = Number.toInt(pos);

			// 6. Let size be the number of elements in S.
			var size = S.length;

			// 7. If position < 0 or position ≥ size, return undefined.
			if (position < 0 || position >= size) return undefined;

			// 8. Let first be the code unit value of the element at index position in the String S..
			var first = S.charCodeAt(position);

			// 9. If first < 0xD800 or first > 0xDBFF or position+1 = size, then return first.
			if (first < 0xd800 || first > 0xdbff || position + 1 == size) return first;

			// 10. Let second be the code unit value of the element at position position+1 in the String S.
			var second = S.charCodeAt(position + 1);

			// 11. If second < 0xDC00 or first > 0xDFFF, then return first.
			if (second < 0xdc00 || first > 0xdfff) return first;

			// 12. Return ((first – 0xD800) × 1024) + (second – 0xDC00) + 0x10000.
			return (first - 0xd800) * 1024 + second - 0xdc00 + 0x10000;

		}

	});

})();
// TODO: Check rev. 12 of the draft when it comes out and see if get, has, delete should throw when passed a non-object.
var WeakMap = (function() {

	var wmNumber = 0,

		NO_SECRETS = { NO_SECRETS: true };

	function WeakMapInitialisation(obj, iterable) {
		// 15.15.1.1 MapInitialisation

		// The abstract operation WeakMapInitialisation with arguments obj and iterable is used to initialize an object
		// as a map. It performs the following steps:

		// 1. If Type(obj) is not Object, throw a TypeError exception.
		if (Object(obj) != obj)
			throw new TypeError('Object expected: ' + obj);

		var S = Secrets(obj);

		// [The following line is in line with step 3. Note that step 3 is still performed below because a secrets object
		// can be returned even if the object is not extensible.]
		if (!S) throw new TypeError('Object is not extensible.');

		// 2. If obj already has a [[WeakMapData]] internal property, throw a TypeError exception.
		if (S.has('[[WeakMapData]]'))
			throw new TypeError('Object is a WeakMap.');

		// 3. If the [[Extensible]] internal property of obj is false, throw a TypeError exception.
		if (!Object.isExtensible(obj))
			throw new TypeError('Object is not extensible.');

		var iterator, itr, adder;

		// 4. If iterable is not undefined, then
		if (iterable !== undefined) {

			// a. Let iterable be ToObject(iterable).
			// b. ReturnIfAbrupt(iterable)
			iterable = Object(iterable);

			// c. Let iterator be the intrinsic symbol @@iterator.
			// TODO: What to do about @@iterator/$$iterator?
			iterator = $$iterator;

			// d. Let itr be the result of calling the Invoke abstraction operation with iterator, obj, and an empty
			// List as arguments.
			// e. ReturnIfAbrupt(itr).
			// TODO: Should this be iterable instead of obj?
			itr = obj[iterator]();

			// f. Let adder be the result of calling the [[Get]] internal method of obj with argument "set".
			// g. ReturnIfAbrupt(adder).
			adder = obj.set;

			// h. If IsCallable(adder) is false, throw a TypeError Exception.
			if (typeof adder != 'function')
				throw new TypeError('Property "set" is not a function.');

		}

		// 5. Add a [[WeakMapData]] internal property to obj.
		// 6. Set obj’s [[WeakMapData]] internal property to a new empty List.
		S.set('[[WeakMapData]]', create(null));
		S.set('#weakMapRecordId', 'WeakMap:id:' + (wmNumber++));

		// 7. If iterable is undefined, return obj.
		if (iterable === undefined) return obj;

		var next, k, v;

		// 8. Repeat
		while(true) {

			try {

				// a. Let next be the result of performing Invoke with arguments "next", itr, and an empty arguments
				// List.
				next = itr.next();

			} catch(x) {

				// b. If IteratorComplete(next) is true, then return NormalCompletion(obj).
				if (x === StopIteration) return obj;
				else throw x;

			}

			// c. Let next be ToObject(next).
			// d. ReturnIfAbrupt(next).
			next = Object(next);

			// e. Let k be the result of calling the [[Get]] internal method of next with argument "0".
			// f. ReturnIfAbrupt(k).
			k = next[0];

			// g. Let v be the result of calling the [[Get]] internal method of next with argument "1".
			// h. ReturnIfAbrupt(v).
			v = next[1];

			// i. Let status be the result of calling the [[Call]] internal method of adder with obj as thisArgument
			// and a List whose elements are k and v as argumentsList.
			// j. ReturnIfAbrupt(status).
			adder.call(obj, k, v);

		}

	}

	function WeakMapFunction(iterable) {
		// 15.15.2 The WeakMap Constructor Called as a Function

		// When WeakMap is called as a function rather than as a constructor, it initializes its this value with the
		// internal state necessary to support the WeakMap.prototype internal methods. This premits super invocation of
		// the WeakMap constructor by WeakMap subclasses.

		// 15.15.2.1 WeakMap (iterable = undefined )

		// 1. Let m be the this value.
		var m = this;

		var map;

		// 2. If m is undefined or the intrinsic %WeakMapPrototype%
		if (m === undefined || m === WeakMap.prototype)

			// a. Let map be the result of the abstract operation ObjectCreate (15.2) with the intrinsic
			// %WeakWeakMapPrototype% as the argument.
			map = create(WeakMap.prototype);

		// 3. Else
		else

			// a. Let map be the result of ToObject(m).
			map = Object(m);

		// 4. ReturnIfAbrupt(map).

		// 5. If iterable is not present, let iterable be undefined.

		// 6. Let status be the result of MapInitialisation with map and iterable as arguments.
		// 7. ReturnIfAbrupt(status).
		WeakMapInitialisation(map, iterable);

		// 8. Return map.
		return map;

	}

	function WeakMapConstructor(iterable) {
		// 15.15.3.1 new WeakMap (iterable = undefined )

		// 1. Let map be the result of the abstract operation ObjectCreate (15.2) with the intrinsic %WeakMapPrototype%
		// as the argument.
		var map = this;

		// 2. If iterable is not present, let iterable be undefined.

		// 3. Let status be the result of WeakMapInitialisation with map and iterable as arguments.
		// 4. ReturnIfAbrupt(status).
		WeakMapInitialisation(map, iterable);

		// 5. Return map.
		// [This step is automatic.]

	}

	function WeakMap(/* iterable */) {

		var S, iterable = arguments[0];

		// [WeakMap.prototype will always be the firstborn, since this property is non-configurable and non-writable.]
		if (this instanceof WeakMap
			&& this != WeakMap.prototype
			&& (S = Secrets(this))
			&& !S.has('WeakMap:#constructed')
		) {

			WeakMapConstructor.call(this, iterable);
			S.set('WeakMap:#constructed', true);

		} else return WeakMapFunction.call(this, iterable);

	}

	// 15.15.4.1 WeakMap.prototype
	// The initial value of WeakMap.prototype is the WeakMap prototype object (15.15.4).
	// This property has the attributes { [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }.
	Object.defineProperty(WeakMap, 'prototype', {
		value: WeakMap.prototype,
		enumerable: false,
		writable: false,
		configurable: false
	});

	defineValuesWC(WeakMap.prototype, {

		clear: function clear() {
			// 15.15.5.2 WeakMap.prototype.clear()

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[WeakMapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[WeakMapData]]'))
				throw new TypeError('Object is not a WeakMap.');

			// 4. Set the value of M’s [[WeakMapData]] internal property to a new empty List.
			S.set('[[WeakMapData]]', create(null));
			S.set('#weakMapRecordId', 'WeakMap:id:' + (wmNumber++));

			// 5. Return undefined.

		},

		delete: function delete_(key) {
			// 15.15.5.3 WeakMap.prototype.delete ( key )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[WeakMapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[WeakMapData]]'))
				throw new TypeError('Object is not a WeakMap.');

			// 4. Let entries be the List that is the value of M’s [[WeakMapData]] internal property.
			var entries = S.get('[[WeakMapData]]');

			// 5. Let k be ToObject(key).
			// 6. ReturnIfAbrupt(k).
			var k = Object(key);

			var p;

			// [We deviate from the steps to keep the weak, O(1) intent of the WeakMap.]
			if ((p = deleteRecord(S, k)) && p === true)
				return true;

			else if(p === NO_SECRETS) {
				// [If the weak intent cannot be kept, we fall back to non-weak, O(n) steps.]

				// 7. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
				for (var i = 0; i < entries.length; i++) {
					p = entries[i];

					// a. If SameValue(p.[[key]], k), then
					if (Object.is(p.key, k)) {

						// i.   Set p.[[key]] to empty.
						delete p.key;

						// ii.  Set p.[[value]] to empty.
						delete p.value;

						// [This operation is not specified, but it can improve efficiency.]
						splice(entries, i, 1);

						// iii. Return true.
						return true;

					}

				}

			}

			// 8. Return false.
			return false;

		},

		get: function get(key) {
			// 15.15.5.4 WeakMap.prototype.get ( key )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value the as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[WeakMapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[WeakMapData]]'))
				throw new TypeError('Object is not a WeakMap.');

			// 4. Let entries be the List that is the value of M’s [[WeakMapData]] internal property.
			var entries = S.get('[[WeakMapData]]');

			// 5. Let k be ToObject(key).
			// 6. ReturnIfAbrupt(k).
			var k = Object(key);

			var p;

			// [We deviate from the steps to keep the weak, O(1) intent of the WeakMap.]
			if ((p = getRecord(S, k)) && p !== NO_SECRETS)
				return p;

			else if(p === NO_SECRETS) {
				// [If the weak intent cannot be kept, we fall back to non-weak, O(n) steps.]

				// 7. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
				for (var i = 0; i < entries.length; i++) {
					p = entries[i];

					// a. If SameValue(p.[[key]], k), then return p.[[value]]
					if (Object.is(p.key, k))
						return p.value;

				}

			}

			// 8. Return undefined.

		},

		has: function has(key) {
			// 15.15.5.4 WeakMap.prototype.get ( key )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value the as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(M);

			// 3. If M does not have a [[WeakMapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[WeakMapData]]'))
				throw new TypeError('Object is not a WeakMap.');

			// 4. Let entries be the List that is the value of M’s [[WeakMapData]] internal property.
			var entries = S.get('[[WeakMapData]]');

			// 5. Let k be ToObject(key).
			// 6. ReturnIfAbrupt(k).
			var k = Object(key);

			var p;

			// [We deviate from the steps to keep the weak, O(1) intent of the WeakMap.]
			if ((p = getRecord(S, k)) && p !== NO_SECRETS)
				return true;

			else if(p === NO_SECRETS) {
				// [If the weak intent cannot be kept, we fall back to non-weak, O(n) steps.]

				// 7. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
				for (var i = 0; i < entries.length; i++) {
					p = entries[i];

					// a. If SameValue(p.[[key]], k), then return true.
					if (Object.is(p.key, k))
						return true;

				}

			}

			// 8. Return false.
			return false;

		},

		set: function set(key, value) {
			// 15.14.5.6 Map.prototype.set ( key , value )

			// The following steps are taken:

			// 1. Let M be the result of calling ToObject with the this value as its argument.
			// 2. ReturnIfAbrupt(M).
			var M = Object(this);

			var S = Secrets(this);

			// 3. If M does not have a [[WeakMapData]] internal property throw a TypeError exception.
			if (!S || !S.has('[[WeakMapData]]'))
				throw new TypeError('Object is not a WeakMap.');

			// 4. Let entries be the List that is the value of M’s [[WeakMapData]] internal property.
			var entries = S.get('[[WeakMapData]]');

			// 5. Let k be ToObject(key).
			// 6. ReturnIfAbrupt(k).
			// [I got confirmation from Allen Wirfs-Brock that these steps are a mistake. Instead it should throw.
			// He said this should be fixed in rev. 12.]
			if (Object(key) !== key)
				throw new TypeError('Key is not an object: ' + key);

			var p;

			// [We deviate from the steps to keep the weak, O(1) intent of the WeakMap.]
			if ((p = setRecord(S, key, value)) && p === NO_SECRETS) {
				// [If the weak intent cannot be kept, we fall back to non-weak, O(n) steps.]

				// 7. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
				for (var i = 0; i < entries.length; i++) {
					p = entries[i];

					// a. If SameValue(p.[[key]], key), then
					if (Object.is(p.key, key)) {

						// i.  Set p.[[value]] to value.
						p.value = value;

						// ii. Return undefined.
						return;

					}

				}

				// 8. Let p be the Record {[[key]]: k, [[value]]: value}
				p = create(null);
				p.key = key;
				p.value = value;

				// 9. Append p as the last element of entries.
				push(entries, p);

			}

			// 10. Return undefined.

		}

	});

	// 15.15.5.7 Map.prototype.@@toStringTag
	// The initial value of the @@toStringTag property is the string value "WeakMap".
	WeakMap.prototype[$$toStringTag] = 'WeakMap';

	function getRecord(S, k) {

		var Sk = Secrets(k),
			$weakMapRecordId;

		if (Sk) $weakMapRecordId = S.get('#weakMapRecordId');
		// Return NO_SECRETS if this object doesn't support Secrets
		else return NO_SECRETS;

		return Sk.getOwn($weakMapRecordId);
		// Returns undefined if the object supports Secrets but it had no WeakMap Record.

	}

	function setRecord(S, k, value) {

		var Sk = Secrets(k),
			$weakMapRecordId;

		if (Sk) $weakMapRecordId = S.get('#weakMapRecordId');
		// Return NO_SECRETS if this object doesn't support Secrets
		else return NO_SECRETS;

		Sk.set($weakMapRecordId, value);
		return true;

	}

	function deleteRecord(S, k) {

		var Sk = Secrets(k),
			$weakMapRecordId;

		if (Sk) $weakMapRecordId = S.get('#weakMapRecordId');
		// Return NO_SECRETS if this object doesn't support Secrets
		else return NO_SECRETS;

		var p = Sk.getOwn($weakMapRecordId);
		if (p) {
			Sk.delete($weakMapRecordId);
			// Return true if the record was successfully deleted.
			return true;
		}

		// Return false if the object supports Secrets but it had no WeakMap Record.
		return false;

	}

	return WeakMap;

})();

	var _global = (0, eval)('this'),

		Secrets = _SymbolsForES5_exports.Secrets,

		shims = {
			$$iterator: $$iterator,
			$$toStringTag: $$toStringTag,
			StopIteration: StopIteration,
			WeakMap: WeakMap,
			Map: Map,
			Set: Set
		};

	Object.keys(shims).forEach(function(key) {
		if(typeof _inHarmony_forceShim == 'boolean' && _inHarmony_forceShim || !_global[key])
			_global[key] = shims[key];
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
			var desc = Object.getOwnPropertyDescriptor(map, key),
				value = desc.value;
			if (value)
				defineValueWC(obj, key, value);
			else {
				desc.enumerable = false;
				desc.configurable = true;
				Object.defineProperty(obj, key, desc);
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
