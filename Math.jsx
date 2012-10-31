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