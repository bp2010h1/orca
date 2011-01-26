var S2JServer = {
	
	_waitingForResponse: null,
	
	performOnServer: function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
		  // to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + escape(arguments[i]);
		}
		var result = S2JConnection.send("code=" + escape(squeakCode) + args);
		try {
			result = eval(result);
		} catch (e) {
			debugger;
		}
		return result;
	}
	
}
