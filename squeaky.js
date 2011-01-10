/*
 * This file is part of the squeakyJS project.
 *
 * Copyright (C) 2010, bp2010h1
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA
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
