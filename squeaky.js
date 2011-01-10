/*
 * This file is part of the squeakyJS project.
 *
 * Copyright (C) 2010, Free Software Foundation, Inc.
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
	var newClass = function() {};
	
	if('superclass' in attrs) {
		// copy superclass methods and attrs to new class
		for(attr in attrs['superclass']) {
			newClass.prototype[attr] = attrs['superclass'][attr];
		}
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
	newClass.prototype._instancePrototype = function() { };
	
	newClass.prototype.basicNew = function() {
		// create new instance of our class
		inst = new this._instancePrototype();
		
		if(inst._superclass != undefined) {
			createSuperMethods(inst._superclass._instancePrototype.prototype, inst);
		}
		
		return inst;
	}
	
	if('superclass' in attrs) {
		// inherit methods and attrs from superclass

		if(attrs['superclass']._instancePrototype != undefined) {
			for(attr in attrs['superclass']._instancePrototype.prototype) {
				newClass.prototype._instancePrototype.prototype[attr] = attrs['superclass']._instancePrototype.prototype[attr];
			}

			newClass.prototype._instancePrototype.prototype._superclass = attrs['superclass'];
		}
	}

	if('instanceVariables' in attrs) {
		// set instance variables to null by default
		for(idx in attrs['instanceVariables']) {
			// TODO: should be _nil
			newClass.prototype._instancePrototype.prototype[attrs['instanceVariables'][idx]] = null;		
		}
	}
		
	if('instanceMethods' in attrs) {
		// extent by new instance methods
		for(method in attrs['instanceMethods']) {
			newClass.prototype._instancePrototype._createMethod(method, attrs['instanceMethods'][method]);
		}
	}
	
	// "class" is a reserved keyword in Safari -> leading underline
	newClass.prototype._instancePrototype.prototype._class = new newClass();
	
	if(attrs['superclass'] != undefined) {
		createSuperMethods(attrs['superclass'], newClass.prototype._instancePrototype.prototype._class);
 	}
	
	return newClass.prototype._instancePrototype.prototype._class;
};


