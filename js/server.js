
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
		var args = [];
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i].storeString ? arguments[i].storeString() : arguments[i]);
		}
		var data = {
			code: squeakCode,
			args: st.unboxIterable(args)
			};
		data = JSON.stringify(data);
		var result = st.communication.send(data, "serverBlock");
		return st.globalEval("(function() {" + result + "})()");
	};

	home.serverBlock = function (squeakCode) {
		// Returns block, that will be evaluated directly on the server, when evaluated
		return st.block(function() {
			var args = [ squeakCode ].concat(st.toArray(arguments));
			return home.performOnServer.apply(home, args);
		});
	};

})();
