// Script requires: communication.js or server.js, console.js

// API:
// st.classes = array
// st.peekCallStack()
// st.super(methodName)
// st.nonLocalReturn(returnValue)
// st.block(function)
// st.class(classname, attributes)

// Settings:
// st.DEBUG (boolean)
// st.PRINT_CALLS (boolean)

(function(){

	// Set up the namespace
	if (!st) st = {};

	// Settings
	st.DEBUG = true;
	st.PRINT_CALLS = false;

	// Globals
	st.classes = [];

	// 
	// API functions
	// 

	st.peekCallStack = function() {
		return callStack[callStack.length - 1];
	};

	st.super = function(methodName) {
		return function() {
			var currentContext = st.peekCallStack();
			// Accessing .__proto__ here brings us one step higher in the class-hierarchy
			// At this point, if the super-prototype does not define the invoked method, a MessageNotUnderstood exception should be raised in Squeak-context
			var invokedMethod = currentContext.currentMethod.methodHome.__proto__[methodName];
			return invokedMethod.apply(currentContext.currentThis, arguments);
		};
	};

	st.nonLocalReturn = function(value) {
		var blockFunction = arguments.callee.caller;
		var e = blockFunction.nonLocalReturnException;
		e.nonLocalReturnValue = value;
		throw e;
	};

	st.block = function(func) {
		var b = BlockClosure._newInstance();
		func.nonLocalReturnException = st.peekCallStack();
		var currentThis = arguments.callee.caller.originalThis;
		if (currentThis == undefined) {
			// We are in the outer-most block of a method. The 'current this' is the top of the call-stack.
			currentThis = st.peekCallStack() && st.peekCallStack().currentThis;
		}
		func.originalThis = currentThis;
		// Unboxing a real block must give the same function as when evaluating it.
		b.original$ = b.evaluated$ = function() {
			// Use the callStack to get the object, this block should be executed in.
			// box the arguments in any case, as this is code parsed from Squeak-code and relies on the auto-boxing.
			return func.apply(currentThis, _boxIterable(arguments));
		}
		b.constructor$ = function() {
			// When using real blocks as constructor, don't unpack the constructor-parameters, 
			// but box them to be sure (should not be necessary).
			// Use the real 'this' instead of the currentThis from the artificial stack
			return func.apply(this, _boxIterable(arguments));
		}
		return b;
	};

	// This function creates a class with a given name and attributes.
	st.class = function(classname, attrs) {
		var createHelpers = function(newClassPrototype) {
			var createMethod = function(aPrototype, methodName, method) {
				aPrototype[methodName] = WithDebugging(WithNonLocalReturn(method));
				aPrototype[methodName].methodName = methodName;
				aPrototype[methodName].originalMethod = method;
				method.methodName = methodName;
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
					if (typeof methodTable[methodName] == 'function'){
						createMethod(this._instancePrototype.prototype, methodName, methodTable[methodName]);
					}
				}
			}
			
			newClassPrototype.prototype._addClassMethods = function(methodTable) {
				for(methodName in methodTable) {
					if (typeof methodTable[methodName] == 'function'){
						createMethod(this._classPrototype.prototype, methodName, methodTable[methodName]);
					}
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
		};
		
		var createClassAndLinkPrototypes = function() {
			var newClassPrototype = function(){};
			var newInstancePrototype = function(){ instanceCount++; this.instanceNumber$ = instanceCount; };
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
		};
		
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
		};
		
		var addMethods = function(newClass) {
			if('instanceMethods' in attrs) {
				newClass._addInstanceMethods(attrs.instanceMethods);
			}
			
			if('classMethods' in attrs) {
				newClass._addClassMethods(attrs.classMethods);
			}
		};
		
		var newClass = createClassAndLinkPrototypes();
		addVariables(newClass);
		addMethods(newClass);
		
		this[classname] = newClass;
		st.classes[st.classes.length] = newClass;
		
		return newClass;
	};

	// 
	// Private functions
	// 

	// Each time an object (excluding classes) is created, this is incremented
	var instanceCount = 0;

	// Each element has the slot 'currentThis' set, that represents the object, the execution is currently in
	// The element itself is a unique instance, that is used to enable the non-local-return-functionality.
	var callStack = [];

	// From here on, messages from the server potentially contain non-local-returns
	// and must be wrapped into the appropriate wrapper-function
	comm_home.MESSAGE_HANDLER = function(source) {
		return eval("WithNonLocalReturn(function(){" + source + "}).apply(nil);");
	};

	var DontDebugMarker = {};
	var NonLocalReturnException = function() { this.DontDebug = DontDebugMarker; };

	// A wrapper to enable several debugging-functionalities
	var WithDebugging = function(method) {
		if (st.DEBUG) {
			return function() {
				try {
					if (st.PRINT_CALLS) {
						var indent = "";
						for (var i = 0; i < callStack.length; i++) {
							indent += "  ";
						}
						if (this.__class == undefined) {
							st.console.log(indent + this._classname + "." + arguments.callee.methodName);
						} else {
							st.console.log(indent + this.__class._classname + "." + arguments.callee.methodName);
						}
					}
					var result = method.apply(this, arguments);
					return result;
				} catch (e) {
					if (e.DontDebug === DontDebugMarker) {
						throw e;
					} else if (st.DEBUG) {
						debugger;
					}
				}
			}
		} else {
			return method;
		}
	};

	// hide real method behind a wrapper method which catches exceptions
	var WithNonLocalReturn = function(method) {
		// this is a wrapper for method invocation
		return function() {
			var lastCallee = new NonLocalReturnException;
			lastCallee.currentThis = this;
			lastCallee.currentMethod = method;
			callStack.push(lastCallee);
			try {
				var ret =  method.apply(this, arguments);
				callStack.pop();
				return ret;
			}
			catch( e ) {
				callStack.pop();
				if ( e === lastCallee ) {
					return e.nonLocalReturnValue;
				} else {
					throw e;
				}
			}
		};
	};

})();
