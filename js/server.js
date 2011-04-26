
// Setup depends on: -
// Runtime depends on: communication.js, classes.js, helpers.js

// API:
// st.communication.performOnServer(squeakCode)
// st.communication.serverBlock(squeakCodeEvaluatingToABlock)

// Settings:
// st.CODE_EXECUTION_URL (String)

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// Settings
	if (!("CODE_EXECUTION_URL" in home)) home.CODE_EXECUTION_URL = "mi";

	// 
	// API functions
	// 

	home.performOnServer = function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
			// to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + st.escapeAll(arguments[i]);
		}
		var data = "code=" + st.escapeAll(squeakCode) + args;
		var result = st.communication.sendAndWait(data, home.CODE_EXECUTION_URL);
		return st.communication.handleMessage(result);
	};

	home.serverBlock = function (squeakCode) {
		// Returns block, that will be evaluated directly on the server, when evaluated
		return st.block(function() {
			var args = [ squeakCode ].concat(st.unboxIterable(arguments));
			return home.performOnServer.apply(home, args);
		});
	};

})();
