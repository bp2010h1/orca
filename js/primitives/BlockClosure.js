
// Runtime depends on: boxing.js, helpers.js

(function() {

	// We distinct an evaluated$-function and an original$-function in case of blocks.
	// evaluated$ is the version, that is evaluated in the squeak-world, original$ is the function inside javascript
	var blockValue = function() { 
		return this.evaluated$.apply(this, st.toArray(arguments)); };

	var createInstance = function() {
		// This is done to enable varargs-parameters for constructor-parameters
		// First bind all constructor-parameters, then call the curried function without arguments
		// (Bind the curried function to the original function itself. Seemed necessary.)
		// Constructor-arguments are determined polymorphically (set in boxing.js -> boundBlock() and squeaky.js -> block())
		var newObject = new (st.curried(this.constructor$, st.toArray(arguments))) ();
		st.unboxSlots(newObject); // unbox each slot on the new object
		return st.box(newObject); // but box the object itself
	};

	st.BlockClosure._addInstanceMethods({
		// Implementation detail. Unboxing arguments to fit into the js-native apply()-function
		_callFunction: function(func, args) {
			return func.apply(this, st.unbox(args));
		},
		
		// Up to 4 arguments, the Squeak-methods implemented
		value: blockValue,
		value_: blockValue,
		value_value_: blockValue,
		value_value_value_: blockValue,
		value_value_value_value_: blockValue,
		valueWithArguments_: function(args) {
			return this._callFunction(blockValue, args);
		},
		
		whileTrue_: function(anotherBlock) {
			while (this.value() === st.true) {
				anotherBlock.value();
			}
			return st.nil;
		},
		whileTrue: function(anotherBlock) {
			while (this.value() === st.true)
				anotherBlock.value();
			return st.nil;
		},
		whileFalse_: function() {
			while (this.value() === st.false) {
				anotherBlock.value();
			}
			return st.nil;
		},
		whileFalse: function() {
			while (this.value() === st.false) ;
			return st.nil;
		},
		
		// Up to 9 parameters for direct constructor call
		jsNew: createInstance,
		jsNew_: createInstance,
		jsNew_with_: createInstance,
		jsNew_with_with_: createInstance,
		jsNew_with_with_with_: createInstance,
		jsNew_with_with_with_with_: createInstance,
		jsNew_with_with_with_with_with_: createInstance,
		jsNew_with_with_with_with_with_with_: createInstance,
		jsNew_with_with_with_with_with_with_with_: createInstance,
		jsNew_with_with_with_with_with_with_with_with_: createInstance,
		
		// Any arguments as array
		jsNewWithArgs_: function(args) {
			return this._callFunction(createInstance, args);
		}
	});

})();
