var ArrayOf = function of(/* ...items */) {

	var items = arguments;

	// 1. Let lenValue be the result of calling the [[Get]] internal method of items with the argument "length".
	var lenValue = items.length;

	// 2. Let len be ToInteger(lenValue).
	var len = NumberToInt(lenValue);

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
		defineProperty(A, Pk, {
			value: kValue,
			writable: true,
			enumerable: true,
			configurable: true
		});

		// e. Increase k by 1.
		k++;

	}

	// 9. Let putStatus be the result of calling the [[Put]] internal method of A with arguments "length", len,
	// and true.
	// 10. ReturnIfAbrupt(putStatus).
	A.length = len;

	// 11. Return A.
	return A;

};

var ArrayFrom = function from(arrayLike/*, mapFn */) {
	// Note: The mapFn argument is not in the spec yet, but it is expected.
	// TODO: Followup later and make sure it makes it to the spec.
	// TODO: ArrayFrom may also need to be generalized to create objects which
	// extend Array, such as TypedArrays.

	var mapFn = arguments[1];

	if (mapFn !== undefined && typeof mapFn != 'function')
		throw new TypeError('Function expected.');

	// 1. Let items be ToObject(arrayLike).
	// 2. ReturnIfAbrupt(items).
	var items = Object(arrayLike);

	// 3. Let lenValue be the result of calling the [[Get]] internal method of items with the argument "length".
	var lenValue = items.length;

	// 4. Let len be ToInteger(lenValue).
	// 5. ReturnIfAbrupt(len).
	var len = NumberToInt(lenValue);

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
			defineProperty(A, Pk, {
				value: mapFn === undefined ? kValue : mapFn(kValue),
				writable: true,
				enumerable: true,
				configurable: true
			});

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

};

var ArrayProtoContains = function contains(value) {
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

};

var ArrayProtoItems = function items() {
	// 15.4.4.23 Array.prototype.items ( )
	// The following steps are taken:

	// 1. Let O be the result of calling ToObject with the this value as its argument.
	// 2. ReturnIfAbrupt(O).
	var O = Object(this);

	// 3. Return the result of calling the CreateArrayIterator abstract operation with arguments O and
	// "key+value".
	return CreateArrayIterator(O, 'key+value');

};

var ArrayProtoKeys = function keys() {
	// 15.4.4.24 Array.prototype.keys ( )
	// The following steps are taken:

	// 1. Let O be the result of calling ToObject with the this value as its argument.
	// 2. ReturnIfAbrupt(O).
	var O = Object(this);

	// 3. Return the result of calling the CreateArrayIterator abstract operation with arguments O and "key".
	return CreateArrayIterator(O, 'key');

};

var ArrayProtoValues = function values() {
	// 15.4.4.25 Array.prototype.values
	// The following steps are taken:

	// 1. Let O be the result of calling ToObject with the this value as its argument.
	// 2. ReturnIfAbrupt(O).
	var O = Object(this);

	// 3. Return the result of calling the CreateArrayIterator abstract operation with arguments O and "value".
	return CreateArrayIterator(O, 'value');

};

shimProps(Array, {
	of: ArrayOf,
	from: ArrayFrom
});

shimProps(Array.prototype, {
	contains: ArrayProtoContains,
	items: ArrayProtoItems,
	keys: ArrayProtoKeys,
	values: ArrayProtoValues
});

// 15.4.4.26 Array.prototype.@@iterator ( )
// The initial value of the @@iterator property is the same function object as the initial value of the
// Array.prototype.items property.
// TODO: Check later drafts; rev. 11 has a comment saying: "Or should it be values?" so it could change.
// TODO: When @@iterator is available in implementations find a way to set like: $$(Array.prototype, 'iterator', @@iterator).
// TODO: Changing `items` to `values` seems to fix some stuff, but would it be right to do?
$$(Array.prototype, 'iterator', Array.prototype.values);

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
		if (~StringIndexOf(itemKind, 'sparse')) {

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
		if (~StringIndexOf(itemKind, 'value'))

			// a. Let elementValue be the result of calling the [[Get]] internal method of a with argument
			// elementKey.
			// b. ReturnIfAbrupt(elementValue).
			elementValue = a[elementKey];

		if (~StringIndexOf(itemKind, 'key+value')) {
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
		else if(~StringIndexOf(itemKind, 'key'))
			return elementKey;

		// 17. Else itemKind is "value",
		else if(itemKind === 'value')

			// a. Return elementValue.
			return elementValue;

	}

};

$$(ArrayIteratorPrototype, 'iterator', function $$iterator() {
	// 15.4.6.2.3 ArrayIterator.prototype.@@iterator ( )
	// The following steps are taken:

	// 1. Return the this value.
	return this;

});

// 15.4.6.2.4 ArrayIterator.prototype.@@toStringTag
// The initial value of the @@toStringTag property is the string value "Array Iterator".
$$(ArrayIteratorPrototype, 'toStringTag', 'Array Iterator');