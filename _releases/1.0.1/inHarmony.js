(function() {

	'use strict';

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

		(function() {

		'use strict';

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

		/* Retrieve the global object using an indirect eval.
		 * This should work in ES5 compliant environments.
		 * See: http://perfectionkills.com/global-eval-what-are-the-options/#indirect_eval_call_theory
		 */
		var _global = (0, eval)('this');

		// If Symbol is already defined, there's nothing to do.
		if (_global.Symbol) return;

		var Secrets = (function(Object) {
			// TODO: Correct this comment to say two paths -- now also through new Symbol().toString().
			/* There is one known path for retrieval of the secretKey: using an iframe's getOwnPropertyNames method.
			 * Therefore, this implementation has a second layer of protection, the locked variable. The secret map
			 * may only be retrieved when locked is set to false, and it can only be set internally.
			 * The overriding of getPropertyNames, etc. should not be considered a security measure (the locked variable
			 * is the security measure), but instead compatibility measures -- it ensures that scripts which don't expect
			 * secretKey won't encounter except for in the extreme case of the use of a cross-frame getOwnPropertyNames.
			 */

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
				hasOwnProperty = lazyBind(Object.prototype.hasOwnProperty),
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

				// A property name can be prepped to be exposed when object[secretKey] is accessed.
				preppedName,
				freezable = true,

				// Determines whether object[secretKey] on an object which doesn't have a secretKey property
				// should define itself. This is turned off when checking the prototype chain.
				autoDefine = true,

				// Determines whether object[secretKey] should expose the secret map.
				locked = true,

				random = getRandomGenerator(),
				// idNum will ensure identifiers are unique.
				idNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
				preIdentifier = randStr(7) + '0',
				secretKey = '!S:' + getIdentifier();

			(function() {
				// Override get(Own)PropertyNames and get(Own)PropertyDescriptors

				var overrides = {
					getOwnPropertyNames: getOwnPropertyNames
				};

				if (getPropertyNames) overrides.getPropertyNames = getPropertyNames;

				keys(overrides).forEach(function(u) {
					var original = overrides[u];
					defineProperty(Object, u, {
						value: function(obj) {
							return filter(original.apply(this, arguments), function(u) {
								return u != secretKey;
							});
						},
						enumerable: false,
						writable: true,
						configurable: true
					});
				});

				overrides = { };

				if (getPropertyDescriptors) overrides.getPropertyDescriptors = getPropertyDescriptors;
				if (getOwnPropertyDescriptors) overrides.getOwnPropertyDescriptors = getOwnPropertyDescriptors;

				keys(overrides).forEach(function(u) {
					var original = overrides[u];
					defineProperty(Object, u, {
						value: function(obj) {
							var desc = original.apply(this, arguments);
							if (desc[secretKey]) delete desc[secretKey];
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
					 * version be overridden to protect against discovery of secretKey on these browsers also?
					 */

					var trapBypasses = {
						defineProperty: defineProperty,
						hasOwn: hasOwnProperty,
						get: function(target, name) { return target[name]; }
					};

					return function Proxy(target, traps) {

						if (!(this instanceof Proxy)) {
							// TODO: The new keyword wasn't used. What should be done?
							return new Proxy(target, traps);
						}

						var _traps = create(traps);

						keys(trapBypasses).forEach(function(trapName) {
							var bypass = trapBypasses[trapName];
							if (typeof traps[trapName] == 'function') {
								// Override traps which could discover secretKey.
								_traps[trapName] = function(target, name) {
									if (name === secretKey) {
										// Bypass any user defined trap when name === secretKey.
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
			defineProperty(Object.prototype, secretKey, {

				get: function() {
					if(this === Object.prototype) return;
					var value = Secrets(this, preppedName);
					preppedName = undefined;
					return value;
				},

				set: function(value) {
					Secrets(this);
					this[secretKey] = value;
				},

				enumerable: false,
				configurable: false

			});

			// Override hasOwnProperty to work with preppedNames.
			defineProperty(Object.prototype, 'hasOwnProperty', {

				value: function _hasOwnProperty(name) {

					var N = String(name),
						value;

					if (N == secretKey) {

						if (locked) {
							if (!preppedName) return false;
							value = Secrets(this).hasOwn(preppedName);
							preppedName = undefined;
							return value;
						}

						return hasOwnProperty(this, secretKey);

					} else return hasOwnProperty(this, name);

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
					O[secretKey][name] = value;

					return value;

				},

				get: function getSecretProperty(O, name) {
					var secretMap, secretProp;
					name = String(name);
					// Turn off autoDefine because we'll be checking the prototype chain
					autoDefine = false;
					do {
						locked = false;
						secretMap = O[secretKey];
						// We check in case the prototype doesn't have a secret map.
						secretProp = secretMap && secretMap[name];
						if (secretProp) {
							autoDefine = true;
							return secretProp;
						}
					} while (O = getPrototypeOf(O));
					autoDefine = true;
				},

				getOwn: function getOwnSecretProperty(O, name) {
					locked = false;
					return O[secretKey][name];
				},

				has: function hasSecretProperty(O, name) {
					// Doesn't use get because can't distinguish between value *set* to undefined and unassigned.
					var secretMap;
					name = String(name);
					// Turn off autoDefine because we'll be checking the prototype chain
					autoDefine = false;
					do {
						locked = false;
						secretMap = O[secretKey];
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
					return name in O[secretKey];
				},

				delete: function deleteSecretProperty(O, name, _freezable) {
					freezable = _freezable;
					if (!permitChange(this, O, name, true))
						throw new TypeError('Can\'t delete property from ' + O);
					locked = false;
					return delete O[secretKey][name];
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

				secretKey: secretKey,

				prepName: function prepName(name, _freezable) {
					// Allows one access to Secrets(object).get(preppedName)
					// via object[secretKey] while in locked mode.
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
				if (!hasOwnProperty(O, secretKey)) {
					if (!isExtensible(O)) return;
					defineProperty(O, secretKey, {

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
								// The lock protects against retrieval in the event that the secretKey is found.
								if (locked) {
									if (!preppedName) return;
									value = secretMap.Secrets.get(preppedName);
									preppedName = undefined;
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
							ret = this[secretKey].Secrets.set(preppedName, value);
							preppedName = undefined;
							return ret;
						},

						enumerable: false,
						configurable: false

					});
				}
				locked = false;
				if (name) return O[secretKey].Secrets.get(name);
				return O[secretKey].Secrets;
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
				var bound = Object.create(null);
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
				// out of Secrets and put here instead ... such as the Object.prototype[secretKey] getter
				// and the handling of freezable.

				Secrets(this).set('id', '!Y:' + Secrets.getIdentifier());

			}

			Object.defineProperties(Symbol.prototype, {

				toString: {
					value: function() {
						var S = Secrets(this);
						Secrets.prepName(S.get('id'), this.freezable);
						return Secrets.secretKey;
					}
				},

				// We can't simulate "delete obj[symbol]" in ES5. So we'll have to resort to
				// "symbol.deleteFrom(obj)" in this situation.
				deleteFrom: {
					value: function(obj) {
						return Secrets(obj).delete(Secrets(this).get('id'), this.freezable);
					}
				}

			});

			Symbol.prototype.freezable = true;

			Object.defineProperty(Symbol, '__useDeleteFrom__', {
				value: true
			});

			return Symbol;

		})();

		_global.Symbol = Symbol;

	})();

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

	var SafeList = (function() {
		/* SafeList is like an Array and has all the methods of an array.
		 * The difference is the methods on the prototype can't be altered to discover what's being
		 * passed in the arguments to a method in a SafeList.
		 * In other words, SafeList provides an internal-only array implementation, which hides the
		 * activities of the things which use it, such as WeakMap.
		 */

		function SafeList() {
			Array.apply(this);
		}

		SafeList.prototype = Object.create(Array.prototype);

		Object.getOwnPropertyNames(Array.prototype).forEach(function(name) {
			Object.defineProperty(
				SafeList.prototype, name,
				Object.getOwnPropertyDescriptor(Array.prototype, name)
			);
		});

		Object.defineProperty(Array.prototype, 'search', {

			value: function search() {
				// TODO
			},

			writable: true,
			configurable: true

		});

		return SafeList;

	})();

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
			writable: true,
			configurable: true
		});
	}

	function defineValuesWC(obj, map) {
		Object.keys(map).forEach(function(key) {
			defineValueWC(obj, key, map[key]);
		});
	}

})();