
(function() {

	// We distinct an evaluated$-function and an original$-function in case of blocks.
	// evaluated$ is the version, that is evaluated in the squeak-world, original$ is the function inside javascript
	var _blockValueFunction_ = function() { 
		return this.evaluated$.apply(this, _toArray(arguments)); };

	// Helpers to implement Block-Closure-primitives
	var _toArray = function(iterable) { 
		if (!iterable) return [];
		if (iterable.toArray) return iterable.toArray();
		var length = iterable.length, results = new Array(length);
		while (length--) results[length] = iterable[length];
		return results;
	};
	var _curried = function(func, boundArgs) { 
		// Return a function with the first parameters bound to boundArgs. Function itself will be bound to this.
		var f = function() { return func.apply(this, boundArgs.concat(_toArray(arguments))); };
		
		// The prototype of the curried function must be set to the prototype of the original function
		// BECAUSE: the curried function will be used as constructor (with the new-keyword). There, the prototype
		// of the newly created object (it's __proto__-slot) will be the prototype of the function applied on the new-operator.
		f.prototype = func.prototype;
		return f;
	};
	var _createInstance_ = function() {
		// This is done to enable varargs-parameters for constructor-parameters
		// First bind all constructor-parameters, then call the curried function without arguments
		// (Bind the curried function to the original function itself. Seemed necessary.)
		// Constructor-arguments are determined polymorphically (set in boxing.js -> boundBlock() and squeaky.js -> block())
		var newObject = new (_curried(this.constructor$, _toArray(arguments))) ();
		_unboxSlotObject(newObject); // unbox each slot on the new object
		return _boxObject(newObject); // but box the object itself
	};

	BlockClosure._addInstanceMethods({
		// Implementation detail. Unboxing arguments to fit into the js-native apply()-function
		_callFunctionImpl: function(func, args) {
			return func.apply(this, _unboxObject(args));
		},
		
		// Up to 4 arguments, the Squeak-methods implemented
		value: _blockValueFunction_,
		value_: _blockValueFunction_,
		value_value_: _blockValueFunction_,
		value_value_value_: _blockValueFunction_,
		value_value_value_value_: _blockValueFunction_,
		valueWithArguments_: function(args) {
			return this._callFunctionImpl(_blockValueFunction_, args);
		},
		
		whileTrue_: function(anotherBlock) {
			while (this.value() === _true) {
				anotherBlock.value();
			}
			return nil;
		},
		whileTrue: function(anotherBlock) {
			while (this.value() === _true)
				anotherBlock.value();
			return nil;
		},
		whileFalse_: function() {
			while (this.value() === _false) {
				anotherBlock.value();
			}
			return nil;
		},
		whileFalse: function() {
			while (this.value() === _false) ;
			return nil;
		},
		
		// Up to 9 parameters for direct constructor call
		jsNew: _createInstance_,
		jsNew_: _createInstance_,
		jsNew_with_: _createInstance_,
		jsNew_with_with_: _createInstance_,
		jsNew_with_with_with_: _createInstance_,
		jsNew_with_with_with_with_: _createInstance_,
		jsNew_with_with_with_with_with_: _createInstance_,
		jsNew_with_with_with_with_with_with_: _createInstance_,
		jsNew_with_with_with_with_with_with_with_: _createInstance_,
		jsNew_with_with_with_with_with_with_with_with_: _createInstance_,
		
		// Any arguments as array
		jsNewWithArgs_: function(args) {
			return this._callFunctionImpl(_createInstance_, args);
		}
	});

})();
