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