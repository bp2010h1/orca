
// Code, that sets up some global squeak-variables, after all classes have been loaded.
// Also, initializes all instance-variables to nil, as it's available now.

// Setup depends on: classes, classes.js
// Runtime depends on: -

// API (not a real API, just values mostly used in compiled code):
// st.primitiveDeclaration (function())
// st.true
// st.false
// st.nil

(function() {

	// Set up the namespace
	var home = window.st ? window.st : (window.st = {});

	// Function called when a method with an unimplemented primitive declaration is called
	home.primitiveDeclaration = function() {
		var current = st.peekCallStack();
		throw("Primitive has been called!!! The method containing it is: \n\n" + 
			current.currentThis._theClass._classname + "." +
			current.currentMethod.methodName + "\n(implemented in class " + 
			current.currentMethod.methodHome._theClass._classname + ")");
	};

	// Set up immutable globals
	home.true = st.True._newInstance();
	home.false = st.False._newInstance();
	home.nil = st.UndefinedObject._newInstance();

	// Now, that nil is available, initialize all instance-variables of all classes to nil
	for (aClass in st.classes) {
		st.classes[aClass]._initializeInstanceVariables(home.nil);
	}

	// TODO if we're sure everything is fixed, remove these warnings.
	var deprecatedError = function(methodName) {
		var msg = "We have an obsolete " + methodname + "()-call! Fix it.";
		alert(msg);
		throw msg;
	};
	st.Object._addInstanceMethods({
		jsEval: function() {
			deprecatedError("jsEval (which is EVIL!!)");
		},
		js: function() {
			deprecatedError("js");
		},
		js_: function() {
			deprecatedError("js:");
		},
		slot_be_: function() {
			deprecatedError("slot:be:");
		},
		slot_: function() {
			deprecatedError("slot:");
		},
		slot_apply_: function() {
			deprecatedError("slot:apply:");
		}
	});

})();
