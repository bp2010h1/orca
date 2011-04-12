
// Setup depends on: -
// Runtime depends on: communication.js, classes.js

// API:
// st.communication.performOnServer(squeakCode)
// st.communication.serverBlock(squeakCodeEvaluatingToABlock)

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// 
	// API functions
	// 

	home.performOnServer = function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
			// to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + realEscape(arguments[i]);
		}
		var result = st.communication.sendSynchronously("code=" + realEscape(squeakCode) + args);
		return st.communication.handleMessage(result);
	};

	home.serverBlock = function (squeakCode) {
		// Returns block, that will be evaluated directly on the server, when evaluated
		return st.block(function() {
			// debugger;
			var args = [ squeakCode ].concat(st.unboxIterable(arguments));
			return home.performOnServer.apply(home, args);
		});
	};

	// 
	// Private functions
	// 

	var realEscape = function(string) {
		// * @ - _ + . / are not escaped by this default js-function
		var result = escape(string);
		result = result.replace(/(\*)/g, "%2A");
		result = result.replace(/(\@)/g, "%40");
		result = result.replace(/(\-)/g, "%2D");
		result = result.replace(/(\_)/g, "%5F");
		result = result.replace(/(\+)/g, "%2B");
		result = result.replace(/(\.)/g, "%2E");
		result = result.replace(/(\/)/g, "%2F");
		return result;
	};

})();
