
// Function called when a method with an unimplemented primitive declaration is called
var primitiveDeclaration = function() {
	throw("Primitive has been called!!! The method containing it is: \n\n" + 
		CALL_STACK.peek().currentThis.__class._classname + "." +
		CALL_STACK.peek().currentMethod.methodName +
		"\n(implemented in class " + CALL_STACK.peek().currentMethod.methodHome.__class._classname + ")") };

// instead of bool(true) and bool(false) (which would be the equivalent to string(""), number(2) etc.)
var _true = True._newInstance();
var _false = False._newInstance();
var nil = UndefinedObject._newInstance();

var Global = _boxObject(this);
var Document = _boxObject(document);

// Now, that nil is available, initialize all instance-variables of all classes to nil
for (aClass in SqueakyJS.ALL_CLASSES) {
	SqueakyJS.ALL_CLASSES[aClass]._initializeInstanceVariables(nil);
}

S2JConnection.doIt = function(source) {
  return eval("WithNonLocalReturn(function(){" + source + "}).apply(nil);");
}

var serverBlock = function (squeakCode) {
	// Will be evaluated directly on the server
	// evaluation is needed for the serialization of
	// Smalltalks Object>>storeString method
	return block(function(){
		var args = [ squeakCode ];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		return S2JServer.performOnServer.apply(S2JServer,args);
	});
}
