var Server = {
	
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
		
		Server._result = Connection.send(command);
		
		return Server._result;
	}
	
}
