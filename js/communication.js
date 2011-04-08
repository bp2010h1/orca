
// API:
// st.communication.setup()
// st.communication.connect()
// st.communication.send(data)
// st.communication.sendSynchronously(data)
// st.communication.disconnect()
// st.communication.handleMessage(content, status)

// Settings:
// st.communication.PREFER_WS (boolean)
// st.communication.METHOD_INVOCATION_PATH (string)
// st.communication.WEBSOCKET_PATH (string)
// st.communication.XHR_PATH (string)
// st.communication.MESSAGE_HANDLER (function(string))

(function() {

	// Set up the namespace
	var comm_home = st.communication | (st.communication = {});

	// 
	// Settings
	// 

	comm_home.PREFER_WS = true;
	comm_home.METHOD_INVOCATION_PATH = "/mi";
	comm_home.WEBSOCKET_PATH = "/ws";
	comm_home.XHR_PATH = "/xhr";
	comm_home.MESSAGE_HANDLER = function(message) { st.console.log("Received message: " + message) };

	// 
	// Local variables
	// 

	var connectionHandler;
	var synchronousRequest;

	// 
	// API functions
	// 

	// re-read the PREFER_WS-flag
	comm_home.setup = function() {
		connectionHandler = useWs() ? createWsHandler() : createCometHandler();
	};

	comm_home.connect = function() {
		if (!connectionHandler.isOpen())
			connectionHandler.open();
	};

	comm_home.send = function(data) {
		if (connectionHandler.isOpen())
			return connectionHandler.send(data);
	};

	comm_home.sendSynchronously = function(data) {
		if (connectionHandler.isOpen())
			return connectionHandler.sendSynchronously(data);
	};

	comm_home.disconnect = function() {
		if (synchronousRequest)
			closeRequest(synchronousRequest);
		if (connectionHandler.isOpen())
			connectionHandler.close();
	};

	// Use the configured message-handler to evaluate and log the content
	comm_home.handleMessage = function(content, status) {
		var result;
		try {
			result = comm_home.MESSAGE_HANDLER(content);
		} catch (e) {
			st.console.log("Error handling the content of a server-message: " + e + 
			"\rMessage was: " + content);
		}
		st.console.statusInfo(content, status);
		return result;
	};

	// 
	// Private functions
	// 

	var sendSynchronouslyImpl = function(data) {
		if (data) {
			synchronousRequest = createXmlRequest();
			synchronousRequest.open("POST", document.location.href + comm_home.METHOD_INVOCATION_PATH, false);
			synchronousRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			synchronousRequest.send(data);
			var result = synchronousRequest.responseText;
			synchronousRequest = null;
			return result;
		}
	}

	var useWs = function() {
		return comm_home.PREFER_WS && ("WebSocket" in window);
	};

	var createXmlRequest = function() {
		return new XMLHttpRequest();
	};

	var closeRequest = function(request) {
		// TODO this is not pretty: this abort()-call always results in 
		// a "Failed to load resource" in the browser...
		request.abort();
	}

	var createCometHandler = function() {
		var identifier = null;

		var cometUrl = function() {
			return document.location.href + comm_home.XHR_PATH + (identifier ? ("?id=" + identifier) : "");
		};

		var poll = function() {
			request = createXmlRequest();
			request.open("GET", cometUrl(), true);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						comm_home.handleMessage(request.responseText, request.status);
						poll();
					}
					else if (request.status == 202) {
						identifier = request.responseText;
						st.console.log("This client registered with id " + identifier);
						poll();
					}
					else st.console.statusInfo("Disconnected Comet: " + request.responseText, request.status);
				}
			}
			request.send(null);
		};

		return {
			open: function() {
				poll();
			},
			send: function(data) {
				return this.sendSynchronously(data);
			},
			sendSynchronously: function(data) {
				this.close();
				var result = sendSynchronouslyImpl(data);
				this.poll();
				return result;
			},
			close: function() {
				closeRequest(request);
				request = null;
			},
			isOpened: function() {
				return request;
			}
		};
	}

	var createWsHandler = function() {
		var webSocket = null;

		return {
			open: function() {
				webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + comm_home.WEBSOCKET_PATH);
				webSocket.onopen = function(event) {
					st.console.log("Successfully opened WebSocket: " + event);
				};
				webSocket.onerror = function(event) {
					st.console.log("WebSocket failed: " + event);
				};
				webSocket.onmessage = function(event) {					
					comm_home.handleMessage(event.data, 200);
				};
				webSocket.onclose = function() {
					st.console.log("WebSocket received close event.");
				};
			},
			send: function(data) {
				webSocket.send(message);
				st.console.statusInfo(message, 200);
			},
			sendSynchronously: sendSynchronouslyImpl,
			close: function() {
				webSocket.close();
				webSocket = null;
				st.console.log("WebSocket closed by client.");
			},
			isOpened: function() {
				return webSocket;
			}
		};
	};

	// Once setup the default connectionHandler-object
	comm_home.setup();

})();
