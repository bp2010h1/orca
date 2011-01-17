// namespace to avoid even more global state
var CONNECTION = {

	preferWs : true,
	data : null,
	webSocket : null,
	request : null,
	identifier : null,

	isWsSupported : function() {
		return ("WebSocket" in window);
	},

	useWs : function() {
		return (CONNECTION.isWsSupported() && CONNECTION.preferWs);
	},

	// common functions

	connect : function() {
		CONNECTION.useWs() ? CONNECTION.openSocket() : CONNECTION.openComet();
	},

	send : function(data) {
		if (data != "") {
			return CONNECTION.sendComet(data);
		}
	},
	
	sendCodeInput : function() {
		CONNECTION.data = document.getElementById("input").value;
		CONNECTION.send(CONNECTION.data);
	},

	disconnect : function() {
		CONNECTION.useWs() ? CONNECTION.closeSocket() : CONNECTION.closeComet();
	},

	// comet functions

	createXmlRequest : function() {
		return new XMLHttpRequest();
	},

	cometUrl : function() {
		if (CONNECTION.identifier != null) return document.location.href + "/xhr?id=" + CONNECTION.identifier;
		return document.location.href+"/xhr";
	},

	openComet : function() {
		if (CONNECTION.request == null) CONNECTION.poll();
	},
	
	methodCallUrl : function() {
		return document.location.href+"/mcc";
	},
	
	poll : function() {
		CONNECTION.request = CONNECTION.createXmlRequest();
		CONNECTION.request.open("GET", CONNECTION.cometUrl(), true);
		CONNECTION.request.onreadystatechange = CONNECTION.pollResponseHandler;
		CONNECTION.request.send(null);
	},

	pollResponseHandler : function() {
		if (CONNECTION.request.readyState == 4) {
			if (CONNECTION.request.status == 200) {
				var content = CONNECTION.request.responseText;
				eval(content);
				log(CONNECTION.request.status, content);
				CONNECTION.poll();
			}
			else if (CONNECTION.request.status == 202) {
				CONNECTION.identifier = CONNECTION.request.responseText;
				info("Registered with id " + CONNECTION.identifier);
				CONNECTION.poll();
			}
			else info("disconnected");
		}
	},

	sendComet : function(data) {
		CONNECTION.closeComet();
		CONNECTION.request = CONNECTION.createXmlRequest();
		CONNECTION.request.open("POST", CONNECTION.methodCallUrl(), false);
		CONNECTION.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		//CONNECTION.request.onreadystatechange = CONNECTION.sendResponseHandler;
		return CONNECTION.request.send(encodeURIComponent(data));
	},

	sendResponseHandler : function() {	
		if ((CONNECTION.request.readyState == 4) && (CONNECTION.request.status == 201)) {
			log(201, data);
			CONNECTION.poll();
		}
	},

	closeComet : function() {
		if (CONNECTION.request != null) {
			CONNECTION.request.abort();
			CONNECTION.request = null;
		}
	},

	// WebSocket

	openSocket : function() {
	
		CONNECTION.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		CONNECTION.webSocket.onopen = function(event) {
			info("Successfully opened WebSocket.");
		};
	
		CONNECTION.webSocket.onerror = function(event) {
			log("WebSocket failed.");
		};
	
		CONNECTION.webSocket.onmessage = function(event) {			
			if (event.data.indexOf('Result: ')==0){
			  SERVER.callback(event.data);
			}
			else {
			  // no result of a invocation
			  
			   //log(200, event.data);
			   //eval(event.data);
			}
		};
	
		CONNECTION.webSocket.onclose = function() {
			info("WebSocket received close event.");
		};
	},

	sendSocket : function(message) {
		if (CONNECTION.webSocket != null) {
			CONNECTION.webSocket.send(message);
			log(200, message);
		}
	},

	closeSocket	: function() {
		if (CONNECTION.webSocket != null) {
			info("WebSocket closed by client.");
			CONNECTION.webSocket.close();
			CONNECTION.webSocket = null;
		}
	}
}