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