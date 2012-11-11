var Map = (function() {
	// TODO: It would probably be good to clean up deleted keys when possible. This is not a trivial task, however,
	// as cleanup can't break forEach and MapIterator, and it must update indices in object-keys and primitive-keys.

	var mNumber = 0;

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
		S.set('[[MapData]]', [ ]);
		S.set('#MapRecordId', 'Map:id:' + (mNumber++));
		// [Store size for efficiency.]
		S.set('Map:size', 0);
		// [Store indices by key for efficiency.]
		S.set('Map:primitive-keys', Object.create(null));
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
			map = Object.create(Map.prototype);

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
			S.set('[[MapData]]', [ ]);
			S.set('Map:size', 0);
			S.set('#MapRecordId', 'Map:id:' + (mNumber++));
			S.set('Map:primitive-keys', Object.create(null));
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
			p = Object.create(null);
			p.key = key;
			p.value = value;

			// 7. Append p as the last element of entries.
			entries.push(p);
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
		var itr = Object.create(MapIteratorPrototype);

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