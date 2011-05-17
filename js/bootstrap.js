
// Code, that sets up some global squeak-variables, after all classes have been loaded.
// Also, initializes all instance-variables to nil, as it's available now.

// Setup depends on: classes, classes.js
// Runtime depends on: -

// Settings
// st.ILLEGAL_GLOBAL_HANDLER (function(globalName))

// API (not a real API, just values mostly used in compiled code):
// st.primitiveDeclaration (function())
// st.defineGlobals(stringArray)
// st.true
// st.false
// st.nil

(function() {

	// Set up the namespace
	var home = window.st ? window.st : (window.st = {});

	// Settings
	if (!("ILLEGAL_GLOBAL_HANDLER" in home)) home.ILLEGAL_GLOBAL_HANDLER = 
		function(handlerName) {
			throw "The global/class '" + handlerName + 
				"' has been accessed but is not defined on the client!" +
				" Add it as requiredClass.";
		};

	// Function called when a method with an unimplemented primitive declaration is called
	home.primitiveDeclaration = function() {
		var current = st.peekCallStack();
		var msg = "Primitive has been called!!! The method containing it is: \n" +
			"\n" +
			current.currentThis._theClass._classname + "." + current.currentMethod.methodName + "\n" +
			"(implemented in class " + current.currentMethod.methodHome._theClass._classname + ")\n" +
			"\n" +
			"You can either rely on the software-implementation of this primitive " +
			" and add this method to the list in OrcaSqueakAstToJsAst class >> #ignoredPrimitives\n" +
			"Or you implement the primitive in a Javascript-file in the primitives/-subfolder.\n" +
			"The file must be called <name of the home-class of the primitive>.js and is included automatically.\n" +
			"If it is not there, create it.";
		alert(msg)
		throw msg;
	};

	home.defineGlobals = function(globalNames) {
		for (index in globalNames) {
			(function() {
				// Anonymous function to preserve the index-context-variable
				var name = globalNames[index];
				if (!(name in st)) {
					st.__defineGetter__(name, function() {
						return home.ILLEGAL_GLOBAL_HANDLER(name);
					});
				}
			})();
		}
	};

	// Set up immutable globals
	home.true = st.True._newInstance();
	home.false = st.False._newInstance();
	home.nil = st.UndefinedObject._newInstance();

	//st.ProtoObject._inheritFrom(st.doesNotUnderstandClass);

	// finally inherit Metaclass from ClassDescription
	st.Metaclass._inheritFrom(st.ClassDescription);
	st.Class._inheritFrom(st.ClassDescription);

	// Now, that nil is available, initialize all instance-variables of all classes to nil
	for (aClass in st.klasses) {
		st.klasses[aClass]._initializeInstanceVariables(home.nil);
	}

})();
