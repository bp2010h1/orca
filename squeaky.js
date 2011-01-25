// Every class is added here. Needed to initialize their instance-variables later.
var ALL_CLASSES = [];

// If true, additional debugging functionality will be enabled.
var DEBUG = true;

// If set to true, every method-call will be printed to console.
var DEBUG_INFINITE_RECURSION = false;

// Each time an object (excluding classes) is created, this is incremented
var INSTANCE_COUNT = 0;

// Helper-functions are inside the Class-function to not declare them globally
var Class = function(classname, attrs) {
	
	var createHelpers = function(newClassPrototype) {
		var createMethod = function(aPrototype, methodName, method) {
			aPrototype.prototype[methodName] = WithDebugging(WithNonLocalReturn(method));
			aPrototype.prototype[methodName].methodName = methodName;
			aPrototype.prototype[methodName].originalMethod = method;
			method.methodHome = aPrototype; // This is the object, that actually contains this method
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
				createMethod(this._instancePrototype.prototype, methodName, methodTable[methodName]);
			}
		}
		
		newClassPrototype.prototype._addClassMethods = function(methodTable) {
			for(methodName in methodTable) {
				createMethod(this._classPrototype.prototype, methodName, methodTable[methodName]);
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
	
	var createClassAndLinkPrototypes = function() {
		var newClassPrototype = function(){};
		var newInstancePrototype = function(){ INSTANCE_COUNT = INSTANCE_COUNT + 1; };
		var newClass;
		
		if ('superclass' in attrs) {
			// By creating new instances of the constructor-functions sotred in the superclass, the new class (and instances of it) inherits all variables/methods
			newClassPrototype.prototype = new attrs.superclass._classPrototype();
			newInstancePrototype.prototype = new attrs.superclass._instancePrototype();
		}
		else {
			// If we don't have a superclass, create the helper-methods to create variables/methods
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
		newClass._classname = classname;
		
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

	this[classname] = newClass;
	ALL_CLASSES[ALL_CLASSES.length] = newClass;

	return newClass;
};

// global
var NonLocalReturnException = function(){ this.DontDebug = true };

// A wrapper to enable several debugging-functionalities
// global
var WithDebugging = function(method) {
	if (DEBUG) {
		return function() {
			try {
				if (DEBUG_INFINITE_RECURSION) {
					var indent = "";
					for (var i = 0; i < CALL_STACK.length; i++) {
						indent += "  ";
					}
					if (this.__class == undefined) {
						console.log(indent + this._classname + "." + arguments.callee.methodName);
					} else {
						console.log(indent + this.__class._classname + "." + arguments.callee.methodName);
					}
				}
				var result = method.apply(this, arguments);
				return result;
			} catch (e) {
				if (e.DontDebug == true) {
					throw e;
				} else if (DEBUG) {
					debugger;
				}
			}
		}
	} else {
		return method;
	}
}

// global, also used in bootstrap.js -> block()
// Each element has the slot 'currentThis' set, that represents the object, the execution is currently in
// The element itself is a unique instance, that is used to enable the non-local-return-functionality.
var CALL_STACK = [];
CALL_STACK.peek = function() { return CALL_STACK[CALL_STACK.length - 1]; };

var _super = function(methodName) {
    return function() {
		var currentContext = CALL_STACK.peek();
        var currentThis = currentContext.currentThis;
		
		// Accessing .__proto__ here brings us one step higher in the class-hierarchy
		// At this point, if the super-prototype does not define the invoked method, a MessageNotUnderstood exception should be raised in Squeak-context
		var invokedMethod = currentContext.currentMethod.methodHome.__proto__[methodName];
		
        return invokedMethod.apply(currentThis, arguments);
    }
}

// hide real method behind a wrapper method which catches exceptions
// global
var WithNonLocalReturn = function(method) {
	// this is a wrapper for method invocation
	return function() {
		var lastCallee = new NonLocalReturnException;
		lastCallee.currentThis = this;
		lastCallee.currentMethod = method;
		CALL_STACK.push(lastCallee);
		try {
			var ret =  method.apply(this, arguments);
			CALL_STACK.pop();
			return ret;
		}
		catch( e ) {
			CALL_STACK.pop();
			if ( e == lastCallee ) {
				return e.nonLocalReturnValue;
			} else {
				throw e;
			}
		}
	};
}

// global
var nonLocalReturn = function(value) {
	var blockFunction = arguments.callee.caller;
	var e = blockFunction.nonLocalReturnException;
	e.nonLocalReturnValue = value;
	throw e;
}
