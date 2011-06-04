
// Runtime depends on: boxing.js, helpers.js

(function() {

	// We distinct an _evaluated-function and an _original-function in case of blocks.
	// _evaluated is the version, that is evaluated in the squeak-world, _original is the function inside javascript
	var __blockValue = function() { 
		return this._evaluated.apply(this, st.toArray(arguments)); };

	var __createInstance = function() {
		// This is done to enable varargs-parameters for constructor-parameters
		// First bind all constructor-parameters, then call the curried function without arguments
		// (Bind the curried function to the original function itself. Seemed necessary.)
		// Constructor-arguments are determined polymorphically (set in boxing.js -> boundBlock() and classes.js -> block())
		var newObject = new (st.curried(this._constructor, st.toArray(arguments))) ();
		st.unboxSlots(newObject); // unbox each slot on the new object
		return st.box(newObject); // but box the object itself
	};

	st.BlockClosure._addInstanceMethods({
		// Implementation detail. Unboxing arguments to fit into the js-native apply()-function
		_callFunction: function(func, args) {
			return func.apply(this, st.unbox(args));
		},
		
		// Up to 5 arguments, the Squeak-methods implemented
		value: __blockValue,
		value_: __blockValue,
		value_value_: __blockValue,
		value_value_value_: __blockValue,
		value_value_value_value_: __blockValue,
		value_value_value_value_value_: __blockValue,
		valueWithArguments_: function(args) {
			return this._callFunction(__blockValue, args);
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
		jsNew: __createInstance,
		jsNew_: __createInstance,
		jsNew_with_: __createInstance,
		jsNew_with_with_: __createInstance,
		jsNew_with_with_with_: __createInstance,
		jsNew_with_with_with_with_: __createInstance,
		jsNew_with_with_with_with_with_: __createInstance,
		jsNew_with_with_with_with_with_with_: __createInstance,
		jsNew_with_with_with_with_with_with_with_: __createInstance,
		jsNew_with_with_with_with_with_with_with_with_: __createInstance,
		
		// Any arguments as array
		jsNewWithArgs_: function(args) {
			return this._callFunction(__createInstance, args);
		},
		cull_ : function (firstargs) {
			/* For Javascript functions it doesn't matters how many arguments are expected and used; and we can't check it */
			return this.value_(firstargs);
		},
		on_do_ : function ( aKindOfError, anExceptionalBlock) {
			try {
				 return  this.value();
			} catch (e) {
				if( e._class() == aKindOfError ) {
					return  anExceptionalBlock.value_(e);
				}else {
					throw e;
				}
			}
		},
		ensure_ : function ( anotherBlock ) {
			try {
				return this.value();
			}
			catch (e) {
				return  anotherBlock.value_(e);
			}
		}
	});

})();
