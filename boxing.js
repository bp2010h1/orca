	
// This file sets up boxing of javascript native objects into squeak objects
// All relevant classes are enhanced by that functionality and there are 
// Several global functions to box or unbox objects.

// Some objects are boxing primitive js-values. Unboxing these values is polymorphic.
// The real version of this method is below. This could alternatively throw an error,
// but we try to be tolerant.
var __isBoxedObject = function() { throw "just access this slot without calling."; };
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
	_isBoxedObject: __isBoxedObject
});

// Class, that will wrap native javascript-objects to implement the Object-interface.
// Additionally, it adds accessor-methods for all fields to provide a squeak-API to
// set slots on javascript-objects.
Class("_Box", { 
	superclass: _DoesNotUnderstandClass_, 
	// regarding this method, see _Object._isBoxedObject
	instanceMethods: { _isBoxedObject: __isBoxedObject }});

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
		return _boxObject(func.apply(that, _unboxIterable(arguments)));
	}
	b.constructor$ = function() {
		// When using a library-function as constructor, unpack the arguments
		// Use the actual 'this' instead of the stored 'that'
		return func.apply(this, _unboxIterable(arguments));
	}
	// Why the prototype-slot is set, see _curried() in kernel_prototype.js
	b.constructor$.prototype = func.prototype;
	return b;
}

// There are multiple js-'classes', that will be wrapped into a Squeak-Array
var arrayConstructors = [Array, NodeList, HTMLCollection];
var isArrayObject = function(anObject) {
	for (var index in arrayConstructors) {
		if (anObject instanceof arrayConstructors[index] ) {
			return true;
		}
	}
	return false;
};

// This static unboxing-function is added to avoid adding an _unbox method to native js-objects
var _unboxObject = function(anyObject) {
	if (anyObject != undefined && anyObject != null && anyObject._isBoxedObject) {
		return anyObject._unbox();
	}
	return anyObject;
};
var _unboxIterable = function(iterable) {
	var unboxed = [];
	for (var i = 0; i < iterable.length; i++) {
		unboxed.push(_unboxObject(iterable[i]));
	}
	return unboxed;
}
var _unboxSlotObject = function(slotObject) {
	// This unboxes all slot-values of the object. The value does not need to be returned.
	// This is used in serialization of Slot-Objects (S2JSlotObject >> fillInstVars:guardedBy:)
	for (var slotName in slotObject) {
		slotObject[slotName] = _unboxObject(slotObject[slotName]);
	}
}
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
				if (isArrayObject(nativeObject)) {
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
var _boxIterable = function(iterable) {
	var boxed = [];
	for (var i = 0; i < iterable.length; i++) {
		boxed.push(_boxObject(iterable[i]));
	}
	return boxed;
}

// These boxing classes box fixed, immutable values
False._addInstanceMethods( { _unbox: function() { return false; } } );
True._addInstanceMethods( { _unbox: function() { return true; } } );
UndefinedObject._addInstanceMethods( { _unbox: function() { return null; } } );

// This instance of Object is used by instances of _Box to retrieve methods to implement Squeaks Object-protocol
// Methods are looked up here, when a queried slot/property is not found in the underlying native object.
var _DummyObjectInstance = _Object._newInstance();
_DummyObjectInstance.doesNotUnderstand_ = function(msg) { return nil; };
// These boxing classes box variable values and are all added the same functionality.
var boxingClasses = [_Box, ByteString, _Number, Character, BlockClosure, _Array];
for (var index in boxingClasses) {
	var aClass = boxingClasses[index];
	aClass._addClassMethods({
		_wrapping: function(originalObject) {
			var result = this._newInstance(); // Polymorphic for different kinds of boxes
			result.original$ = originalObject;
			return result;
		}
	});
	aClass._addInstanceMethods({
		_hiddenGetter_: function(slotName) {
			return this.original$[slotName];
		},
		doesNotUnderstand_: function(aMessage) {
			var methodName = _unboxObject(aMessage.selector());
			if (methodName[methodName.length - 1] == ':') {
				// setter. Set the unboxed, native-js, value.
				var value = aMessage._arguments();
				if (value.size()._greater_equals(number(1))) // If more then one argument, ignore the rest!
					value = value.at_(number(1));
				else // No arguments given when invoking setter!? Don't set an empty array.
					Exception.signal_(string("No sufficient arguments given on a box " + methodName));
				
				this.original$[methodName.substring(0, methodName.length - 1)] = _unboxObject(value);
				return value;
			} else {
				// getter. Second parameter relevant, if slot contains a function.
				// For most boxing classes, the javascript-native is hidden totally (this implementation).
				// _Box refines this method (_hiddenGetter_) to also check the underlying original$ for the slot
				// An example is the slot 'value', which is important on a DOM-TextArea and also implemented in Object
				return _boxObject(this._hiddenGetter_(methodName), this.original$);
			}
		},
		_unbox: function() {
			return this.original$;
		}
	});
}

var _perform_ = function (aSTString){
	var theArguments = _toArray(arguments);
	theArguments.shift();
	var method = this[_jsFunctionNameFor_(_unboxObject(aSTString))];
	if (method !== undefined) {
		return method.apply(this, theArguments);
	} else {
		return this.doesNotUnderstand_(Message.selector_arguments_(aSTString, array(theArguments)));
	}
};

_Box._addInstanceMethods({
	_hiddenGetter_: function(slotName) {
		var result = this.original$[slotName];
		// First check, if the underlying object has this slot.
		// If not, try to invoke the corresponding Method implemented on Object (e.g. ifNil:ifNotNil:)
		// If this is not present, return nil.
		if (result === undefined) {
			// Get the method to be invoked from global "dummy-method-dictionary"; invoke it on ourselves.
			result = _DummyObjectInstance[slotName].apply(this);
		}
		return result;
	},
	// copied from Object: Parallel hierarchy since ProtoObject should not be able to perform.
	perform_: _perform_,
	perform_with_: _perform_,
	perform_with_with_: _perform_,
	perform_with_with_with_: _perform_,
	perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection){
		return _perform_.apply(this, _unboxObject(anArgumentsCollection));
	}
});
