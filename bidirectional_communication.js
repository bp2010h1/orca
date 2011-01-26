// namespace to avoid even more global state
var S2JConnection = {

	preferWs : false,
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
		return (this.isWsSupported() && this.preferWs);
	},

	// common functions

	connect : function() {
		this.useWs() ? this.openSocket() : this.openComet();
	},

	send : function(data) {
		if (data != "") {
			return this.sendComet(data);
		}
	},
	
	sendCodeInput : function() {
		this.data = document.getElementById("input").value;
		this.send(this.data);
	},

	disconnect : function() {
		this.useWs() ? this.closeSocket() : this.closeComet();
	},

	// comet functions

	createXmlRequest : function() {
		return new XMLHttpRequest();
	},

	cometUrl : function() {
		if (this.identifier != null) return document.location.href + "/xhr?id=" + this.identifier;
		return document.location.href+"/xhr";
	},

	openComet : function() {
		if (this.request == null) this.poll();
	},
	
	methodInvocationUrl : function() {
		return document.location.href+"/mi";
	},
	
	poll : function() {
		this.request = this.createXmlRequest();
		this.request.open("GET", this.cometUrl(), true);
		this.request.onreadystatechange = this.pollResponseHandler;
		this.request.send(null);
	},

	pollResponseHandler : function() {
		if (this.request.readyState == 4) {
			if (this.request.status == 200) {
				var content = this.request.responseText;
				this.doIt(content);
				log(this.request.status, content);
				this.poll();
			}
			else if (this.request.status == 202) {
				this.identifier = this.request.responseText;
				info("Registered with id " + this.identifier);
				this.poll();
			}
			else info("disconnected");
		}
	},

	sendComet : function(data) {
		if (this.request) {
			this.closeComet();
		}
		this.request = this.createXmlRequest();
		this.request.open("POST", this.methodInvocationUrl(), false);
		this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		this.request.send(data);
		var result = this.request.responseText;
		this.request=null;
		this.openComet();
		return result;
	},

	sendResponseHandler : function() {	
		if ((this.request.readyState == 4) && (this.request.status == 201)) {
			log(201, data);
			this.poll();
		}
	},

	closeComet : function() {
		if (this.request) {
			this.request.abort();
			this.request = null;
		}
	},
	
	// WebSocket

	openSocket : function() {
	
		this.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		this.webSocket.onopen = function(event) {
			info("Successfully opened WebSocket.");
		};
	
		this.webSocket.onerror = function(event) {
			log("WebSocket failed.");
		};
	
		this.webSocket.onmessage = function(event) {			
			   log(200, event.data);
			   this.doIt(event.data);
		};
	
		this.webSocket.onclose = function() {
			info("WebSocket received close event.");
		};
	},

	sendSocket : function(message) {
		if (this.webSocket != null) {
			this.webSocket.send(message);
			log(200, message);
		}
	},

	closeSocket : function() {
		if (this.webSocket != null) {
			info("WebSocket closed by client.");
			this.webSocket.close();
			this.webSocket = null;
		}
	}
}
