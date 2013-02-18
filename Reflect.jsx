var ReflectHas;

var Reflect = (function() {

	return {

		getPrototypeOf: Object.getPrototypeOf,

		// Note: We cannot implement setPrototypeOf .. at least without a significant overhead.

		isExtensible: Object.isExtensible,
		preventExtensions: Object.preventExtensions,
		hasOwn: lazyBind(Object.prototype.hasOwnProperty),
		getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,

		get: function get(target, propertyKey/*, receiver = target */) {

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let key be ToPropertyKey(propertyKey).
			// 4. ReturnIfAbrupt(key).
			var key = ToPropertyKey(propertyKey);

			// 5. If receiver is not present, then
			var receiver = arguments.length < 3 ? arguments[2]
				// a. Let receiver be target.
				: target;

			// 6. Return the result of calling the [[GetP]] internal method of obj with arguments key, and receiver.
			return GetP(obj, key, receiver);

		},

		set: function set(target, propertyKey, V/* receiver = target */) {

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let key be ToPropertyKey(propertyKey).
			// 4. ReturnIfAbrupt(key).
			var key = ToPropertyKey(propertyKey);

			// 5. If receiver is not present, then
			var receiver = arguments.length < 3 ? arguments[2]
				// a. Let receiver be target.
				: target;

			// 6. Return the result of calling the [[SetP]] internal method of obj with arguments key, V, and receiver.
			return SetP(obj, key, V, receiver);

		},

		deleteProperty: function deleteProperty(target, propertyKey) {
			// 15.17.1.9 Reflect.deleteProperty (target, propertyKey)
			// When the deleteProperty function is called with arguments target and propertyKey, the following steps are
			// taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let key be ToPropertyKey(propertyKey).
			// 4. ReturnIfAbrupt(key).
			var key = ToPropertyKey(propertyKey);

			// 5. Return the result of calling the [[Delete]] internal method of obj with argument key.
			delete obj[key];

		},

		defineProperty: function defineProperty(target, propertyKey, Attributes) {
			// 15.17.1.10 Reflect.defineProperty(target, propertyKey, Attributes)
			// When the defineProperty function is called with arguments target, propertyKey, and Attributes the
			// following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let key be ToPropertyKey(propertyKey).
			// 4. ReturnIfAbrupt(key).
			var key = ToPropertyKey(propertyKey);

			// 5. Let desc be the result of calling ToPropertyDescriptor with Attributes as the argument.
			// 6. ReturnIfAbrupt(desc).

			// 7. Return the result of calling the [[DefineOwnProperty]] internal method of obj with arguments key, and
			// desc.
			defineProperty(obj, key, Attributes)

		},

		enumerate: function enumerate(target) {
			// 15.17.1.11 Reflect.enumerate (target)
			// When the enumerate function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let itr be the result of calling the [[Enumerate]] internal method of obj.
			var itr = Enumerate(obj);

			// 4. Return itr.
			return itr;

		},

		keys: function keys(target) {
			// 15.17.1.12 Reflect.keys (target)
			// When the keys function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let keys be the result of calling the [[Keys]] internal method of obj.
			// 4. ReturnIfAbrupt(keys).
			var keys = keys(obj);

			// 5. Return CreateArrayFromList(keys).
			return keys;

		},

		getOwnPropertyNames: function getOwnPropertyNames(target) {
			// 15.17.1.13 Reflect.getOwnPropertyNames (target)
			// When the getOwnPropertyNames function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let keys be the result of calling the [[OwnPropertyKeys]] internal method of obj.
			// 4. ReturnIfAbrupt(keys).
			var keys = getOwnPropertyNames(obj);

			// 5. Return CreateArrayFromList(keys).
			return keys;

		},

		freeze: function freeze(target) {
			// 15.17.1.14 Reflect.freeze (target)
			// When the freeze function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Return the result of calling the [[Freeze]] internal method of obj.
			return freeze(obj);

		},

		seal: function seal(target) {
			// 15.17.1.15 Reflect.seal (target)
			// When the seal function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Return the result of calling the [[Freeze]] internal method of obj.
			// Note: surely [[Seal]] was intended.
			return seal(obj);

		},

		isFrozen: function isFrozen(target) {
			// 15.17.1.16 Reflect.isFrozen (target)
			// When the isFrozen function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Return the result of calling the [[IsFrozen]] internal method of obj.
			return isFrozen(obj);

		},

		isSealed: function isSealed(target) {
			// 15.17.1.17 Reflect.isSealed (target)
			// When the isSealed function is called with argument target the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Return the result of calling the [[IsSealed]] internal method of obj.
			return isSealed(obj);

		},

		has: ReflectHas = function has(target, propertyKey) {
			// 15.17.2.1 Reflect.has (target, propertyKey)
			// When the has function is called with arguments target and propertyKey, the following steps are taken:

			// 1. Let obj be ToObject(target).
			// 2. ReturnIfAbrupt(obj).
			var obj = Object(target);

			// 3. Let key be ToPropertyKey(propertyKey).
			// 4. ReturnIfAbrupt(key).
			var key = ToPropertyKey(propertyKey);

			// 5. Return the result of HasProperty( obj, key).
			return key in obj;

		},

		instanceOf: function instanceOf(target, O) {
			// 15.17.2.1 Reflect.instanceOf (target, O)
			// When the instanceOf function is called with arguments target and O, the following steps are taken:

			// 1. Return the result of OrdinaryInstanceOf(target, O).
			return target instanceof O;

		}

	};

})();