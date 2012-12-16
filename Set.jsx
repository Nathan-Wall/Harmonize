var Set = (function() {

	var MapHas = lazyBind(Map.prototype.has),
		MapSet = lazyBind(Map.prototype.set),
		MapDelete = lazyBind(Map.prototype.delete),
		MapForEach = lazyBind(Map.prototype.forEach),
		MapSize = lazyBind(getOwnPropertyDescriptor(Map.prototype, 'size').get),
		MapKeys = lazyBind(Map.prototype.keys),
		MapIteratorNext = lazyBind(getPrototypeOf(new Map().values()).next);

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
				if (getTagOf(x) == 'StopIteration') return obj;
				else throw x;
			}

			// c. Let next be ToObject(next).
			// d. ReturnIfAbrupt(next).
			// TODO: This seems wrong. Why convert to object? check with ES Discuss. I'm commenting it out for now.
			// next = Object(next);

			// e. Let status be the result of calling the [[Call]] internal method of adder with obj as thisArgument and
			// a List whose sole element is v as argumentsList.
			// f. ReturnIfAbrupt(status).
			call(adder, obj, next);

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

			call(SetConstructor, this, iterable);
			S.set('Set:#constructed', true);

		} else return call(SetFunction, this, iterable);

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
			if (MapHas(entries, value))
				return;

			// 6. Append p as the last element of entries.
			MapSet(entries, value, true);

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

			return MapDelete($.get('[[SetData]]', value);

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
			MapForEach(entries, function(value, key) {
				call(callbackfn, T, key, S);
			});

			// 8. Return undefined.

			// The length property of the forEach method is 1.

		},

		// TODO: contains?
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

			return MapHas(entries, value);

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

			return MapSize(entries);

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
		$i.set('SetIterator:MapIterator:values', MapKeys(entries));

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

			return MapIteratorNext(values);

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