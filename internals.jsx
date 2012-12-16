function GetP(O, P, Receiver) {
	// 8.3.7 [[GetP]] (P, Receiver) When the [[GetP]] internal method of O is called with property key P and ECMAScipt
	// language value Receiver the following steps are taken:

	// 1. Assert: P is a valid property key, either a String or a Symbol Object.
	if (typeof P != 'string' || getTagOf(P) != 'Symbol')
		throw new TypeError('String or symbol expected.');

	// 2. Let desc be the result of calling OrdinaryGetOwnProperty with arguments O and P.
	// 3. ReturnIfAbrupt(desc).
	var desc = getOwnPropertyDescriptor(O, P);

	var parent;

	// 4. If desc is undefined, then
	if (!desc) {

		// a. Let parent be the result of calling the [[GetInheritance]] internal method of O.
		// b. ReturnIfAbrupt(parent).
		parent = getPrototypeOf(O);

		// c. If parent is null, then return undefined.
		if (!parent)
			return undefined;

		// d. Return the result of calling the [[GetP]] internal methods of parent with arguments P and Receiver.
		return GetP(parent, P, Receiver);

	}

	// 5. If IsDataDescriptor(desc) is true, return desc.[[Value]].
	if (hasOwn(desc, 'value'))
		return desc.value;

	// 6. Otherwise, IsAccessorDescriptor(desc) must be true so, let getter be desc.[[Get]].
	var getter = desc.get;

	// 7. If getter is undefined, return undefined.
	if (!getter)
		return undefined;

	// 8. Return the result of calling the [[Call]] internal method of getter with targetThis as the thisArgument and an
	// empty List as argumentsList.
	// TODO: We assume "targetThis" is supposed to be "Receiver". Check with future versions of the draft.
	return call(getter, Receiver);

}

function SetP(O, P, V, Receiver) {
	// 8.3.8 [[SetP] (P, V, Receiver)
	// When the [[SetP]] internal method of O is called with property key P, value V, and ECMAScipt language value
	// Receiver, the following steps are taken:

	// 1. Assert: P is a valid property key, either a String or a Symbol Object.
	if (typeof P != 'string' || getTagOf(P) != 'Symbol')
		throw new TypeError('String or symbol expected.');

	// 2. Let ownDesc be the result of calling OrdinaryGetOwnProperty with arguments O and P.
	// 3. ReturnIfAbrupt(ownDesc).
	var ownDesc = getOwnPropertyDescriptor(O, P);

	var parent;

	// 4. If desc is undefined, then
	if (!ownDesc) {

		// a. Let parent be the result of calling the [[GetInheritance]] internal method of O.
		// b. ReturnIfAbrupt(parent).
		parent = getPrototypeOf(O);

		// c. If parent is not null, then
		if (parent)

			// i. Return the result of calling the [[SetP]] internal methods of parent with arguments P, V, and
			// Receiver.
			return SetP(parent, P, V, Receiver);

		// d. Else,
		else {

			// i. If Type(Receiver) is not Object, return false.
			if (Object(Receiver) !== Receiver)
				return false;

			// ii. Return the result of performing CreateOwnDataProperty(Receiver, P, V).
			// TODO: What should the values of writable, configurable, enumerable be?
			return defineProperty(Receiver, P, own({ value: V }));

		}

	}

	var valueDesc, setter, setterResult;

	// 5. If IsDataDescriptor(ownDesc) is true, then
	if (hasOwn(ownDesc, 'value')) {

		// a. If ownDesc.[[Writable]] is false, return false.
		if (!ownDesc.writable)
			return false;

		// b. If SameValue(O, Receiver) is true, then
		if (is(O, Receiver)) {

			// i. Let valueDesc be the Property Descriptor {[[Value]]: V}.
			valueDesc = own({ value: V });

			// ii. Return the result of calling OrdinaryDefineOwnProperty with arguments O, P, and valueDesc.
			return defineProperty(O, P, valueDesc);

		}

		// c. Else O and Receiver are different values,
		else {

			// i. If Type(Receiver) is not Object, return false.
			if (Object(Receiver) !== Object)
				return false;

			// ii. Return the result of performing CreateOwnDataProperty(Receiver, P, V).
			return defineProperty(Receiver, P, V);

		}

	}

	// 6. If IsAccessorDescriptor(desc) is true, then
	else {

		// a. Let setter be desc.[[Set]].
		setter = desc.set;

		// b. If setter is undefined, return false.
		if (!setter)
			return false;

		// c. Let setterResult be the result of calling the [[Call]] internal method of setter providing Receiver as
		// thisArgument and a new List containing V as argumentsList.
		// d. ReturnIfAbrupt(setterResult).
		setterResult = call(setter, Receiver, V);

		// e. Return true.
		return true;

	}

}

function ToPropertyKey(argument) {
	// 9.1.10 ToPropertyKey
	// The abstract operation ToPropertyKey converts its argument to a value that can be used as a property key by
	// performing the following steps:

	// 1. ReturnIfAbrupt(argument).
	// 2. If Type(argument) is Object, then
	if (Object(argument) === argument)

		// a. If argument is an exotic String object, then
		if (getTagOf(argument) == 'Symbol')

			// i. Return argument.
			return argument;

	// 3. Return ToString(argument).
	return String(argument);

}

function Enumerate(O) {

	// 1. Let obj be O.
	var obj = O;

	// 2. Let proto be the result of calling the [[GetInheritance]] internal method of O with no arguments.
	// 3. ReturnIfAbrupt(proto).
	var proto = getPrototypeOf(O);

	var propList;

	// 4. If proto is the value null, then
	if (!proto)

		// a. Let propList be a new empty List.
		propList = [ ];

	// 5. Else
	else

		// a. Let propList be the result of calling the [[Enumerate]] internal method of proto.
		propList = Enumerate(proto);

	// 6. ReturnIfAbrupt(propList).

	// 7. For each name that is the property key of an own property of O
	forEach(keys(O), function(name) {

		var desc, index;

		// a. If Type(name) is String, then
		if (typeof name == 'string') {

			// i. Let desc be the result of calling OrdinaryGetOwnProperty with arguments O and name.
			desc = getOwnPropertyDescriptor(O, name);

			// ii. If name is an element of propList, then remove name as an element of propList.
			if (~(index = indexOf(propList, name)))
				splice(propList, index, 1);

			// iii. If desc.[[Enumerable]] is true, then add name as an element of propList.
			if (hasOwn(desc, 'enumerable') && desc.enumerable)
				push(propList, name);

		}

	});

	// 8. Order the elements of propList in an implementation defined order.
	sort(propList);

	// 9. Return propList.
	return propList;

}