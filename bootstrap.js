
// Function called when a method with an unimplemented primitive declaration is called
var primitiveDeclaration = function() {
	throw("Primitive has been called!!! The method containing it is: \n\n" + 
		CALL_STACK.peek().currentThis.__class._classname + "." +
		CALL_STACK.peek().currentMethod.methodName +
		"\n(implemented in class " + CALL_STACK.peek().currentMethod.methodHome.__class._classname + ")") };

// instead of bool(true) and bool(false) (which would be the equivalent to string(""), number(2) etc.)
var _true = True._newInstance();
var _false = False._newInstance();
var nil = UndefinedObject._newInstance();

// Now, that nil is available, initialize all instance-variables of all classes to nil
for (aClass in SqueakyJS.ALL_CLASSES) {
	SqueakyJS.ALL_CLASSES[aClass]._initializeInstanceVariables(nil);
}

//We want to be able to evaluate parameter functions. We just handle them like a block. 
//So we implement value, etc. for Functions
Function.prototype.value = function() { 
	return this.apply(null, null); };
Function.prototype.value_ = function (a){ return this.apply(null, [a.js()]); };
Function.prototype.value_value_ = function (a, b){ return this.apply(null, [a.js(), b.js()]); };
Function.prototype.valueWithArguments_ = function(argsArray) { return this.apply(null, argsArray.js()); };

// Each object can convert itself into a js-only version. Used to unpack primitive values like Strings and Numbers from
// their Squeak-wrapper-objects. As short as possible, as it is called on every argument of js-library-calls.
// A js-function is also added to the prototype of the js-primitive Object (but at the very end of all our scripts).
// 
_Object._addInstanceMethods({
  js: function() {
    //throw ("Trying to pass a Squeak-object into a javascript-library-call! " + this);
    return this;
	},
	unbox: function() {
	  return this.js();
	}
});
	
False._addInstanceMethods( { js: function() { return false; } } );
True._addInstanceMethods( { js: function() { return true; } } );
UndefinedObject._addInstanceMethods( { js: function() { return null; } } );
ByteString._addInstanceMethods( { js: function() { return this.string$; } } );
_Number._addInstanceMethods( { js: function() { return this.num$; } } );
Character._addInstanceMethods( { js: function() { return this.character$; } } );
BlockClosure._addInstanceMethods( { js: function() { return this.func$; } } );
_Array._addInstanceMethods( { js: function() { return SqueakyJS.stripArray(this.arr$); }} );
OrderedCollection._addInstanceMethods( { js: function() { return this.$array.js(); }} );

SqueakyJS.stripArray = function (stArray){
	var returnArray = [];
	for(var i = 0; i < stArray.length; i++){
		if (stArray[i] && typeof stArray[i].js == "function"){
			returnArray[i] = stArray[i].js();
		} else {
			returnArray[i] = stArray[i];
		}
	}
	return returnArray; 
};
// 
// Functions to bootstrap primitive values and wrap them into 'squeak'-objects
// 

// the compiled code does not use this (uses _true/_false) directly. Can use this in kernel_primitives.js etc.
var bool = function(aBool) {
	if (aBool) {
		return _true;
	} else {
		return _false;
	}
}

var character = function(aString) {
	var resultCharacter = Character._newInstance();
	resultCharacter.character$ = aString;
	return resultCharacter;
}

var string = function(aString) {
	var resultString = ByteString._newInstance();
	resultString.string$ = aString;
	return resultString;
}

var number = function(number) {
	var resultNumber = Float._newInstance();
	resultNumber.num$ = number;
	return resultNumber;
}

var array = function(anArray) {
	var resultArray = _Array._newInstance();
	resultArray.arr$ = anArray;
	return resultArray;
}

var block = function(func) {
	var b = BlockClosure._newInstance();
	func.nonLocalReturnException = CALL_STACK.peek();
	var currentThis = arguments.callee.caller.originalThis;
	if (currentThis == undefined) {
		// We are in the most-outer block of a method. The 'current this' is the top of the call-stack.
		currentThis = CALL_STACK.peek() && CALL_STACK.peek().currentThis;
	}
	func.originalThis = currentThis;
	b.func$ = function() {
		// Use the CALL_STACK to get the object, this block should be executed in
		return func.apply(currentThis, arguments);
	}
	return b;
}

// if we box a javascript function into a smalltalk block we must bind it on creation
var boundBlock = function(func, that) {
	var b = BlockClosure._newInstance();
	b.func$ = function() {
		return S2JBox.on_(func.apply(that, arguments));
	}
  // in case we want to box a constructor function, we can send it a new message like so:
  // ST: (S2JBox on: f) new
  // JS: same effect as >> new f();
  b._new = function(){
    return S2JBox.on_(new func());
  }
	return b;
}

S2JConnection.doIt = function(source) {
  return eval("WithNonLocalReturn(function(){" + source + "}).apply(nil);");
}

var serverBlock = function (squeakCode) {
	// Will be evaluated directly on the server
	// evaluation is needed for the serialization of
	// Smalltalks Object>>storeString method
	return block(function(){
		var args = [ squeakCode ];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		return S2JServer.performOnServer.apply(S2JServer,args);
	});
}
