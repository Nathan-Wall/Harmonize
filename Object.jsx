// TODO: Object.prototype.assign if possible.

(function() {

	shimProps(Object, {

		getPropertyNames: function getPropertyNames(obj) {

			if (Object(obj) !== obj)
				throw new Error('Object.getPropertyNames called on non-object: ' + obj);

			var names = [ ];

			do {
				names = concat(names, getOwnPropertyNames(obj));
			} while (obj = getPrototypeOf(obj));

			return names;

		},

		getPropertyDescriptor: function getPropertyDescriptor(obj, name) {

			if (Object(obj) !== obj)
				throw new Error('Object.getPropertyDescriptor called on non-object: ' + obj);

			var desc;

			do {
				desc = getOwnPropertyDescriptor(obj, name);
			} while (!desc && (obj = getPrototypeOf(obj)));

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

	var original = lazyBind(Object.prototype.toString),
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
		var NativeBrand = StringSlice(original(O), 8, -1);
		if (nativeBrands[NativeBrand] && NativeBrand != 'Object')
			return NativeBrand;

		// 6. Else
		else {

			// a. Let hasTag be the result of calling the [[HasProperty]] internal method of O with argument
			// @@toStringTag.
			var hasTag = ReflectHas(O, $$toStringTag);

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