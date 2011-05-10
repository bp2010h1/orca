
// Setup depends on: -
// Runtime depends on: console.js, helpers.js, server.js

// API:
// st.communication.setup()
// st.communication.connect()
// st.communication.send(data)
// st.communication.sendAndWait(data)
// st.communication.handleMessage(content, status)
// st.communication.evalScript(path)
// st.communication.addScriptTags(arrayOfStrings)

// (st.setup_session_id(int) can be called only once)

// Settings:
// st.communication.PREFER_WS (boolean)
// st.communication.WEBSOCKET_PATH (string)
// st.communication.XHR_PATH (string)
// st.communication.MESSAGE_HANDLER (function(string))

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// 
	// Settings
	// 

	if (!("PREFER_WS" in home)) home.PREFER_WS = true;
	if (!("WEBSOCKET_PATH" in home)) home.WEBSOCKET_PATH = "ws";
	if (!("XHR_PATH" in home)) home.XHR_PATH = "xhr";
	if (!("MESSAGE_HANDLER" in home)) home.MESSAGE_HANDLER = function(message) {
		st.console.log("Received message: " + message);
		return eval(message); };

	// 
	// Local variables
	// 

	var connectionHandler;
	var session_id = -1;

	// 
	// API functions
	// 

	// re-read the PREFER_WS-flag
	home.setup = function() {
		connectionHandler = useWs() ? createWsHandler() : createCometHandler();
	};

	home.connect = function() {
		if (!connectionHandler.isOpen())
			connectionHandler.open();
	};

	home.send = function(data) {
		if (connectionHandler.isOpen())
			return connectionHandler.send(data);
	};

	home.sendAndWait = function(data, urlPath) {
		if (connectionHandler.isOpen())
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

	var useWs = function() {
		return home.PREFER_WS && ("WebSocket" in window);
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

	var createCometHandler = function() {
		var request = null;
		var self = {
			open: function() {
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
			},
			send: function(data) {
				return this.sendAndWait(data, home.XHR_PATH);
			},
			isOpen: function() {
				return request ? true : false;
			}
		};
		return self;
	};

	var createWsHandler = function() {
		var webSocket = null;

		return {
			open: function() {
				webSocket = new WebSocket("ws://" + fullURL(home.WEBSOCKET_PATH).split("//")[1]);
				webSocket.onopen = function(event) {
					this.send(""); // Tell the server, that the connection is up
					st.console.log("Successfully opened WebSocket: " + event);
				};
				webSocket.onerror = function(event) {
					st.console.log("WebSocket failed: " + event);
				};
				webSocket.onmessage = function(event) {
					var answer = home.handleMessage(event.data);
					// TODO should not answer always! Server receives unnecessary requests!
					webSocket.send(answer == undefined ? "" : answer);
				};
				webSocket.onclose = function() {
					st.console.log("WebSocket received close event.");
				};
			},
			send: function(data) {
				webSocket.send(data);
			},
			isOpen: function() {
				return webSocket ? true : false;
			}
		};
	};

	// Once setup the default connectionHandler-object
	home.setup();

})();
