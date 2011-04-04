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
		var result = _unboxObject((this._slash(quantum)).rounded()._times(quantum));
        var decimalCount = 0;
        while (decimalCount <= 21 && _unboxObject(quantum).toFixed(decimalCount) != _unboxObject(quantum)) {
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
var _blockValueFunction_ = function() { 
	return this.evaluated$.apply(this, arguments); };

// Helpers to implement Block-Closure-primitives
var _toArray = function(iterable) { 
	if (!iterable) return [];
	if (iterable.toArray) return iterable.toArray();
	var length = iterable.length, results = new Array(length);
	while (length--) results[length] = iterable[length];
	return results;
}
var _curried = function(func, boundArgs) { 
	// Return a function with the first parameters bound to boundArgs. Function itself will be bound to this.
	return function() { return func.apply(this, boundArgs.concat(_toArray(arguments))); };
}
var _createInstance_ = function() {
	// This is done to enable varargs-parameters for constructor-parameters
	// First bind all constructor-parameters, then call the curried function without arguments
	// Bind the function to the function itself. Seemed necessary.
	// Constructor-arguments are determined polymorphically (set in boxing.js -> boundBlock() and squeaky.js -> block())
	var args = this.constructorArguments$(_toArray(arguments));
	return _boxObject(new (_curried(this.original$, args)) ());
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
	jsNewWithArgs_: function(args) {
		_createInstance_.apply(this, args);
	}
});

_Array._addInstanceMethods({
	_privateGet: function(index) {
		return _boxObject(this.original$[index]);
	},
	_privateSet: function(index, obj) {
		this.original$[index] = _unboxObject(obj);
	},
	
	size: function(){
		return number(this.original$.length);
	},
	at_put_: function(idx, val){
		this._privateSet(idx.original$ - 1, val);
		return val;
	},
	at_: function(idx){
		return this._privateGet(idx.original$ - 1);
	},
	isEmpty: function(){
		return bool(this.original$.length == 0);
	},
	
	/* this is actually not a primitive and should be implemented by squeak.
	   it is only implemented here to work around a hardly tracable bug, probably in out blocks
	   and nonlocal return */
	includes_: function(anElement) {
		for (index in this.original$) {
			if (this._privateGet(index)._equals(anElement))
				return _true;
		}
		return _false;
	},
	asObject : function () {
		// creates Prototype from object literal
		// Can only be called on arrays containing only Associations (understanding key()/value())
		var newObject = {};
		for (index in this.original$) {
			var anAssociation = this._privateGet(index);
			newObject[_unboxObject(anAssociation.key())] = _unboxObject(anAssociation.value());
		}
		return newObject(object);
	}
});
_Array._addClassMethods({
	new_: function(size) {
		// Not filling the indices of the array with 'nil', because of autoboxing
		return array(new Array(size.original$));
	}
});
