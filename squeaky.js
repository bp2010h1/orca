
// hide real method behind a wrapper methods which catches exceptions
WithNonLocalReturn = function(method) {
 	// this is a wrapper for method invocation
 	methodWithNonLocalReturn = function() {
 		try {
 			return method.apply(this, arguments);
 		}
 		catch(e) {
 			if(e == method)
 				return e.nonLocalReturnValue;
 			else
 				throw e;
 		}
 	};
 	methodWithNonLocalReturn.$originalMethod = method;
 	return methodWithNonLocalReturn;
}

nonLocalReturn = function(v) {
	arguments.callee.caller.nonLocalReturnValue = v;
	throw arguments.callee.caller;
}

Function.prototype._createMethod = function(name, method) {
	// this is a wrapper for method invocation
	this.prototype[name] = WithNonLocalReturn(method);
}

Class = function(attrs) {
	var newClass = function() {};
	
	if('superclass' in attrs) {
		// copy superclass methods and attrs to new class
		for(attr in attrs['superclass']) {
			newClass.prototype[attr] = attrs['superclass'][attr];
  	  // until we got a cleaner solution for translation of super we do it like this:
    	newClass.prototype.mockForSuper = attrs['superclass']._objectPrototype.prototype;
		}
		
		newClass.prototype._super = function(method, args) {
			// super calls methods without invoker for avoiding infinite recursion because
			// just the invoker comes from the superclass, the invoked method comes from the current class
			return attrs['superclass'][method].apply(this, args);
		};
	}
	
  // better do not yourself message send in cascades then remove this code TODO
	newClass.prototype.yourself = function() { return this };

	if('classVariables' in attrs) {
		// extent by new class variables
		for(idx in attrs['classVariables']) {
			newClass.prototype[attrs['classVariables'][idx]] = null;		
		}
	}

	if('classMethods' in attrs) {
		// extent by new class methods
		for(method in attrs['classMethods']) {
			newClass._createMethod(method, attrs['classMethods'][method]);
		}		
	}
	
	// initialize method is called after instanciation
   newClass.prototype._objectPrototype = function() { };
	
	// "new" is a reserved keyword in Safari -> leading underline
	newClass.prototype.basicNew = function() {
		// create new instance of our class
		return new this._objectPrototype();
	}
	
	if('superclass' in attrs) {
		// inherit methods and attrs from superclass

		if(attrs['superclass']._objectPrototype != undefined) {
			for(attr in attrs['superclass']._objectPrototype.prototype) {
				newClass.prototype._objectPrototype.prototype[attr] = attrs['superclass']._objectPrototype.prototype[attr];
			}

			newClass.prototype._objectPrototype.prototype._superClass = attrs['superclass'];
		
			// ability to call superclass methods in the context of the current object
			newClass.prototype._objectPrototype.prototype._super = function(method, args) {
				// super calls methods without invoker for avoiding infinite recursion because
  				// just the invoker comes from the superclass, the invoked method comes from the current class
  				return this._superClass._objectPrototype.prototype[method].apply(this, args);
  			};
		}
	}

	if('instanceVariables' in attrs) {
		// set instance variables to null by default
		for(idx in attrs['instanceVariables']) {
			newClass.prototype._objectPrototype.prototype[attrs['instanceVariables'][idx]] = null;		
		}
	}
		
	if('instanceMethods' in attrs) {
		// extent by new instance methods
		for(method in attrs['instanceMethods']) {
			newClass.prototype._objectPrototype._createMethod(method, attrs['instanceMethods'][method]);
		}
	}
	
	// "class" is a reserved keyword in Safari -> leading underline
	newClass.prototype._objectPrototype.prototype._class = new newClass();
	
	return newClass.prototype._objectPrototype.prototype._class;
};
