// namespace to avoid even more global state
var S2JConnection = {

	preferWs : true,
	data : null,
	webSocket : null,
	request : null,
	identifier : null,
	
	doIt: function(code) {
		return eval(code);
	},

	isWsSupported : function() {
		return ("WebSocket" in window);
	},

	useWs : function() {
		return (S2JConnection.isWsSupported() && S2JConnection.preferWs);
	},

	// common functions

	connect : function() {
		S2JConnection.useWs() ? S2JConnection.openSocket() : S2JConnection.openComet();
	},

	send : function(data) {
		if (data != "") {
			return S2JConnection.sendComet(data);
		}
	},
	
	sendCodeInput : function() {
		S2JConnection.data = document.getElementById("input").value;
		S2JConnection.send(S2JConnection.data);
	},

	disconnect : function() {
		S2JConnection.useWs() ? S2JConnection.closeSocket() : S2JConnection.closeComet();
	},

	// comet functions

	createXmlRequest : function() {
		return new XMLHttpRequest();
	},

	cometUrl : function() {
		if (S2JConnection.identifier != null) return document.location.href + "/xhr?id=" + S2JConnection.identifier;
		return document.location.href+"/xhr";
	},

	openComet : function() {
		if (S2JConnection.request == null) S2JConnection.poll();
	},
	
	methodInvocationUrl : function() {
		return document.location.href+"/mi";
	},
	
	poll : function() {
		S2JConnection.request = S2JConnection.createXmlRequest();
		S2JConnection.request.open("GET", S2JConnection.cometUrl(), true);
		S2JConnection.request.onreadystatechange = S2JConnection.pollResponseHandler;
		S2JConnection.request.send(null);
	},

	pollResponseHandler : function() {
		if (S2JConnection.request.readyState == 4) {
			if (S2JConnection.request.status == 200) {
				var content = S2JConnection.request.responseText;
				S2JConnection.doIt(content);
				log(S2JConnection.request.status, content);
				S2JConnection.poll();
			}
			else if (S2JConnection.request.status == 202) {
				S2JConnection.identifier = S2JConnection.request.responseText;
				info("Registered with id " + S2JConnection.identifier);
				S2JConnection.poll();
			}
			else info("disconnected");
		}
	},

	sendComet : function(data) {
		S2JConnection.closeComet();
		S2JConnection.request = S2JConnection.createXmlRequest();
		S2JConnection.request.open("POST", S2JConnection.methodInvocationUrl(), false);
		S2JConnection.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		S2JConnection.request.send(data);
		var result = S2JConnection.request.responseText;
		S2JConnection.request=null;
		S2JConnection.openComet();
		return result;
	},

	sendResponseHandler : function() {	
		if ((S2JConnection.request.readyState == 4) && (S2JConnection.request.status == 201)) {
			log(201, data);
			S2JConnection.poll();
		}
	},

	closeComet : function() {
		if (S2JConnection.request != null) {
			S2JConnection.request.abort();
			S2JConnection.request = null;
		}
	},
	
	// WebSocket

	openSocket : function() {
	
		S2JConnection.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		S2JConnection.webSocket.onopen = function(event) {
			info("Successfully opened WebSocket.");
		};
	
		S2JConnection.webSocket.onerror = function(event) {
			log("WebSocket failed.");
		};
	
		S2JConnection.webSocket.onmessage = function(event) {			
			   log(200, event.data);
			   S2JConnection.doIt(event.data);
		};
	
		S2JConnection.webSocket.onclose = function() {
			info("WebSocket received close event.");
		};
	},

	sendSocket : function(message) {
		if (S2JConnection.webSocket != null) {
			S2JConnection.webSocket.send(message);
			log(200, message);
		}
	},

	closeSocket : function() {
		if (S2JConnection.webSocket != null) {
			info("WebSocket closed by client.");
			S2JConnection.webSocket.close();
			S2JConnection.webSocket = null;
		}
	}
}
