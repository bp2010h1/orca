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
 	return function() {
 		try {
 			return method.apply(this, arguments);
 		}
 		catch(e) {
 			if(e == method)
 				return e.nonLocalReturnValue;
 			else
 				throw e;
 		}
 	}
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
	
	if('superClass' in attrs) {
		// copy superclass methods and attrs to new class
		for(attr in attrs['superClass']) {
			newClass.prototype[attr] = attrs['superClass'][attr];
		}
		
		newClass.prototype._superClass = attrs['superClass'];
		newClass.prototype._super = function(method, args) {
			// super calls methods without invoker for avoiding infinite recursion because
			// just the invoker comes from the superclass, the invoked method comes from the current class
			return this._superClass[method].apply(this, args);
		};
	}

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
		
	if('superClass' in attrs) {
		// inherit methods and attrs from superclass
    for(attr in attrs['superClass']._objectPrototype.prototype) {
      newClass.prototype._objectPrototype.prototype[attr] = attrs['superClass']._objectPrototype.prototype[attr];
    }
    // newClass.prototype._objectPrototype.prototype = attrs['superClass']._new();
		newClass.prototype._objectPrototype.prototype._superClass = attrs['superClass'];
		
		// ability to call superclass methods in the context of the current object
		newClass.prototype._objectPrototype.prototype._super = function(method, args) {
			// super calls methods without invoker for avoiding infinite recursion because
			// just the invoker comes from the superclass, the invoked method comes from the current class
			return this._superClass._objectPrototype.prototype[method].apply(this, args);
		};
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

BlockClosure = Class({
	instanceMethods: {
		value: function() {
			return this.$func.apply(this, arguments);
		}
	}
});


block = function(func) {
	b = BlockClosure._new();
	b.$creationContext = arguments.callee.caller;
	
	b.$func = function() {
		try {
			ret = func.apply(this, arguments);
			if (ret.$creationContext == func) {
				ret.$creationContext = this.$creationContext;
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
}
