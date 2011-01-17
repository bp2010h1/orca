var SERVER = {
	
	_waitingForResponse: null,
	_result: null,
	
	performOnServer : function (classname, method, stringArgument) {
		// Object >> perform: selector withArguments: argArray
		var command = "class=" 	+ classname + "&" +
					  "method=" + method;		
		if (arguments.length == 3) {
		  command = command + "&" + 
		  			"argument=" + stringArgument;
		}
		
		SERVER._result = CONNECTION.send(command);
		
		return SERVER._result;
	}
	
}
