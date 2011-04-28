
// This file sets up boxing of javascript native objects into squeak objects
// All relevant classes are enhanced by that functionality and there are
// several global functions to box or unbox objects.

// Setup depends on: classes, classes.js, perform.js
// Runtime depends on: bootstrap.js

// API:
// st.box(anyObject)
// st.unbox(anyObject)
// st.boxIterable(anIterable)
// st.unboxIterable(anIterable)
// st.unboxSlots(anObject)

// API for boxing a specific type of object:
// st.bool(aBoolean)
// st.char(aString)
// st.string(aString)
// st.number(aNumber)
// st.array(anArray)
// st.object(anObject)
// st.boundBlock(aNonSqueakFunction, containingObject)

(function() {

	// Set up the namespace
	var home = window.st ? window.st : (window.st = {});

	//
	// API functions
	//

	home.unbox = function(anyObject) {
		if (anyObject != undefined && anyObject != null && anyObject._isBoxedObject) {
			return anyObject._unbox();
		}
		return anyObject;
	};

	// The 'that' parameter is optional and will be undefined otherwise.
	// It is relevant when boxing functions, to bind them to their containing object when invoking them.
	home.box = function(nativeObject, that) {
		if (nativeObject === null || nativeObject === undefined) {
			return st.nil;
		}
		if (!nativeObject._isBoxedObject) {
			switch( typeof(nativeObject) ) {
				case "number": return home.number(nativeObject); break;
				case "string": return home.string(nativeObject); break;
				case "boolean": return home.bool(nativeObject); break;
				case "function": return home.boundBlock(nativeObject, that); break;
				case "object":
					if (isArrayObject(nativeObject)) {
						return home.array(nativeObject);
					} else {
						return home.object(nativeObject);
					}
					break;
				default:
					alert("Could not box creepy object: " + nativeObject);
			}
		}
		// nativeObject is already boxed!
		return nativeObject;
	};

	home.unboxIterable = function(iterable) {
		var unboxed = [];
		for (var i = 0; i < iterable.length; i++) {
			unboxed.push(home.unbox(iterable[i]));
		}
		return unboxed;
	}

	home.boxIterable = function(iterable) {
		var boxed = [];
		for (var i = 0; i < iterable.length; i++) {
			boxed.push(home.box(iterable[i]));
		}
		return boxed;
	}

	home.unboxSlots = function(anObject) {
		// This unboxes all slot-values of the object. The value does not need to be returned.
		// This is used in serialization of Slot-Objects (OrcaSlotObject >> fillInstVars:guardedBy:)
		for (var slotName in anObject) {
			anObject[slotName] = home.unbox(anObject[slotName]);
		}
	}

	// Functions to bootstrap primitive values and wrap them into 'squeak'-objects
	// Most functions are used in translated code directly, to avoid switch-statement in st.box()
	// (Instead of bool(), compiled code uses st.true/st.false directly. bool() is used in kernel_primitives.js etc.)

	home.bool = function(aBool) { if (aBool) { return st.true; } else { return st.false; } };

	home.char = function(aString) { return st.char._wrapping(aString); };

	home.string = function(aString) { return st.ByteString._wrapping(aString); };

	home.number = function(aNumber) { return st.Float._wrapping(aNumber); };

	home.array = function(anArray) { return st.Array._wrapping(anArray); };

	home.object = function(anObject) { return OrcaBox._wrapping(anObject); };

	home.boundBlock = function(func, that) {
		// if we box a javascript function into a smalltalk block we must bind it on creation
		// Non-local-return handling is not required here
		var b = st.BlockClosure._newInstance();
		// This block is unboxed to func, but additional things happen on evaluation
		b._original = func;
		b._evaluated = function() {
			return home.box(func.apply(that, st.unboxIterable(arguments)));
		}
		b._constructor = function() {
			// When using a library-function as constructor, unpack the arguments
			// Use the actual 'this' instead of the stored 'that'
			return func.apply(this, st.unboxIterable(arguments));
		}
		// Why the prototype-slot is set, see _curried() in kernel_prototype.js
		b._constructor.prototype = func.prototype;
		return b;
	};

	//
	// Private functions
	//

	var isBoxedObject = function() { throw "just access this slot without calling."; };

	st.Object._addInstanceMethods({
		_unbox: function() {
			// Be tolerant: It's still possible to pass a pure-Squeak object into a library-function
			return this;
		},

		// This never gets called, we just need a true-ish slot in each box-instance
		_isBoxedObject: isBoxedObject
	});

	// Class, that will wrap native javascript-objects to implement the Object-interface.
	// Additionally, it adds accessor-methods for all fields to provide a squeak-API to
	// set slots on javascript-objects.
	st.class("OrcaBox", {
		superclass: st.doesNotUnderstandClass,
		instanceMethods: {
			_isBoxedObject: isBoxedObject,

			_hiddenGetter: function(selector) {
				var result = this._original[selector];
				// First check, if the underlying object has this slot.
				// If not, try to invoke the corresponding Method implemented on Object (e.g. ifNil:ifNotNil:)
				// If this is not present, return nil.
				if (result === undefined) {
					// Get the method to be invoked from global "-method-dictionary"; invoke it on ourselves.
					result = st.performMethodFrom.call(this, selector, dummyObjectInstance);
				}
				return result;
			},

			// Implementation of OrcaSlotObject >> slotsDo:
			// Maps to the 'in'-operator
			slotsDo_: function(aBlock) {
				for (slotName in this._original) {
					aBlock.value_(home.box(slotName));
				}
				return this;
			},

			// copied from Object: Parallel hierarchy since ProtoObject should not be able to perform.
			perform_: st.perform,
			perform_with_: st.perform,
			perform_with_with_: st.perform,
			perform_with_with_with_: st.perform,
			perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection){
				return st.perform.apply(this, home.unbox(anArgumentsCollection));
			}
		}
	});
	// Remove the OrcaBox class from the st-namespace, make it local
	var OrcaBox = st.OrcaBox;
	delete st.OrcaBox;

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

	// These boxing classes box fixed, immutable values
	st.False._addInstanceMethods( { _unbox: function() { return false; } } );
	st.True._addInstanceMethods( { _unbox: function() { return true; } } );
	st.UndefinedObject._addInstanceMethods( { _unbox: function() { return null; } } );

	// This instance of Object is used by instances of OrcaBox to retrieve methods to implement Squeaks Object-protocol
	// Methods are looked up here, when a queried slot/property is not found in the underlying native object.
	var dummyObjectInstance = st.Object._newInstance();
	dummyObjectInstance.doesNotUnderstand_ = function(msg) { return st.nil; };

	// These boxing classes box variable values and are all added the same functionality.
	var boxingClasses = [OrcaBox, st.ByteString, st.Number, st.Character, st.BlockClosure, st.Array];
	for (var index in boxingClasses) {
		var aClass = boxingClasses[index];
		aClass._addClassMethods({
			_wrapping: function(originalObject) {
				var result = this._newInstance(); // Polymorphic for different kinds of boxes
				result._original = originalObject;
				return result;
			}
		});
		if (aClass != OrcaBox)
			aClass._addInstanceMethods({
				_hiddenGetter: function(slotName) {
					return this._original[slotName];
				}
			});
		aClass._addInstanceMethods({
			toString: function() {
				return st.super("toString")() + " wrapping " + st.unbox(this);
			},
			doesNotUnderstand_: function(aMessage) {
				var methodName = home.unbox(aMessage.selector());
				if (methodName[methodName.length - 1] == ':') {
					// setter. Set the unboxed, native-js, value.
					var value = aMessage._arguments();
					if (value.size()._greater_equals(home.number(1))) // If more then one argument, ignore the rest!
						value = value.at_(home.number(1));
					else // No arguments given when invoking setter!? Don't set an empty array.
						Exception.signal_(string("No sufficient arguments given on a box " + methodName));

					this._original[methodName.substring(0, methodName.length - 1)] = home.unbox(value);
					return value;
				} else {
					// getter. Second parameter relevant, if slot contains a function.
					// For most boxing classes, the javascript-native is hidden totally (this implementation).
					// OrcaBox refines this method (_hiddenGetter) to also check the underlying _original for the slot
					// An example is the slot 'value', which is important on a DOM-TextArea and also implemented in Object
					return home.box(this._hiddenGetter(methodName), this._original);
				}
			},
			_unbox: function() {
				return this._original;
			}
		});
	}

})();
