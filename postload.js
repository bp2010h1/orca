// instead of boolean(true) and boolean(false) (which would be the equivalent to string(""), number(2) etc.)
_true = True.basicNew();
_false = False.basicNew();

// Make JsGlobal alert: 'something' work out of the box
// Not really needed... !? TODO this object should be accessible through a js-keyword or something, parse it directly instead of JsGlobal
JsGlobal = this;

// Helper functions...
// Please check whether they're needed..
primitiveDeclaration = function(){ alert(arguments.callee.caller.caller.name) };
JsGlobal.repeatWithPause = function(block, interval){ setInterval(function(){block.value()}, interval.num$) };

// Each object can convert itself into a js-only version. Used to unpack primitive values like Strings and Numbers from
// their Squeak-wrapper-objects. As short as possible, as it is called on every argument of js-library-calls.
Object.prototype.js = function() {
  return this;
}
False._objectPrototype.prototype.js = function() { return false; }
True._objectPrototype.prototype.js = function() { return true; }
ByteString._objectPrototype.prototype.js = function() { return this.string$; }
Float._objectPrototype.prototype.js = function() { return this.num$; }
Character._objectPrototype.prototype.js = function() { return this.character$; }

// allow to use AnyClass.new() instead of new AnyClass(); where AnyClass is a function
// TODO Where/Why is this needed?
Function.prototype._new = function(){
 var obj = {};
 this.apply(obj, arguments);
 return obj;
};

// special function to bootstrap Character-primitives (cannot name it char)
character = function(aString) {
  resultCharacter = Character.basicNew();
  resultCharacter.character$ = aString;
  return resultCharacter;
}

// special function to bootstrap String-primitives
string = function(aString) {
  resultString = ByteString.basicNew();
  resultString.string$ = aString;
  return resultString;
}

// special function to bootstrap Number-primitives
number = function(number) {
  resultNumber = Float.basicNew();
  resultNumber.num$ = number;
  return resultNumber;
}

// special function to create blocks
block = function(func, that) {
	b = BlockClosure._new();
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