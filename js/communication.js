
// Setup depends on: -
// Runtime depends on: console.js, helpers.js, server.js

// API:
// st.communication.send(data)
// st.communication.sendForked(data)

// st.communication.handleMessage(content, status)
// st.communication.evalScript(path)
// st.communication.addScriptTags(arrayOfStrings)

// (st.setup_session_id(int) can be called only once)

// Settings:
// st.communication.STRING_PATH (string)
// st.communication.MESSAGE_HANDLER (function(string))

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// 
	// Settings
	// 

	if (!("STRING_PATH" in home)) home.STRING_PATH = "xhr";
	if (!("MESSAGE_HANDLER" in home)) home.MESSAGE_HANDLER = function(message) {
		st.console.log("Received message: " + message);
		return eval(message); };

	// 
	// Local variables
	// 

	var session_id = -1;

	// 
	// API functions
	// 

	home.send = function(data) {
		var result = doSend(data, true, "blocked");
		// TODO call answerTo: handler
		// return ...
	};

	home.sendForked = function(data) {
		doSend(data, false, "forked", true);
		return null;
	};

	home.setup_session_id = function(id) {
		// Allow calling this function only once - delete after usage
		delete home.setup_session_id;
		st.console.log("This session-id is " + id);
		session_id = id;
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

	// 
	// Private functions
	// 

	// Increased with every send and decreased with every received "answer"
	var pendingSends = 0;

	var doSend = function(data, isSynchronous, status, ignoreResponse) {
		var request = createRequest();
		var content = "status=" + st.escapeAll(status);
		content += "message=" + st.escapeAll(data);
		if (!ignoreResponse && !isSynchronous)
			request.onreadystatechange = function() { answerToMessage(request); };
		request.open("POST", fullURL(home.STRING_PATH), isSynchronous);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		pendingSends++;
		request.send(content);
		if (!ignoreResponse && isSynchronous)
			return answerToMessage(request);
		return request.responseText;
	}

	var answerToMessage = function(request) {
		if (request.readyState == 4) {
			if (request.status == 200) {
				var response = /status=([^&]+)&message=([^&]+)/.test(request.responseText);
				if (status && status.length >= 2) {
					var status = response[0];
					var message = response[1];
					if (status == "answer") {
						pendingSends--;
						if (pendingSends < 0) {
							pendingSends = 0;
							st.console.log("Illegal state: Received more answers than sends!");
						}
						return message;
					} else if (status == "blocked") {
						var result = handleMessage(message);
						return doSend(result, false, "answer");
					} else if (status == "forked") {
						if (pendingSends >= 1) {
							handleMessage(message); // Ignore result
							return doSend("", true, "answer");
						} else {
							var result = doSend("", false , "answer");
							handleMessage(message); // Ignore result
							return result;
						}
					}
				}
				st.console.log("Illegal message received from the server: " + request.responseText);
			} else {
				st.console.statusInfo("Channel disconnected: " + request.responseText, request.status);
			}
		}
	}

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
