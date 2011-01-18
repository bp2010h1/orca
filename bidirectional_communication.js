// namespace to avoid even more global state
var Connection = {

	preferWs : true,
	data : null,
	webSocket : null,
	request : null,
	identifier : null,

	isWsSupported : function() {
		return ("WebSocket" in window);
	},

	useWs : function() {
		return (Connection.isWsSupported() && Connection.preferWs);
	},

	// common functions

	connect : function() {
		Connection.useWs() ? Connection.openSocket() : Connection.openComet();
	},

	send : function(data) {
		if (data != "") {
			return Connection.sendComet(data);
		}
	},
	
	sendCodeInput : function() {
		Connection.data = document.getElementById("input").value;
		Connection.send(Connection.data);
	},

	disconnect : function() {
		Connection.useWs() ? Connection.closeSocket() : Connection.closeComet();
	},

	// comet functions

	createXmlRequest : function() {
		return new XMLHttpRequest();
	},

	cometUrl : function() {
		if (Connection.identifier != null) return document.location.href + "/xhr?id=" + Connection.identifier;
		return document.location.href+"/xhr";
	},

	openComet : function() {
		if (Connection.request == null) Connection.poll();
	},
	
	methodCallUrl : function() {
		return document.location.href+"/mcc";
	},
	
	poll : function() {
		Connection.request = Connection.createXmlRequest();
		Connection.request.open("GET", Connection.cometUrl(), true);
		Connection.request.onreadystatechange = Connection.pollResponseHandler;
		Connection.request.send(null);
	},

	pollResponseHandler : function() {
		if (Connection.request.readyState == 4) {
			if (Connection.request.status == 200) {
				var content = Connection.request.responseText;
				eval(content);
				log(Connection.request.status, content);
				Connection.poll();
			}
			else if (Connection.request.status == 202) {
				Connection.identifier = Connection.request.responseText;
				info("Registered with id " + Connection.identifier);
				Connection.poll();
			}
			else info("disconnected");
		}
	},

	sendComet : function(data) {
		Connection.closeComet();
		Connection.request = Connection.createXmlRequest();
		Connection.request.open("POST", Connection.methodCallUrl(), false);
		Connection.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		Connection.request.send(data);
		var result = Connection.request.responseText;
		Connection.request=null;
		Connection.openComet();
		return result;
	},

	sendResponseHandler : function() {	
		if ((Connection.request.readyState == 4) && (Connection.request.status == 201)) {
			log(201, data);
			Connection.poll();
		}
	},

	closeComet : function() {
		if (Connection.request != null) {
			Connection.request.abort();
			Connection.request = null;
		}
	},
	
	// WebSocket

	openSocket : function() {
	
		Connection.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		Connection.webSocket.onopen = function(event) {
			info("Successfully opened WebSocket.");
		};
	
		Connection.webSocket.onerror = function(event) {
			log("WebSocket failed.");
		};
	
		Connection.webSocket.onmessage = function(event) {			
			   log(200, event.data);
			   eval(event.data);
		};
	
		Connection.webSocket.onclose = function() {
			info("WebSocket received close event.");
		};
	},

	sendSocket : function(message) {
		if (Connection.webSocket != null) {
			Connection.webSocket.send(message);
			log(200, message);
		}
	},

	closeSocket : function() {
		if (Connection.webSocket != null) {
			info("WebSocket closed by client.");
			Connection.webSocket.close();
			Connection.webSocket = null;
		}
	}
}


// DEBUG
//info = alert;
