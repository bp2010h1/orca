
// This file sets up boxing of javascript native objects into squeak objects
// All relevant classes are enhanced by that functionality and there are 
// Several global functions to box or unbox objects.

// Some objects are boxing primitive js-values. Unboxing these values is polymorphic.
// The real version of this method is below. This could alternatively throw an error,
// but we try to be tolerant.
_Object._addInstanceMethods({
	_unbox: function() {
		return this;
	},
	// This never gets called, we just need a true-ish slot in each box-instance
	_isBoxedObject: function() { throw "just access this slot without calling."; }
});

// Class, that will wrap native javascript-objects to implement the Object-interface.
// Additionally, it adds accessor-methods for all fields to provide a squeak-API to
// set slots on javascript-objects.
Class("_Box", { superclass: _Object }};

// Functions to bootstrap primitive values and wrap them into 'squeak'-objects
// Most functions are used in translated code directly, to avoid switch-statement in _boxObject()
// (Instead of bool(), compiled code uses _true/_false directly. bool() is used in kernel_primitives.js etc.)
var bool = function(aBool) { if (aBool) { return _true; } else { return _false; } }
var character = function(aString) { return Character._wrapping(aString); }
var string = function(aString) { return ByteString._wrapping(aString); }
var number = function(aNumber) { return Float._wrapping(number); }
var array = function(anArray) { return _Array._wrapping(anArray); }
var object = function(anArray) { return _Box._wrapping(anArray); }
// if we box a javascript function into a smalltalk block we must bind it on creation
// Non-local-return handling is not required here
var boundBlock = function(func, that) {
	var b = BlockClosure._newInstance();
	b.original$ = function() {
		var unboxedArguments = [];
		for (index in arguments) {
			unboxedArguments.push(arguments[index].unbox());
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
	if (_boxObject._isBoxedObject) {
		return _boxObject._unbox();
	}
	return anyObject;
};
var _boxObject = function(nativeObject, that) { // The 'that' parameter is optional and will be undefined otherwise
	if (nativeObject._isBoxedObject) {
		switch( typeof(nativeObject) ) {
			case "number": return number(nativeObject); break;
			case "string": return string(nativeObject); break;
			case "boolean": return bool(nativeObject); break;
			case "function": return boundBlock(nativeObject, that); break;
			case "undefined": return nil; break;
			case "object":
				if (nativeObject == null) {
					return nil;
				} else if (isArrayObject(nativeObject) {
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
var getAllPropertyNames = function(obj) {
	if (typeof(obj) == "object" && obj != null) {
		// recurse up the prototype chain until null
		return Object.getOwnPropertyNames(obj).concat(getAllPropertyNames(obj.__proto__));
	} else {
		return [];
	}
};
for (index in boxingClasses) {
	var aClass = boxingClasses[index];
	aClass.addClassMethods({
		_wrapping: function(originalObject) {
			var result = _Box._new();
			result.original$ = originalObject;
			result._generateAccessors();
			return result;
		}
	});
	aClass.addInstanceMethods({
		_unbox: {
			return this.original$;
		}
	});
}
