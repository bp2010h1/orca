var S2JServer = {
	
	_waitingForResponse: null,
	
	realEscape: function(string) {
		// * @ - _ + . / are not escaped
		var result = escape(string);
		result = result.replace(/(\*)/g, "%2A");
		result = result.replace(/(\@)/g, "%40");
		result = result.replace(/(\-)/g, "%2D");
		result = result.replace(/(\_)/g, "%5F");
		result = result.replace(/(\+)/g, "%2B");
		result = result.replace(/(\.)/g, "%2E");
		result = result.replace(/(\/)/g, "%2F");
		return result;
	},
	
	performOnServer: function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
		  // to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + this.realEscape(arguments[i]);
		}
		var result = S2JConnection.sendSynchronously("code=" + this.realEscape(squeakCode) + args);
		
		return eval(result);
	}
	
}
