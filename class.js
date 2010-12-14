///////// JS Class Implementation ////////
//
// Author: Robert Strobl
// Email: robert.strobl@gloriabyte.de
// License: GPL
//

Class = function(attributes)
{
	var newClass = function() {};

	if('superClass' in attributes) {
		// copy superclass methods and attributes to new class
		for(attr in attributes['superClass']) {
			newClass.prototype[attr] = attributes['superClass'][attr];
		}
		
		newClass.prototype.$superClass = attributes['superClass'];
		newClass.prototype.$super = function(method, args) {
			return this.$superClass[method].apply(this, args);
		};
	}

	if('classVariables' in attributes) {
		// extent by new class variables
		for(idx in attributes['classVariables']) {
			newClass.prototype[attributes['classVariables'][idx]] = null;		
		}
	}

	if('classMethods' in attributes) {
		// extent by new class methods
		for(method in attributes['classMethods']) {
			newClass.prototype[method] = attributes['classMethods'][method];		
		}		
	}
	
	// initialize method is called after instanciation
	newClass.prototype.$objectPrototype = function() { this.initialize(); };

	newClass.prototype.new = function() {
		// create new instance of our class
		return new this.$objectPrototype();
	}
	
	if('superClass' in attributes) {
		// inherit methods and attributes from superclass
		newClass.prototype.$objectPrototype.prototype = attributes['superClass'].new();
		newClass.prototype.$objectPrototype.prototype.$superClass = attributes['superClass'];
		
		// ability to call superclass methods in the context of the current object
		newClass.prototype.$objectPrototype.prototype.$super = function(method, args) {
			return this.$superClass.$objectPrototype.prototype[method].apply(this, args);
		};
	}

	if('instanceVariables' in attributes) {
		// set instance variables to null by default
		for(idx in attributes['instanceVariables']) {
			newClass.prototype.$objectPrototype.prototype[attributes['instanceVariables'][idx]] = null;		
		}
	}
		
	if('instanceMethods' in attributes) {
		// extent by new instance methods
		for(method in attributes['instanceMethods']) {
			newClass.prototype.$objectPrototype.prototype[method] = attributes['instanceMethods'][method];		
		}
	}
	
	newClass.prototype.$objectPrototype.prototype.class = new newClass();
	
	return newClass.prototype.$objectPrototype.prototype.class;
};
