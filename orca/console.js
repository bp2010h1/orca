
// API:
// st.console.debug(text)
// st.console.info(text)
// st.console.error(text)
// st.console.statusInfo(content, httpStatus)
// st.console.print(object)

// Settings:
// st.console.USE_FIREBUG (boolean)

(function() {

	// Set up the namespace
	var console_home = st.console | (st.console = {});

	// 
	// Settings
	// 

	console_home.USE_FIREBUG = true;

	// 
	// API functions
	// 

	console_home.log = function(text) {
		if (console_home.USE_FIREBUG) {
			console.log(text);
		}
	};

	console_home.statusInfo = function(text, httpStatus) {
		if ((httpStatus == 200) || (httpStatus == 201)) {
			logHTTP(text, httpStatus, "OK");
		}
		else if (httpStatus == 204) {
			logHTTP(text, httpStatus, "No content");
		}
		else {
			logHTTP(text, httpStatus, "Client aborted");
		} 
	};

	console_home.print = function(obj) {
		for (index in obj) {
			console_home.log(index + " = " + obj[index]);
		}
	};

	var logHTTP = function(text, httpStatus, statusText) {
		console_home.log("HTTP -" + statusText + "(" + httpStatus + "). Content: " + text);
	}

})();
