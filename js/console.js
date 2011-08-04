
// Setup depends on: -
// Runtime depends on: -

// API:
// st.console.log(text)
// st.console.statusInfo(content, httpStatus)
// st.console.print(object)

// Settings:
// st.console.USE_FIREBUG (boolean)

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.console ? st.console : (st.console = {});

	// 
	// Settings
	// 

	if (!("USE_FIREBUG" in home)) home.USE_FIREBUG = true;

	// 
	// API functions
	// 

	home.log = function(text) {
		if (home.USE_FIREBUG) {
			console.log(text);
		}
	};

	home.statusInfo = function(text, httpStatus) {
		home.log(httpStatus + ": " + text);
	};

	home.print = function(obj) {
		for (index in obj) {
			home.log(index + " = " + obj[index]);
		}
	};

})();
