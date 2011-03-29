
// This file sets up boxing of javascript native objects into squeak objects
// All relevant classes are enhanced by that functionality and there are 
// Several global functions to box or unbox objects.

// Some objects are boxing primitive js-values. Unboxing these values is polymorphic.
// The real version of this method is below. This could alternatively throw an error,
// but we try to be tolerant.
_Object._addInstanceMethods({
	__giveError: function(methodname) {
		var msg = "We have an obsolete " + methodname + "()-call! Fix it.";
		alert(msg);
		throw msg;
	},
	// TODO if we're sure everything is fixed, remove these warnings.
	js: function() {
		this.__giveError("js");
	},
	jsNew_: function() {
		this.__giveError("jsNew:");
	},
	js_: function() {
		this.__giveError("js:");
	},
	slot_be_: function() {
		this.__giveError("slot:be:");
	},
	slot_: function() {
		this.__giveError("slot:");
	},
	slot_apply_: function() {
		this.__giveError("slot:apply:");
	},
	
	_unbox: function() {
		return this;
	},
	// This never gets called, we just need a true-ish slot in each box-instance
	_isBoxedObject: function() { throw "just access this slot without calling."; }
});

// Class, that will wrap native javascript-objects to implement the Object-interface.
// Additionally, it adds accessor-methods for all fields to provide a squeak-API to
// set slots on javascript-objects.
Class("_Box", { superclass: _Object });

// Functions to bootstrap primitive values and wrap them into 'squeak'-objects
// Most functions are used in translated code directly, to avoid switch-statement in _boxObject()
// (Instead of bool(), compiled code uses _true/_false directly. bool() is used in kernel_primitives.js etc.)
var bool = function(aBool) { if (aBool) { return _true; } else { return _false; } }
var character = function(aString) { return Character._wrapping(aString); }
var string = function(aString) { return ByteString._wrapping(aString); }
var number = function(aNumber) { return Float._wrapping(aNumber); }
var array = function(anArray) { return _Array._wrapping(anArray); }
var object = function(anObject) { return _Box._wrapping(anObject); }
// if we box a javascript function into a smalltalk block we must bind it on creation
// Non-local-return handling is not required here
var boundBlock = function(func, that) {
	var b = BlockClosure._newInstance();
	// This block is unboxed to func, but additional things happen on evaluation
	b.original$ = func;
	b.evaluated$ = function() {
		var unboxedArguments = [];
		for (index in arguments) {
			unboxedArguments.push(_unboxObject(arguments[index]));
		}
		return _boxObject(func.apply(that, unboxedArguments));
	}
	return b;
}

// There are multiple js-'classes', that will be wrapped into a Squeak-Array
var arrayConstructors = [Array, NodeList];
var isArrayObject = function(anObject) {
	var constructor = anObject.constructor;
	for (index in arrayConstructors) {
		if (arrayConstructors[index] == constructor) {
			return true;
		}
	}
	return false;
};

// This static unboxing-function is added to avoid adding an _unbox method to native js-objects
var _unboxObject = function(anyObject) {
	if (anyObject._isBoxedObject) {
		return anyObject._unbox();
	}
	return anyObject;
};
// The 'that' parameter is optional and will be undefined otherwise
// It is relevant for functions, to bind them to their containing object when invoking them.
var _boxObject = function(nativeObject, that) {
	if (nativeObject === null || nativeObject === undefined) {
		return nil;
	}
	if (!nativeObject._isBoxedObject) {
		switch( typeof(nativeObject) ) {
			case "number": return number(nativeObject); break;
			case "string": return string(nativeObject); break;
			case "boolean": return bool(nativeObject); break;
			case "function": return boundBlock(nativeObject, that); break;
			case "object":
				if (nativeObject == null) {
					return nil;
				} else if (isArrayObject(nativeObject)) {
					return array(nativeObject);
				} else {
					return object(nativeObject);
				}
				break;
			default:
				alert("Could not box creepy object: " + nativeObject);
		}
    }
	// nativeObject is already boxed!
	return nativeObject;
};

// These boxing classes box fixed, immutable values
False._addInstanceMethods( { _unbox: function() { return false; } } );
True._addInstanceMethods( { _unbox: function() { return true; } } );
UndefinedObject._addInstanceMethods( { _unbox: function() { return null; } } );

// These boxing classes box variable values and are all added the same functionality.
var boxingClasses = [_Box, ByteString, _Number, Character, BlockClosure, _Array, OrderedCollection];
for (index in boxingClasses) {
	var aClass = boxingClasses[index];
	aClass._addClassMethods({
		_wrapping: function(originalObject) {
			var result = this._newInstance(); // Polymorphic for different kinds of boxes
			result.original$ = originalObject;
			return result;
		}
	});
	aClass._addInstanceMethods({
		doesNotUnderstand_: function(aMessage) {
			var methodName = _unboxObject(aMessage.selector());
			if (methodName[methodName.length-1] == '_') {
				// setter. Set the unboxed, native-js, value.
				var value = aMessage.arguments().first();
				this.original$[methodName.substring(0, methodName.length - 1)] = _unboxObject(value);
				return value;
			} else {
				// getter. Second parameter relevant, if slot contains a function.
				return _boxObject(this.original$[methodName], this.original$);
			}
		},
		_unbox: function() {
			return this.original$;
		}
	});
}
