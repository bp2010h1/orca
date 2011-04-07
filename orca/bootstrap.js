
// Code, that sets up some global squeak-variables, after all classes have been loaded.
// Also, initializes all instance-variables to nil, as it's available now.

(function() {

	// Set up the namespace
	if (!st) st = {};

	// Function called when a method with an unimplemented primitive declaration is called
	st.primitiveDeclaration = function() {
		var current = st.peekCallStack();
		throw("Primitive has been called!!! The method containing it is: \n\n" + 
			current.currentThis.__class._classname + "." +
			current.currentMethod.methodName + "\n(implemented in class " + 
			current.currentMethod.methodHome.__class._classname + ")");
	};

	// instead of bool(true) and bool(false) (which would be the equivalent to string(""), number(2) etc.)
	st.true = True._newInstance();
	st.false = False._newInstance();
	st.nil = UndefinedObject._newInstance();

	// Now, that nil is available, initialize all instance-variables of all classes to nil
	for (aClass in st.classes) {
		st.classes[aClass]._initializeInstanceVariables(nil);
	}

})();
