// 
// Implementations of primitive methods
// This is loaded at the very end, everything is already available
// If this gets too long, split it in multiple files
//

ProtoObject._addClassMethods({
	basicNew: function() { return this._newInstance(); },
	_new: function() { return this.basicNew().initialize(); },
	name: function() { return this._classname; }
});
ProtoObject._addInstanceMethods({
	_equals_equals: function(anObject) { return bool(this === anObject); },
	identityHash: function() { return number(this.instanceNumber$); },	
});

_Object._addInstanceMethods({
	doesNotUnderstand_: function(message) {
		// TODO implement this correctly
		var msg = this + "(instance of " + this._class().name() + 
				") did not understand " + _unboxObject(message.selector());
		Exception.signal_(string(msg));
	},
	_class: function() { return this.__class; },
	halt: function() { debugger; },
});

Exception._addInstanceMethods({
	signal: function() { 
		alert(_unboxObject(this.messageText()));
		throw this;
	}
});

_String._addInstanceMethods({
	// This is not actually a primitive function, but behaves in the same way the #, method does
	_comma: function(anotherString) { return string(this.original$ + anotherString.original$) },
	_equals: function(anotherString) { return bool(this.original$ == anotherString.original$) },
	isEmpty: function() { return bool(this.original$.length == 0) },
	size: function() { return number(this.original$.length); },
	at_: function(num) { return character(this.original$[num.original$ - 1]);},
});

ByteString._addInstanceMethods({
	at_: function(num) { return character(this.original$[num.original$ - 1]); }
});

/*
at_ should also be defined in:
ByteSymbol
WideString
WideSymbol
*/

_Number._addInstanceMethods({
	printString: function() { return string(this.original$.toString()); }
});

Float._addInstanceMethods({
	_plus: function(other) { return number(this.original$ + other.original$); },
	_minus: function(other) { return number(this.original$ - other.original$); },
	_times: function(other) { return number(this.original$ * other.original$); },
	_slash: function(other) { return number(this.original$ / other.original$); },
	floor: function() { return number(Math.floor(this.original$)); },
	rounded: function() { return number(Math.round(this.original$)); },
	_less: function(other) {
		return bool(this.original$ < other.original$);
	},
	_greater: function(other) {
		return bool(this.original$ > other.original$);
	},
	_less_equals: function(other) {
		return bool(this.original$ <= other.original$);
	},
	_greater_equals: function(other) {
		return bool(this.original$ >= other.original$);
	},
	_equals: function(other) {
		return bool(this.original$ == other.original$);
	},
	_tilde_equals: function(other) {
	  return bool(this.original$ != other.original$);
	},
	timesRepeat_: function(aBlock){
		for (var i = 0; i < this.original$; i++) {
			aBlock.value();
		}
		return this;
	},
	truncated: function() {
		return number(Math.floor(this.original$));
	},
	roundTo_: function(quantum) {
		var result = (this._slash(quantum)).rounded()._times(quantum).js();
        var decimalCount = 0;
        while (decimalCount <= 21 && quantum.js().toFixed(decimalCount) != quantum.js()) {
            decimalCount++;
        };
        return number(result.toFixed(decimalCount));
	}
});

Point._addInstanceMethods({
	_times: function(aNumber){
		return (this.x()._times(aNumber))._at(this.y()._times(aNumber));
	}
});

// We distinct an evaluated$-function and an original$-function in case of blocks.
// evaluated$ is the version, that is evaluated in the squeak-world, original$ is the function inside javascript
var _blockValueFunction_ = function() { return this.evaluated$.apply(this, arguments); };

// Helpers to implement Block-Closure-primitives
var _toArray = function(argumentsObject) { return Array.prototype.slice.apply(arguments); }
var _curried = function(func, boundArgs) { 
	return function() { return func.apply(this, boundArgs.concat(_toArray(arguments))); };
}
var _createInstance_ = function() {
	// This is done to enable varargs-parameters for constructor-parameters
	// First bind all constructor-parameters, then call the curried function without arguments
	return new (_curried(this.evaluated$, _toArray(arguments))) ();
}

BlockClosure._addInstanceMethods({
	value: _blockValueFunction_,
	value_: _blockValueFunction_,
	value_value_: _blockValueFunction_,
	value_value_value_: _blockValueFunction_,
	value_value_value_value_: _blockValueFunction_,
	
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
	jsNewWithArgs: function(args) {
		_createInstance_.apply(this, args);
	}
});

_Array._addInstanceMethods({
	size: function(){
		return number(this.original$.length);
	},
	at_put_: function(idx, val){
		this.original$[idx.original$ - 1] = val;
		return val;
	},
	at_: function(idx){
		return this.original$[idx.original$ - 1];
	},
	isEmpty: function(){
		return bool(this.original$.length == 0);
	},
	
	/* this is actually not a primitive and should be implemented by squeak.
	   it is only implemented here to work around a hardly tracable bug, probably in out blocks
	   and nonlocal return */
	includes_: function(anElement) {
    for(var i = 0; i < this.original$.length; i++) {
      if(this.original$[i]._equals(anElement).js())
        return _true;
    }
    return _false;
	}
});
_Array._addClassMethods({
	new_: function(size){
		var arr = new Array(size.original$);
		for (var i = 0; i < size.original$; i++) {
			arr[i] = nil;
		}
		return array(arr);
	}
});

// TODO must organize primitives in another way, e.g. one js-file per class in a separate subdirectory

S2JWidgetWithBoxing._addInstanceMethods({
  uniqueCssId: function() {
    var millis = new Date().getTime();
    return string(millis);
  }
});
