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