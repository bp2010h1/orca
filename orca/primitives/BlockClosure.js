
(function() {

	// We distinct an evaluated$-function and an original$-function in case of blocks.
	// evaluated$ is the version, that is evaluated in the squeak-world, original$ is the function inside javascript
	var _blockValueFunction_ = function() { 
		return this.evaluated$.apply(this, st.toArray(arguments)); };


	var _createInstance_ = function() {
		// This is done to enable varargs-parameters for constructor-parameters
		// First bind all constructor-parameters, then call the curried function without arguments
		// (Bind the curried function to the original function itself. Seemed necessary.)
		// Constructor-arguments are determined polymorphically (set in boxing.js -> boundBlock() and squeaky.js -> block())
		var newObject = new (_curried(this.constructor$, st.toArray(arguments))) ();
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
