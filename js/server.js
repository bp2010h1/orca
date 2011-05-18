
// Setup depends on: -
// Runtime depends on: communication.js, classes.js, helpers.js

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
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
			// to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + st.escapeAll(arguments[i]);
		}
		var data = "code=" + st.escapeAll(squeakCode) + args;
		var result = st.communication.send(data, "serverBlock");
		return st.communication.getMessageHandler("code")(result);
	};

	home.serverBlock = function (squeakCode) {
		// Returns block, that will be evaluated directly on the server, when evaluated
		return st.block(function() {
			var args = [ squeakCode ].concat(st.unboxIterable(arguments));
			return home.performOnServer.apply(home, args);
		});
	};

})();
