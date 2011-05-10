
// Setup depends on: -
// Runtime depends on: (console.js)

// This scripts sets the foreign value st.communication.MESSAGE_HANDLER

// API:
// st.classes = array
// st.peekCallStack()
// st.supa(methodName)
// st.nonLocalReturn(returnValue)
// st.block(function)
// st.klass(classname, attributes)

// API defined on classes:
// _addInstanceMethods(methodDictionary)
// _addClassMethods(methodDictionary)
// _initializeInstanceVariables(defaultValue)
// _addInstanceVariables(aStringArray)
// _addClassInstanceVariables(aStringArray)
// _addClassVariables(aStringArray)
// _newInstance()
// _classname

// API defined on instances of classes:
// _theClass

// Settings:
// st.DEBUG (boolean)
// st.PRINT_CALLS (boolean)

(function(){

	// Set up the namespace
	var home = window.st ? window.st : (window.st = {});

	// Set up foreign namespaces
	if (!window.st) window.st = {};
	if (!st.communication) st.communication = {};

	// Settings
	if (!("DEBUG" in home)) home.DEBUG = true;
	if (!("PRINT_CALLS" in home)) home.PRINT_CALLS = false;

	// Globals
	home.classes = [];

	// 
	// API functions
	// 

	home.peekCallStack = function() {
		return callStack[callStack.length - 1];
	};

	home.supa = function(methodName) {
		return function() {
			var currentContext = home.peekCallStack();
			// Accessing .__proto__ here brings us one step higher in the class-hierarchy
			// At this point, if the super-prototype does not define the invoked method, a MessageNotUnderstood exception should be raised in Squeak-context
			var invokedMethod = currentContext.currentMethod.methodHome.__proto__[methodName];
			return invokedMethod.apply(currentContext.currentThis, arguments);
		};
	};

	home.nonLocalReturn = function(value) {
		var blockFunction = arguments.callee.caller;
		var e = blockFunction.nonLocalReturnException;
		e.nonLocalReturnValue = value;
		throw e;
	};

	home.block = function(func) {
		var b = st.BlockClosure._newInstance();
		func.nonLocalReturnException = home.peekCallStack();
		var currentThis = arguments.callee.caller.originalThis;
		if (currentThis == undefined) {
			// We are in the outer-most block of a method. The 'current this' is the top of the call-stack.
			var callStackTop = home.peekCallStack();
			currentThis = callStackTop && callStackTop.currentThis;
		}
		func.originalThis = currentThis;
		// Unboxing a real block must give the same function as when evaluating it.
		b._original = b._evaluated = function() {
			// Use the callStack to get the object, this block should be executed in.
			// box the arguments in any case, as this is code parsed from Squeak-code and relies on the auto-boxing.
			return func.apply(currentThis, st.boxIterable(arguments));
		}
		b._constructor = function() {
			// When using real blocks as constructor, don't unpack the constructor-parameters, 
			// but box them to be sure (should not be necessary).
			// Use the real 'this' instead of the currentThis from the artificial stack
			return func.apply(this, st.boxIterable(arguments));
		}
		return b;
	};

	home.createHelpers = function(newClass) {
		var createMethod = function(aPrototype, methodName, method) {
			aPrototype[methodName] = wrapFunction(method);
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
		newClass._initializeInstanceVariables = function(newInitialValue) {
			initializeVariables(this._instancePrototype.prototype, newInitialValue);
		}
		
		newClass._addInstanceMethods = function(methodTable) {
			for(methodName in methodTable) {
				if (typeof methodTable[methodName] == 'function'){
					createMethod(this._instancePrototype.prototype, methodName, methodTable[methodName]);
				}
			}
		}
		
		newClass._addClassMethods = function(methodTable) {
			for(methodName in methodTable) {
				if (typeof methodTable[methodName] == 'function'){
					createMethod(this._theClass._instancePrototype.prototype, methodName, methodTable[methodName]);
				}
			}
		}
		
		newClass._addInstanceVariables = function(variableNames, defaultValue) {
			for(idx in variableNames) {
				this._instancePrototype.prototype[variableNames[idx]] = defaultValue;
			}
		}
		
		newClass._inheritFrom = function(superClass) {
			this._instancePrototype.prototype = new superClass._instancePrototype();

			for (var i=0; i < this._instances.length; i++) {
				this._instances[i].__proto__ = this._instancePrototype.prototype;
			}
		}
	};
	
	// This function creates a class with a given name and attributes.
	home.klass = function(classname, attrs) {
		var createMetaclassAndInstantiate = function() {
			var newClass;
			var metaClass;
			
			if(classname.endsWith(' class')) {
				// in case the class is a metaclass, it is
				// an instance of MetaClass
				metaClass = st['Metaclass'];
			}
			else {
				var metaSuperClass;
				
				if ('superclass' in attrs) {
					if(attrs.superclass._classname.endsWith(' class'))
						metaSuperClass = attrs.superclass;
					else
						metaSuperClass = st[attrs.superclass._classname + ' class'];
				}
				else {
					// if there is no superclass, the metaSuperClass is Class
					// this is important for ProtoObject class superclass
					metaSuperClass = st['Class'];
				}
			
				// metaclasses are actually anonymous but when getting accessed
				// the naming convention for class "X" is "X class"
				metaClass = st.klass(classname + ' class', {
						superclass: metaSuperClass,
						instanceVariables: attrs.classVariables,
						instanceMethods: attrs.classMethods
				});				
			}

			newClass = metaClass._newInstance();
						
			home.createHelpers(newClass);
			
			newClass._instances = new Array();
			newClass._instancePrototype = st.isChrome() 
								? (st.localEval("(function " + 
										(classname.endsWith(' class') 
											? "class_" + classname.replace(/ class/g, "")
											: "instance_of_" + classname
										) + "() { })")) 
								: (function () { }); 
			
			if('superclass' in attrs) {
				newClass._inheritFrom(attrs.superclass);
			}
			
			newClass._newInstance = function() {
			  	var instance = new newClass._instancePrototype();
	          	instanceCount++; 
				instance._instanceNumber = instanceCount;
				newClass._instances.push(instance);
				return instance;
			};

			newClass._addInstanceVariables(['_theClass'], newClass);
			newClass._classname = classname;
			
			return newClass;
		};
		
		var addVariables = function(newClass) {
			if('instanceVariables' in attrs) {
				newClass._addInstanceVariables(attrs.instanceVariables, null);
			}
		};
		
		var addMethods = function(newClass) {
			if('instanceMethods' in attrs) {
				newClass._addInstanceMethods(attrs.instanceMethods);
			}
		};
		
		if((classname in this) == false) {
			// create a new class if it does not yet exist
			var newClass = createMetaclassAndInstantiate();

			addVariables(newClass);
			addMethods(newClass);

			this[classname] = newClass;
			home.classes.push(newClass);

			return newClass;	
		}
		else {
			// the class does already exist
			// we will use the given parameters to extend the class
			var theClass = this[classname];
			
			if('superclass' in attrs) {
				theClass._inheritFrom(attrs['superclass']);
			}

			addVariables(theClass);
			addMethods(theClass);
			
			return theClass;
		}		
	};

	// 
	// Private functions
	// 

	var wrapFunction = function(aFunc) {
		return WithDebugging(WithNonLocalReturn(aFunc));
	}
	// This is not part of the API, but must be exposed to access it in the eval()-call below
	st.wrapFunction = wrapFunction;

	// Each time an object (excluding classes) is created, this is incremented
	var instanceCount = 0;

	// Each element has the slot 'currentThis' set, that represents the object, the execution is currently in
	// The element itself is a unique instance, that is used to enable the non-local-return-functionality.
	var callStack = [];

	// From here on, messages from the server potentially contain non-local-returns
	// and must be wrapped into the appropriate wrapper-function
	var originalMessageHandler = st.communication.MESSAGE_HANDLER;
	st.communication.MESSAGE_HANDLER = function(source) {
		return originalMessageHandler(
			"st.wrapFunction(function() {" + 
			source + "}).apply(st.nil);" );
	};

	var DontDebugMarker = {};
	var NonLocalReturnException = function(currentThis, method) { 
		this.DontDebug = DontDebugMarker;
		this.currentThis = currentThis;
		this.currentMethod = method;
	};

	// A wrapper to enable several debugging-functionalities
	var WithDebugging = function(method) {
		if (home.DEBUG) {
			return function() {
				try {
					if (home.PRINT_CALLS) {
						var indent = "";
						for (var i = 0; i < callStack.length; i++) {
							indent += "  ";
						}
						if (window.st && st.console) {
							if (this._theClass == undefined) {
								st.console.log(indent + this._classname + "." + arguments.callee.methodName);
							} else {
								st.console.log(indent + this._theClass._classname + "." + arguments.callee.methodName);
							}
						}
					}
					var result = method.apply(this, arguments);
					return result;
				} catch (e) {
					if (e.DontDebug === DontDebugMarker) {
						throw e;
					} else if (home.DEBUG) {
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
			var lastCallee = new NonLocalReturnException(this, method);
			callStack.push(lastCallee);
			try {
				var ret =  method.apply(this, arguments);
				callStack.pop();
				return ret;
			}
			catch( e ) {
				callStack.pop();
				e.method = method;
				if ( e === lastCallee ) {
					return e.nonLocalReturnValue;
				} else {
					throw e;
				}
			}
		};
	};
	
	/*********** <PRELOAD> ********************/

	var classStub = function(classname) { 
		home[classname] = {
			_classname: classname,
			_instancePrototype: function() { },
			_instances: new Array(),
			_newInstance: function() {
				var instance = new this._instancePrototype();
				this._instances.push(instance);
				return instance;
			},
			_inheritFrom: function(superClass) {
				this._instancePrototype.prototype = new superClass._instancePrototype();
				
				for (var i=0; i < this._instances.length; i++) {
					this._instances[i].__proto__ = this._instancePrototype.prototype;
				}
			}
		}

		home[classname]._instancePrototype.prototype._theClass = home[classname];

		return home[classname];
	}


	classStub('Metaclass');
	classStub('Class');

	home["Metaclass class"] = home.Metaclass._newInstance();
	home["Metaclass class"]._instancePrototype = function() {};
	home["Metaclass class"]._instancePrototype.prototype._theClass = home["Metaclass class"];
	home["Metaclass class"]._classname = 'Metaclass class';

	// Metaclass is also instance from Metaclass class
	home.Metaclass.__proto__ = home["Metaclass class"]._instancePrototype.prototype;

	/*********** </PRELOAD> *******************/

})();
