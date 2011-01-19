var S2JServer = {
	
	_waitingForResponse: null,
	_result: null,
	
	performOnServer : function (classname, method, arg1, arg2, arg3) {
		// Object >> perform: selector withArguments: argArray
		var command = "class=" 	+ classname + "&" +
					  "method=" + method;		
		if (arg1 != undefined) {
		  command = command + "&arg1=" + arg1;
		}
		if (arg2 != undefined) {
		  command = command + "&arg2=" + arg2;
		}
		if (arg3 != undefined) {
		  command = command + "&arg3=" + arg3;
		}
		S2JServer._result = S2JConnection.send(command);
		
		// evaluation is needed for the serialization of
		// Smalltalks Object>>storeString method
		return eval(S2JServer._result);
	}
	
}
