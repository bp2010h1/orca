
// Make JsGlobal alert: 'something' work out of the box
// Not really needed... !? TODO this object should be accessible through a js-keyword or something, parse it directly instead of JsGlobal
var JsGlobal = this;
JsGlobal.primitiveDeclaration = function(){ alert(this) };



// TODO This should actually come from the image (Behaviour). #basicNew will be a primitive (implemented in kernel_primitives.js)
Function.prototype._new = function(){
 var obj = {};
 this.apply(obj, arguments);
 return obj;
};






// instead of bool(true) and bool(false) (which would be the equivalent to string(""), number(2) etc.)
var _true = True.newInstance();
var _false = False.newInstance();


// 
// Each object can convert itself into a js-only version. Used to unpack primitive values like Strings and Numbers from
// their Squeak-wrapper-objects. As short as possible, as it is called on every argument of js-library-calls.
// 
Object.prototype.js = function() {
  return this;
}
False._addInstanceMethods( { js: function() { return false; } } );
True._addInstanceMethods( { js: function() { return true; } } );
ByteString._addInstanceMethods( { js: function() { return this.string$; } } );
Float._addInstanceMethods( { js: function() { return this.num$; } } );
Character._addInstanceMethods( { js: function() { return this.character$; } } );
_Array._addInstanceMethods( { js: function() { return this.arr$; } } );


// 
// Functions to bootstrap primitive values and wrap them into 'squeak'-objects
// 

// the compiled code does not use this (uses _true/_false) directly. Can use this in kernel_primitives.js etc.
var bool = function(aBool) {
  if (bool) {
	return _true;
  } else {
	return _false;
  }
}

// (cannot name it char)
var character = function(aString) {
  resultCharacter = Character.newInstance();
  resultCharacter.character$ = aString;
  return resultCharacter;
}

var string = function(aString) {
  resultString = ByteString.newInstance();
  resultString.string$ = aString;
  return resultString;
}

var number = function(number) {
  resultNumber = Float.newInstance();
  resultNumber.num$ = number;
  return resultNumber;
}

var array = function(anArray) {
  resultArray = Array.newInstance();
  resultArray.arr$ = anArray;
  return resultArray;
}

var block = function(func, that) {
	b = BlockClosure.newInstance();
	b.$creationContext = arguments.callee.caller;
	
	b.$func = function() {
		try {
			ret = func.apply(that, arguments);
			if (ret != undefined) {
			  if(ret.$creationContext == func) {
				  ret.$creationContext = this.$creationContext;
			  }
		  }
			return ret;
		}
		catch(e) {
			if(e == func) {
				this.$creationContext.nonLocalReturnValue = e.nonLocalReturnValue;
				throw this.$creationContext;
			} 
			else {
				throw e;
			}
		}
	}
	b.$func.$creationContext = arguments.callee.caller;
	
	return b;
};