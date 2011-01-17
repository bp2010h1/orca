var SERVER = {
	
	_waitingForResponse: null,
	_result: null,
	
	performOnServer : function (classname, selector, stringArgument) {
		// Object >> perform: selector withArguments: argArray
		var command = "INVOKE: " + classname + "." + selector;		
		if (arguments.length == 3) {
		  command = command + "." + stringArgument;
		}
		
		SERVER._result = CONNECTION.send(command);
		
		return SERVER._result;
	}
	
}
