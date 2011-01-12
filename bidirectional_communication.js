var preferWs = true;
var data = null;
var webSocket = null;
var request = null;
var identifier = null;

	var CONNECTION = {
	
		isWsSupported : function() {
			return ("WebSocket" in window);
		},
	
		useWs : function() {
			return (isWsSupported() && preferWs);
		},
	
		// common functions
	
		connect : function() {
			useWs() ? openSocket() : openComet();
		},
	
		send : function(data) {
			if (data != "") {
				useWs() ? sendSocket(data) : sendComet(data);
			}
		},
		
		sendCodeInput : function() {
			data = document.getElementById("input").value;
			send(data);
		},
	
		disconnect : function() {
			useWs() ? closeSocket() : closeComet();
		},

		// comet functions

		createXmlRequest : function() {
			return new XMLHttpRequest();
		},
	
		cometUrl : function() {
			if (identifier != null) return document.location.href + "/xhr?id=" + identifier;
			return document.location.href+"/xhr";
		},
	
		openComet : function() {
			if (request == null) poll();
		},
		
		poll : function() {
			request = createXmlRequest();
			request.open("GET", cometUrl(), true);
			request.onreadystatechange = pollResponseHandler;
			request.send(null);
		},
	
		pollResponseHandler : function() {
			if (request.readyState == 4) {
				if (request.status == 200) {
					var content = request.responseText;
					eval(content);
					log(request.status, content);
					poll();
				}
				else if (request.status == 202) {
					identifier = request.responseText;
					info("Registered with id " + identifier);
					poll();
				}
				else info("disconnected");
			}
		},
	
		sendComet : function(data) {
			stop();
			request = createXmlRequest();
			request.open("POST", cometUrl(), true);
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.onreadystatechange = sendResponseHandler;
			request.send(encodeURIComponent(data));
		},
	
		sendResponseHandler : function() {	
			if ((request.readyState == 4) && (request.status == 201)) {
				log(201, data);
				poll();
			}
		},
	
		closeComet : function() {
			if (request != null) {
				request.abort();
				request = null;
			}
		},
	
		// WebSocket
	
		openSocket : function() {
		
			webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
		
			webSocket.onopen = function(event) {
				info("Successfully opened WebSocket.");
			}
		
			webSocket.onerror = function(event) {
				log("WebSocket failed.");
			}
		
			webSocket.onmessage = function(event) {
				eval(event.data);
				log(200, event.data);
			}
		
			webSocket.onclose = function() {
				info("WebSocket received close event.");
			}
		},
	
		sendSocket : function(message) {
			if (webSocket != null) {
				webSocket.send(message);
				log(200, message);
			}
		},

		closeSocket	: function() {
			if (webSocket != null) {
				info("WebSocket closed by client.");
				webSocket.close();
				webSocket = null;
			}
		}
		
	}