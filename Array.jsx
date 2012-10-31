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

})();