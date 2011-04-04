
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
	b.constructorArguments$ = function(argumentCollection) {
		// When using a library-function as constructor, unpack the arguments
		return _unboxIterable(argumentCollection);
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
	if (anyObject != undefined && anyObject != null && anyObject._isBoxedObject) {
		return anyObject._unbox();
	}
	return anyObject;
};
var _unboxIterable = function(iterable) {
	var unboxed = [];
	for (index in iterable) {
		unboxed.push(_unboxObject(iterable[index]));
	}
	return unboxed;
}
var _unboxSlotObject = function(slotObject) {
	// This unboxes all slot-values of the object. The value does not need to be returned.
	// This is used in serialization of Slot-Objects (S2JSlotObject >> fillInstVars:guardedBy:)
	for (index in slotObject) {
		slotObject[index] = _unboxObject(slotObject[index]);
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
	for (index in iterable) {
		boxed.push(_boxObject(iterable[index]));
	}
	return boxed;
}

// These boxing classes box fixed, immutable values
False._addInstanceMethods( { _unbox: function() { return false; } } );
True._addInstanceMethods( { _unbox: function() { return true; } } );
UndefinedObject._addInstanceMethods( { _unbox: function() { return null; } } );

// This DummyClass implements doesNotUnderstand: returning nil. This enables correct behaviour
// Of the _Box-class. An instance of _Box needs an instance of such a Dummy to implement the Object-interface.
// This Dummy-instance is invoked, if the original$-object does not have the queried slot.
Class("_DummyClass", {superclass: _Object, instanceMethods: { doesNotUnderstand_: function() { return nil; }}});
var _wrappingImpl = function(originalObject) {
	var result = this._newInstance(); // Polymorphic for different kinds of boxes
	result.original$ = originalObject;
	return result;
};
// These boxing classes box variable values and are all added the same functionality.
var boxingClasses = [_Box, ByteString, _Number, Character, BlockClosure, _Array];
for (index in boxingClasses) {
	var aClass = boxingClasses[index];
	aClass._addClassMethods({
		_wrapping: _wrappingImpl
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
				if (value.length >= 1) // If more then one argument, ignore the rest!
					value = value[0];
				else // No arguments given when invoking setter!? Don't set an empty array.
					value = undefined;
				
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
_Box._addClassMethods({
	_wrapping: function(originalObject) {
		// In addition to the default original$-slot, also create a dummy-Object-instance.
		// This is a hack to implement the Object-protocol in a _Box. _Box inherits from _DoesNotUnderstandClass_,
		// so it does not implement any of Object's methods (to be able to fully access the underlying native object).
		// If the underlying object does not contain a certain slot, the method is invoked on the dummy-instance instead.
		// This way we have methods like #hash and #ifNil:ifNotNil: on boxed native objects.
		var result = _wrappingImpl.apply(this, arguments);
		result.dummyObject$ = _DummyClass._newInstance();
		return result;
	}
});

var _perform_ = function (aSTString){
		var theArguments = _toArray(arguments);
		theArguments.shift();
		var aJSString = _unboxObject(aSTString); //TODO: translated the selector to JS
		if(this[aJSString] !== undefined){
			return this[aJSString].apply(this, theArguments);
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
			// If not, invoke it on our 'dummyObject' to implement the Object-protocol of Squeak.
			// As this covers only 'getters', invoke without arguments.
			// This returns nil, if there is no such method. This corresponds to the javascript-behaviour,
			// when querying a slot, that is not present.
			result = this.dummyObject$[slotName]();
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
