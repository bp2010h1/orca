// Every class is added here. Needed to initialize their instance-variables later.
var ALL_CLASSES = [];

// If set to true, every method-call will be printed to console.
var DEBUG_INFINITE_RECURSION = true;

// Helper-functions are inside the Class-function to not declare them globally
var Class = function(attrs) {
	
	var createHelpers = function(newClassPrototype) {
		var createMethod = function(receiver, methodName, method) {
			receiver.prototype[methodName] = WithNonLocalReturn(method);
			receiver.prototype[methodName].methodName = methodName;
			receiver.prototype[methodName].originalMethod = method;
		}
		
		var initializeVariables = function(aPrototype, newInitialValue) {
			for (instVar in aPrototype) {
				if (aPrototype[instVar] == null) {
					aPrototype[instVar] = newInitialValue;
				}
			}
		}
		
		// Initialize all fields, that are null to the given value
		newClassPrototype.prototype._initializeInstanceVariables = function(newInitialValue) {
			initializeVariables(this._instancePrototype.prototype, newInitialValue);
			initializeVariables(this._classPrototype.prototype, newInitialValue);
		}
		
		newClassPrototype.prototype._addInstanceMethods = function(methodTable) {
			for(methodName in methodTable) {
				createMethod(this._instancePrototype, methodName, methodTable[methodName]);
			}
		}
		
		newClassPrototype.prototype._addClassMethods = function(methodTable) {
			for(methodName in methodTable) {
				createMethod(this._classPrototype, methodName, methodTable[methodName]);
			}
		}
		
		newClassPrototype.prototype._addInstanceVariables = function(variableNames, defaultValue) {
			for(idx in variableNames) {
				this._instancePrototype.prototype[variableNames[idx]] = defaultValue;
			}
		}
		
		newClassPrototype.prototype._addClassInstanceVariables = function(variableNames, defaultValue) {
			for(idx in variableNames) {
				this._classPrototype.prototype[variableNames[idx]] = defaultValue;
			}
		}
		
		newClassPrototype.prototype._addClassVariables = function(variableNames, defaultValue) {
			// TODO not implemented yet
		}
	}
	
	var createSuperSlots = function(superPrototype, newInstance) {
		newInstance._super = {}
		// TODO _super will not work, if the superclass is modified after the subclass is created (just copying...)
		
		// copy supermethods to new objects
		for(method in superPrototype) {
			// filter instance methods only
			if(typeof superPrototype[method] == 'function' && superPrototype[method].methodName != undefined) {
				wrapperFunction = function() {
					return superPrototype[arguments.callee.wrappedMethodName].apply(newInstance, arguments);
				}
				
				// local variable 'method' has to be stored explicitely because the variable is not bound inside
				// the wrapper function when the loop continues
				wrapperFunction.wrappedMethodName = method;
				newInstance._super[method] = wrapperFunction;
			}
		}
	}
	
	var createClassAndLinkPrototypes = function() {
		var newClassPrototype;
		var newInstancePrototype;
		var newClass;
		
		if ('superclass' in attrs) {
			// If we have a superclass, create slot _super and link the prototypes to enable prototypical inheritance
			newClassPrototype = function() {
				createSuperSlots(attrs.superclass._classPrototype.prototype, this);
			};
			newInstancePrototype = function() {
				createSuperSlots(attrs.superclass._instancePrototype.prototype, this);
			};
			
			// By creating new instances of the constructor-functions sotred in the superclass, the new class (and instances of it) inherits all variables/methods
			newClassPrototype.prototype = new attrs.superclass._classPrototype();
			newInstancePrototype.prototype = new attrs.superclass._instancePrototype();
		}
		else {
			// If we don't have a superclass, create the helper-methods to create variables/methods
			newClassPrototype = function(){};
			newInstancePrototype = function(){};
			createHelpers(newClassPrototype);
		}
		
		// Instantiate the new class and store the constructor-functions to create instances of them when subclassing
		newClass = new newClassPrototype();
		newClass._instancePrototype = newInstancePrototype;
		newClass._classPrototype = newClassPrototype;
		
		// create default function to instantiate a class and a variable to access the class from instances
		newClass._addClassMethods({
			_newInstance: function() {
				return new newClass._instancePrototype();
			}
		});
		newClass._addInstanceVariables(['__class'], newClass);
		
		return newClass;
	}
	
	var addVariables = function(newClass) {
		if('classInstanceVariables' in attrs) {
			newClass._addClassInstanceVariables(attrs.classInstanceVariables, null);
		}
		
		if('instanceVariables' in attrs) {
			newClass._addInstanceVariables(attrs.instanceVariables, null);
		}
		
		if('classVariables' in attrs) {
			newClass._addClassVariables(attrs.classVariables, null);
		}
	}
	
	var addMethods = function(newClass) {
		if('instanceMethods' in attrs) {
			newClass._addInstanceMethods(attrs.instanceMethods);
		}
		
		if('classMethods' in attrs) {
			newClass._addClassMethods(attrs.classMethods);
		}
	}
	
	var newClass = createClassAndLinkPrototypes();
	addVariables(newClass);
	addMethods(newClass);
	
	ALL_CLASSES[ALL_CLASSES.length] = newClass;
	return newClass;
};

// hide real method behind a wrapper method which catches exceptions
// global
var WithNonLocalReturn = function(method) {
	// this is a wrapper for method invocation
	return function() {
		try {
			if (DEBUG_INFINITE_RECURSION) {
				console.log(arguments.callee.methodName);
			}
			return method.apply(this, arguments);
		}
		catch(e) {
			if (e == method)
				return e.nonLocalReturnValue;
			else {
				if (typeof e != "function") 
				    debugger;
				
				throw e;
			}
		}
	};
}

// global
var nonLocalReturn = function(v) {
	arguments.callee.caller.nonLocalReturnValue = v;
	throw arguments.callee.caller;
}
