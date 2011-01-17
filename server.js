var SERVER = {
	
	_waitingForResponse: null,
	_result: null,
	
	performOnServer : function (classname, selector, stringArgument) {
		// Object >> perform: selector withArguments: argArray
		CONNECTION.send("INVOKE: " + classname + "." + selector + "." + stringArgument);
		SERVER._waitingForResponse = true;
		while(SERVER._waitingForResponse) {
			// busy wait
		}
		return SERVER._result;
	},
	
	callback : function(result) {
		// response handled through comet or sockets will
		// contain as result a function call like "callback(result)"
		SERVER._result = result;
		SERVER._waitingForResponse = false;
	}
	
}
