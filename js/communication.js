
// Setup depends on: -
// Runtime depends on: console.js, helpers.js, server.js

// API:
// st.communication.setup()
// st.communication.connect()
// st.communication.send(data)
// st.communication.sendSynchronously(data)
// st.communication.disconnect()
// st.communication.handleMessage(content, status)
// st.GET(path)
// st.loadScript(path)

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

	if (!home.PREFER_WS) home.PREFER_WS = true;
	if (!home.WEBSOCKET_PATH) home.WEBSOCKET_PATH = "ws";
	if (!home.XHR_PATH) home.XHR_PATH = "xhr";
	if (!home.MESSAGE_HANDLER) home.MESSAGE_HANDLER = function(message) {
		st.console.log("Received message: " + message);
		eval(message); };

	// 
	// Local variables
	// 

	var connectionHandler;
	var synchronousRequest;
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

	home.sendSynchronously = function(data, urlPath) {
		if (connectionHandler.isOpen())
			return connectionHandler.sendSynchronously(data, urlPath);
	};

	home.disconnect = function() {
		if (synchronousRequest)
			closeRequest(synchronousRequest);
		if (connectionHandler.isOpen())
			connectionHandler.close();
	};

	// Use the configured message-handler to evaluate and log the content
	home.handleMessage = function(content, status) {
		var result;
		try {
			result = home.MESSAGE_HANDLER(content);
		} catch (e) {
			st.console.log("Error handling the content of a server-message: " + e + ".\r\n" +
			"Message was: " + content);
		}
		return result;
	};

	home.GET = function(path) {
		var req = createXmlRequest();
		req.open("GET", fullURL(path), false);
		req.send(null);
		if (req.status == 200) {
			return req.responseText;
		} else {
			throw "Could not load file: " + path;
		}
	};

	// Load the resource and evaluate it in global context. Return the evaluated result.
	home.loadScript = function(path) {
		var script = home.GET(path);
		// The scripts need global context
		return (function() { return window.eval(script); })();
	}

	home.setup_session_id = function(id) {
		// Allow calling this function only once - delete after usage
		session_id = id;
		delete home.setup_session_id;
	};

	// 
	// Private functions
	// 

	var sendSynchronouslyImpl = function(data, url) {
		if (data) {
			synchronousRequest = createXmlRequest();
			synchronousRequest.open("POST", fullURL(url), false);
			synchronousRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			synchronousRequest.send(data);
			var result = synchronousRequest.responseText;
			synchronousRequest = null;
			return result;
		}
	}

	var useWs = function() {
		return home.PREFER_WS && ("WebSocket" in window);
	};

	var createXmlRequest = function() {
		return new XMLHttpRequest();
	};

	var closeRequest = function(request) {
		// TODO this is not pretty: this abort()-call always results in 
		// a "Failed to load resource" in the browser...
		request.abort();
	};

	var fullURL = function(urlPath) {
		var baseUrl = document.location.href;
		if (!(/\/$/.test(baseUrl))){
			baseUrl = baseUrl + "/";
		}
		return baseUrl + urlPath + "?id=" + session_id;
	};

	var createCometHandler = function() {
		var request = null;
		var self = {
			open: function() {
				var optionalArgument = '';
				if (arguments[0] !== undefined) {
					optionalArgument = "&answer=" + home.realEscape(arguments[0]);
				}
				request = createXmlRequest();
				request.open("GET", fullURL(home.XHR_PATH) + optionalArgument , true);
				request.onreadystatechange = function() {
					if (request.readyState == 4) {
						if (request.status == 200) {
							var answer = home.handleMessage(request.responseText, request.status);
							self.open(answer);
						} else {
							st.console.statusInfo("Disconnected Comet: " + request.responseText, request.status);
						}
					}
				};
				request.send(null);
			},
			send: function(data) {
				return this.sendSynchronously(data, home.XHR_PATH);
			},
			sendSynchronously: function(data, url) {
				// It might be, that comet needs to close it's open connection before opening a new one
				// this.close();
				var result = sendSynchronouslyImpl(data, url);
				// this.open();
				return result;
			},
			close: function() {
				closeRequest(request);
				request = null;
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
					var answer = home.handleMessage(event.data, 200);
					if (answer !== undefined){
						webSocket.send(answer);
					}
				};
				webSocket.onclose = function() {
					st.console.log("WebSocket received close event.");
				};
			},
			send: function(data) {
				webSocket.send(data);
			},
			sendSynchronously: sendSynchronouslyImpl,
			close: function() {
				webSocket.close();
				webSocket = null;
				st.console.log("WebSocket closed by client.");
			},
			isOpen: function() {
				return webSocket ? true : false;
			}
		};
	};

	// Once setup the default connectionHandler-object
	home.setup();

})();
