var SERVER = {
	
	var _waitingForResponse;
	var _result;
	
	var performOnServer = function(classname, selector, args) {
		// Object >> perform: selector withArguments: argArray
		CONNECTION.send(classname + "." + selector + "." + args);
		_waitingForResponse = true;
		while(_waitingForResponse) {
			// busy wait
		}
		return _result;
	}
	
	var callback = function(result) {
		_result = result;
		_waitingForResponse = false;
	}
	
}