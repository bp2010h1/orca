/*
 * Copyright (c) 2009, 2010 bp2010h1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// hide real method behind a wrapper methods which catches exceptions
WithNonLocalReturn = function(method) {
 	// this is a wrapper for method invocation
 	methodWithNonLocalReturn = function() {
 		try {
 			return arguments.callee.originalMethod.apply(this, arguments);
 		}
 		catch(e) {
 			if(e == method)
 				return e.nonLocalReturnValue;
 			else
 				throw e;
 		}
 	};

 	methodWithNonLocalReturn.originalMethod = method;
 	return methodWithNonLocalReturn;
}

nonLocalReturn = function(v) {
	arguments.callee.caller.nonLocalReturnValue = v;
	throw arguments.callee.caller;
}

Function.prototype._createMethod = function(name, method) {
	// this is a wrapper for method invocation
	this.prototype[name] = WithNonLocalReturn(method);
	this.prototype[name].isMethod = true;
}

createSuperMethods = function(superPrototype, newInstance) {
	newInstance._super = {}

	// copy supermethods to new objects
	for(method in superPrototype) {
		// filter instance methods only
		if(typeof superPrototype[method] == 'function' && superPrototype[method].isMethod != undefined) {
			wrapperFunction = function() {
				// super methods are called in the new object's context
				return superPrototype[arguments.callee.wrappedMethodName].apply(newInstance, arguments);
			}
			
			// local variable 'method' has to be stored explicitely because the variable is not bound inside
			// the wrapper function when the loop continues
			wrapperFunction.wrappedMethodName = method;
			newInstance._super[method] = wrapperFunction;
		}
	}
}

Class = function(attrs) {
	var newClass = function() { };
	
	if('superclass' in attrs) {
		// inherit methods and variables from superclass
		newClass.prototype = new attrs.superclass._classPrototype();
	}
	
	// better do not yourself message send in cascades then remove this code TODO
	newClass.prototype.yourself = function() { return this };

	if('classInstanceVariables' in attrs) {
		// extent by new class variables
		for(idx in attrs.classInstanceVariables) {
			// TODO: should be _nil
			newClass.prototype[attrs.classInstanceVariables[idx]] = null;		
		}
	}

	if('classMethods' in attrs) {
		// extent by new class methods
		for(method in attrs.classMethods) {
			newClass._createMethod(method, attrs.classMethods[method]);
		}		
	}
	
	// initialize method is called after instanciation
	newClass.prototype._instancePrototype = function() { };	
	
	newClass.prototype.basicNew = function() {
		// create new instance of our class
		var inst = new this._instancePrototype();
		
		if('superclass' in attrs) {
			createSuperMethods(attrs.superclass._instancePrototype.prototype, inst);
		}
		
		return inst;
	}
		
	// inherit methods and variables from superclass
	if('superclass' in attrs && attrs.superclass._instancePrototype != undefined) {
		newClass.prototype._instancePrototype.prototype = new attrs.superclass._instancePrototype;
	}

	if('instanceVariables' in attrs) {
		// set instance variables to null by default
		for(idx in attrs.instanceVariables) {
			// TODO: should be _nil
			newClass.prototype._instancePrototype.prototype[attrs.instanceVariables[idx]] = null;		
		}
	}
		
	if('instanceMethods' in attrs) {
		// override with new instance methods
		for(method in attrs.instanceMethods) {
			newClass.prototype._instancePrototype._createMethod(method, attrs.instanceMethods[method]);
		}
	}
	
	newClass.prototype._classPrototype = newClass;
	
	// _addClassMethod method for metaprogramming
	newClass.prototype._addClassMethod = function(name, method) {
		this._classPrototype.prototype[name] = method;
	};	
	
	// _addInstanceMethod method for metaprogramming
	newClass.prototype._addInstanceMethod = function(name, method) {
		this._instancePrototype.prototype[name] = method;
	};
	
	// "class" is a reserved keyword in Safari -> leading underscore
	newClass.prototype._instancePrototype.prototype._class = new newClass();
	
	if('superclass' in attrs) {
		createSuperMethods(attrs.superclass, newClass.prototype._instancePrototype.prototype._class);
 	}
	
	return newClass.prototype._instancePrototype.prototype._class;
};
