/*
	Presentation
	============
	- how super works (JavaScript apply function)
	- instance variables are initializely set to nil (null) in Squeak
*/

Class = function(attributes)
{
	var newClass = function() {};

	if('superClass' in attributes) {
		for(attr in attributes['superClass']) {
			newClass.prototype[attr] = attributes['superClass'][attr];
		}
		
		newClass.prototype.$superClass = attributes['superClass'];
		newClass.prototype.$super = function(method, args) {
			return this.$superClass[method].apply(this, args);
		};
	}

	if('classVariables' in attributes) {
		for(idx in attributes['classVariables']) {
			newClass.prototype[attributes['classVariables'][idx]] = null;		
		}
	}

	if('classMethods' in attributes) {
		for(method in attributes['classMethods']) {
			newClass.prototype[method] = attributes['classMethods'][method];		
		}		
	}
	
	newClass.prototype.$objectPrototype = function() { this.initialize(); };

	newClass.prototype.new = function() {
		return new this.$objectPrototype();
	}
	
	if('superClass' in attributes) {
		newClass.prototype.$objectPrototype.prototype = attributes['superClass'].new();
		newClass.prototype.$objectPrototype.prototype.$superClass = attributes['superClass'];
		newClass.prototype.$objectPrototype.prototype.$super = function(method, args) {
			return this.$superClass.$objectPrototype.prototype[method].apply(this, args);
		};
	}

	if('instanceVariables' in attributes) {
		for(idx in attributes['instanceVariables']) {
			newClass.prototype.$objectPrototype.prototype[attributes['instanceVariables'][idx]] = null;		
		}
	}
		
	if('instanceMethods' in attributes) {
		for(method in attributes['instanceMethods']) {
			newClass.prototype.$objectPrototype.prototype[method] = attributes['instanceMethods'][method];		
		}
	}
	
	newClass.prototype.$objectPrototype.prototype.class = new newClass();
	
	return newClass.prototype.$objectPrototype.prototype.class;
};

/*
Class = function(attributes)
{
	var newClass = function() { this.initialize(); };

	if('superClass' in attributes) {
		newClass.prototype = new attributes['superClass']();
		newClass.prototype.$superClass = attributes['superClass'];
		newClass.prototype.$super = function(method, args) {
			this.$superClass.prototype[method].apply(this, args);
		};
	}

	if('instanceVariables' in attributes) {
		for(idx in attributes['instanceVariables']) {
			newClass.prototype[attributes['instanceVariables'][idx]] = null;		
		}
	}
		
	if('instanceMethods' in attributes) {
		for(method in attributes['instanceMethods']) {
			newClass.prototype[method] = attributes['instanceMethods'][method];		
		}
	}
	
	return newClass;
};*/