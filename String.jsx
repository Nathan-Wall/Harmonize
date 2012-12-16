(function() {

	var NumberToString = lazyBind(Number.prototype.toString);

	function pad(s) {
		while (s.length < 4) s = '0' + s;
		return s;
	}

	shimProps(String, {

		fromCodePoint: function fromCodePoint(/* ...codePoints */) {

			// 1. Assert: codePoints is a well-formed rest parameter object.
			// TODO: ?
			var codePoints = arguments;

			// 2. Let length be the result of calling the [[Get]] internal method of codePoints with argument "length".
			var length = codePoints.length;

			// 3. Let elements be a new List.
			var elements = [ ];

			// 4. Let nextIndex be 0.
			var nextIndex = 0;

			var next, nextCP;

			// 5. Repeat while nextIndex < length
			while (nextIndex < length) {

				// a. Let next be the result of calling the [[Get]] internal method of codePoints with argument
				// ToString(nextIndex).
				next = codePoints[nextIndex];

				// b. Let nextCP be ToNumber(next).
				// c. ReturnIfAbrupt(nextCP).
				nextCP = Number(next);

				// d. If SameValue(nextCP, ToInteger(nextCP)) is false,then throw a RangeError exception.
				if (nextCP != NumberToInt(nextCP))
					throw new RangeError('Integer expected: ' + nextCP);

				// e. If nextCP < 0 or nextCP > 0x10FFFF, then throw a RangeError exception.
				if (nextCP < 0 || nextCP > 0x10ffff)
					throw new RangeError('Index out of range: ' + nextCP);

				// f. Append the elements of the UTF-16 Encoding (clause 6) of nextCP to the end of elements.
				push(elements, eval('"\\u' + pad(NumberToString(nextCP, 16)) + '"'));

				// g. Let nextIndex be nextIndex + 1.
				nextIndex++;

			}

			// 6. Return the string value whose elements are, in order, the elements in the List elements.
			// If length is 0, the empty string is returned.
			return join(elements, '');

		},

		raw: function raw(callSite/*, ...substitutions */) {

			// 1. Assert: substitutions is a well-formed rest parameter object.
			// TODO: ?
			var substitutions = slice(arguments, 1);

			// 2. Let cooked be ToObject(callSite).
			// 3. ReturnIfAbrupt(cooked).
			var cooked = Object(callSite);

			// 4. Let rawValue be the result of calling the [[Get]] internal method of cooked with argument "raw".
			var rawValue = cooked.raw;

			// 5. Let raw be ToObject(rawValue).
			// 6. ReturnIfAbrupt(raw).
			var raw = Object(rawValue);

			// 7. Let len be the result of calling the [[Get]] internal method of raw with argument "length".
			var len = raw.length;

			// 8. Let literalSegments be ToUint(len)
			// 9. ReturnIfAbrupt(literalSegments).
			var literalSegments = len >>> 0;

			// 10. If literalSegments = 0, then return the empty string.
			if (literalSegments == 0) return '';

			// 11. Let stringElements be a new List.
			var stringElements = [ ];

			// 12. Let nextIndex be 0.
			var nextIndex = 0;

			var nextKey, next, nextSeg, nextSub;

			// 13. Repeat while nextIndex < literalSegments
			while (nextIndex < literalSegments) {

				// a. Let nextKey be ToString(nextIndex).
				nextKey = String(nextIndex);

				// b. Let next be the result of calling the [[Get]] internal method of raw with argument nextKey.
				next = raw[nextKey];

				// c. Let nextSeg be ToString(next).
				// d. ReturnIfAbrupt(nextSeg).
				nextSeg = String(next);

				// e. Append in order the code unit elements of nextSeg to the end of stringElements.
				push(stringElements, nextSeg);

				// f. If nextIndex + 1 = literalSegments, then
				if (nextIndex + 1 == literalSegments)
					// i. Return the string value whose elements are, in order, the elements in the List stringElements.
					// If length is 0, the empty string is returned.
					return join(stringElements, '');

				// g. Let next be the result of calling the [[Get]] internal method of substitutions with argument
				// nextKey.
				next = substitutions[nextKey];

				// h. Let nextSub be ToString(next).
				// i. ReturnIfAbrupt(nextSub).
				nextSub = String(next);

				// j. Append in order the code unit elements of nextSub to the end of stringElements.
				push(stringElements, nextSub);

				// k. Let nextIndex be nextIndex + 1.
				nextIndex++;

			}

			// TODO: return?

		}

	});

	shimProps(String.prototype, {

		repeat: function repeat(count) {
			// ECMA-262 Ed. 6, 9-27-12. 15.5.4.21

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let n be the result of calling ToInteger(count).
			// According to Jason Orendorff, "Evaluating x | 0 produces ToInteger(x)." (http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger, comment)
			// I believe this is incorrect because ECMA-262 Ed. 6 9-27-12. 9.1.4 says ToInteger
			// can result in Infinity, while x | 0 cannot.
			// 5. ReturnIfAbrupt(n).
			var n = NumberToInt(count);

			// 6. If n ≤ 0, then throw a RangeError exception.
			if (n <= 0) throw new RangeError('count must be greater than 0: ' + count);

			// 7. If n is +Infinity, then throw a RangeError Exception.
			if (n == Infinity) throw new RangeError('count cannot be Infinity.');

			// 8. Let T be a String value that is made from n copies of S appended together.
			var T = '';
			for (var i = 0; i < n; i++)
				T += S;

			// 9. Return T.
			return T;

		},

		startsWith: function startsWith(searchString/*, position */) {

			// The length property of the startsWith method is 1.
			var position = arguments[1];

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let searchStr be ToString(searchString).
			// 5. ReturnIfAbrupt(searchStr).
			var searchStr = String(searchString);

			// 6. Let pos be ToInteger(position). (If position is undefined, this step produces the value 0).
			// 7. ReturnIfAbrupt(pos).
			var pos = NumberToInt(position);

			// 8. Let len be the number of elements in S.
			var len = S.length;

			// 9. Let start be min(max(pos, 0), len).
			var start = min(max(pos, 0), len);

			// 10. Let searchLength be the number of elements in searchString.
			var searchLength = searchStr.length;

			// 11. If searchLength+start is greater than len, return false.
			if (searchLength + start > len)
				return false;

			// 12. If the searchLength sequence of elements of S starting at start is the same as the full
			// element sequence of searchString, return true.
			if (StringSlice(S, start, start + searchLength) == searchStr)
				return true;

			// 13. Otherwise, return false.
			return false;

		},

		endsWith: function endsWith(searchString/*, endPosition*/) {

			// The length property of the endsWith method is 1.
			var endPosition = arguments[1];

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let searchStr be ToString(searchString).
			// 5. ReturnIfAbrupt(searchStr).
			var searchStr = String(searchString);

			// 6. Let len be the number of elements in S.
			var len = S.length;

			// 7. If endPosition is undefined, let pos be len, else let pos be ToInteger(endPosition).
			// 8. ReturnIfAbrupt(pos).
			var pos = endPosition === undefined ? len : NumberToInt(endPosition);

			// 9. Let end be min(max(pos, 0), len).
			var end = min(max(pos, 0), len);

			// 10. Let searchLength be the number of elements in searchString.
			var searchLength = searchStr.length;

			// 11. Let start be end - searchLength.
			var start = end - searchLength;

			// 12. If start is less than 0, return false.
			if (start < 0) return false;

			// 13. If the searchLength sequence of elements of S starting at start is the same as the full element
			// sequence of searchString, return true.
			if (StringSlice(S, start, start + searchLength) == searchStr)
				return true;

			// 14. Otherwise, return false.
			return false;

		},

		contains: function contains(searchString/*, position */) {

			var position = arguments[1];

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let searchStr be ToString(searchString).
			// 5. ReturnIfAbrupt(searchStr).
			var searchStr = String(searchString);

			// 6. Let pos be ToInteger(position). (If position is undefined, this step produces the value 0).
			// 7. ReturnIfAbrupt(pos).
			var pos = NumberToInt(position);

			// 8. Let len be the number of elements in S.
			var len = S.length;

			// 9. Let start be min(max(pos, 0), len).
			var start = min(max(pos, 0), len);

			// 10. Let searchLen be the number of characters in searchStr.
			var searchLen = searchStr.length;

			// 11. If there exists any integer k not smaller than start such that k + searchLen is not greater than
			// len, and for all nonnegative integers j less than searchLen, the character at position k+j of S is
			// the same as the character at position j of searchStr, return true; but if there is no such integer k,
			// return false.
			/* var test;
			for (var k = start; k + searchLen <= len; k++) {
				test = true;
				for (var j = 0; j < searchLen; j++) {
					if (S.charAt(k + j) != searchStr.charAt(j)) {
						test = false;
						break;
					}
				}
				if (test) return true;
			}
			return false; */

			return StringIndexOf(S, searchStr, start) != -1;

		},

		codePointAt: function codePointAt(pos) {

			// 1. ReturnIfAbrupt(CheckObjectCoercible(this value)).
			if (this == null)
				throw new TypeError('Context is null or undefined: ' + this);

			// 2. Let S be the result of calling ToString, giving it the this value as its argument.
			// 3. ReturnIfAbrupt(S).
			var S = String(this);

			// 4. Let position be ToInteger(pos).
			// 5. ReturnIfAbrupt(position).
			var position = NumberToInt(pos);

			// 6. Let size be the number of elements in S.
			var size = S.length;

			// 7. If position < 0 or position ≥ size, return undefined.
			if (position < 0 || position >= size) return undefined;

			// 8. Let first be the code unit value of the element at index position in the String S..
			var first = charCodeAt(S, position);

			// 9. If first < 0xD800 or first > 0xDBFF or position+1 = size, then return first.
			if (first < 0xd800 || first > 0xdbff || position + 1 == size) return first;

			// 10. Let second be the code unit value of the element at position position+1 in the String S.
			var second = charCodeAt(S, position + 1);

			// 11. If second < 0xDC00 or first > 0xDFFF, then return first.
			if (second < 0xdc00 || first > 0xdfff) return first;

			// 12. Return ((first – 0xD800) × 1024) + (second – 0xDC00) + 0x10000.
			return (first - 0xd800) * 1024 + second - 0xdc00 + 0x10000;

		}

	});

})();