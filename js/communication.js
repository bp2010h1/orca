
// Setup depends on: -
// Runtime depends on: console.js, helpers.js, server.js

// API:
// st.communication.connect()
// st.communication.send(data)
// st.communication.sendAndWait(data)
// st.communication.handleMessage(content, status)
// st.communication.evalScript(path)
// st.communication.addScriptTags(arrayOfStrings)

// (st.setup_session_id(int) can be called only once)

// Settings:
// st.communication.XHR_PATH (string)
// st.communication.MESSAGE_HANDLER (function(string))

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// 
	// Settings
	// 

	if (!("XHR_PATH" in home)) home.XHR_PATH = "xhr";
	if (!("MESSAGE_HANDLER" in home)) home.MESSAGE_HANDLER = function(message) {
		st.console.log("Received message: " + message);
		return eval(message); };

	// 
	// Local variables
	// 

	var session_id = -1;
	var request = null;

	// 
	// API functions
	// 

	home.connect = function() {
		if (!isOpen()) {
			var optionalArgument = '';
			if (arguments[0] !== undefined) {
				optionalArgument = "&answer=" + st.escapeAll(arguments[0]);
			}
			request = createRequest();
			request.open("GET", fullURL(home.XHR_PATH) + optionalArgument , true);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						var answer = home.handleMessage(request.responseText);
						self.open(answer);
					} else {
						st.console.statusInfo("Disconnected Comet: " + request.responseText, request.status);
					}
				}
			};
			request.send(null);
		}
	};

	home.send = function(data) {
		if (isOpen())
			return home.sendAndWait(data, home.XHR_PATH);
	};

	home.sendAndWait = function(data, urlPath) {
		if (isOpen())
			return sendAndWait(data, urlPath);
	};

	// Use the configured message-handler to evaluate and log the content
	home.handleMessage = function(content) {
		var result;
		try {
			result = home.MESSAGE_HANDLER(content);
		} catch (e) {
			st.console.log("Error handling the content of a server-message: " + e + ".\r\n" +
			"Message was: " + content);
		}
		return result;
	};

	// Load the resource and evaluate it in global context. Return the evaluated result.
	home.evalScript = function(path) {
		var script = null;
		var req = createRequest();
		req.open("GET", fullURLWithoutId(path), false);
		req.send(null);
		if (req.status == 200) {
			script = req.responseText;
		} else {
			throw "Could not load file: " + path;
		}
		// The scripts need global context
		return (function() { return window.eval(script); })();
	};

	home.addScriptTags = function(scriptNames) {
		var i = 0;
		var callback = function() {
			if (i < scriptNames.length) {
				addScriptTag(scriptNames[i], callback);
				i++;
			}
		};
		callback();
	};

	home.setup_session_id = function(id) {
		// Allow calling this function only once - delete after usage
		st.console.log("This session-id is " + id);
		session_id = id;
		delete home.setup_session_id;
	};

	// 
	// Private functions
	// 

	var isOpen = function() {
		return request ? true : false;
	};

	var addScriptTag = function(url, callback) {
		var script = document.createElement('script');
		var url = fullURLWithoutId(url);
		script.type = 'text/javascript';
		script.language = "javascript";
		script.onreadystatechange = callback;
		script.onload = callback;
		script.src = url;
		document.getElementsByTagName('HEAD')[0].appendChild(script);
	};

	var sendAndWait = function(data, url) {
		if (data){
			var synchronousRequest = createRequest();
			synchronousRequest.open("POST", fullURL(url), false);
			synchronousRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			synchronousRequest.send(data);
			var result = synchronousRequest.responseText;
			return result;
		}
	}

	var createRequest = function() {
		return new XMLHttpRequest();
	};

	var fullURL = function(urlPath) {
		if (session_id == -1) {
			throw "Session-ID has not been set up yet!";
		}
		if (isExternal(urlPath)) {
			return urlPath;
		}
		return fullURLWithoutId(urlPath) + "?id=" + session_id;
	};

	// Skip adding the session-id when loading static files.
	// This way, the browser identifies the files as same files and keeps breakpoints
	var fullURLWithoutId = function(urlPath) {
		if (isExternal(urlPath)) {
			return urlPath;
		}
		var baseUrl = document.location.href;
		if (!(/\/$/.test(baseUrl))){
			baseUrl = baseUrl + "/";
		}
		return baseUrl + urlPath;
	}

	var isExternal = function(urlPath) {
		return (/^http(s)?:\/\//.test(urlPath));
	}

})();
