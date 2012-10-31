var SafeList = (function() {
	/* SafeList is like an Array and has all the methods of an array.
	 * The difference is the methods on the prototype can't be altered to discover what's being
	 * passed in the arguments to a method in a SafeList.
	 * In other words, SafeList provides an internal-only array implementation, which hides the
	 * activities of the things which use it, such as WeakMap.
	 */

	function SafeList() {
		Array.apply(this);
	}

	SafeList.prototype = Object.create(Array.prototype);

	Object.getOwnPropertyNames(Array.prototype).forEach(function(name) {
		Object.defineProperty(
			SafeList.prototype, name,
			Object.getOwnPropertyDescriptor(Array.prototype, name)
		);
	});

	Object.defineProperty(Array.prototype, 'search', {

		value: function search() {
			// TODO
		},

		writable: true,
		configurable: true

	});

	return SafeList;

})();