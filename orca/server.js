
// API:
// st.communication.performOnServer(squeakCode)
// st.communication.serverBlock(squeakCodeEvaluatingToABlock)

(function() {

	// Set up the namespace
	var comm_home = st.communication | (st.communication = {});

	// 
	// API functions
	// 

	comm_home.performOnServer: function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
			// to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + realEscape(arguments[i]);
		}
		var result = comm_home.sendSynchronously("code=" + realEscape(squeakCode) + args);
		return comm_home.handleMessage(result);
	};

	comm_home.serverBlock = function (squeakCode) {
		// Returns block, that will be evaluated directly on the server, when evaluated
		return block(function(){
			var args = [ squeakCode ];
			for (var i = 0; i < arguments.length; i++) {
				args.push(boxObject(arguments[i]));
			}
			return comm_home.performOnServer.apply(comm_home, args);
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
