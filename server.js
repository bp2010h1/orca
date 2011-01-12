var SERVER = {
	
	_waitingForResponse: null;
	_result: null;
	
	performOnServer: function(classname, selector, args) {
		// Object >> perform: selector withArguments: argArray
		CONNECTION.send(classname + "." + selector + "." + args);
		_waitingForResponse = true;
		while(_waitingForResponse) {
			// busy wait
		}
		return _result;
	}
	
	callback: function(result) {
		// response handled through comet or sockets will
		// contain as result a function call like "callback(result)"
		_result = result;
		_waitingForResponse = false;
	}
	
}
