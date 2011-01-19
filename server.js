var S2JServer = {
	
	_waitingForResponse: null,
	
	performOnServer: function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
			args += "&arg" + (i - 1) + "=" + arguments[i];
		}
		var result = S2JConnection.send("code=" + squeakCode + args);
		result = doIt(result);
		return result;
	}
	
}
