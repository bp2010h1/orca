// namespace to avoid even more global state
var S2JConnection = {

	preferWs: true,
	data: null,
	webSocket: null,
	request: null,
	identifier: null,

	// This gets ovewritten in another script
	doIt: function(code) {
		return eval(code);
	},

	isWsSupported: function() {
		return ("WebSocket" in window);
	},

	useWs: function() {
		return (this.isWsSupported() && this.preferWs);
	},

	// common functions

	connect: function() {
		this.useWs() ? this.openSocket() : this.openComet();
	},

	send: function(data) {
		if (data) {
			return this.useWs() ? this.sendSocket(data) : this.sendComet(data);
		}
	},
	
	sendSynchronously: function(data) {
		if (data) {
			if (!this.useWs()) this.closeComet();
			this.request = this.createXmlRequest();
			this.request.open("POST", this.methodInvocationUrl(), false);
			this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			this.request.send(data);
			var result = this.request.responseText;
			this.request = null;
			if (!this.useWs()) this.openComet();
			return result;
		}
	},

	sendCodeInput: function() {
		this.data = document.getElementById("input").value;
		this.send(this.data);
	},

	disconnect: function() {
		this.useWs() ? this.closeSocket() : this.closeComet();
	},

	// comet functions

	createXmlRequest: function() {
		return new XMLHttpRequest();
	},

	cometUrl: function() {
		if (this.identifier) return document.location.href + "/xhr?id=" + this.identifier;
		return document.location.href+"/xhr";
	},

	openComet: function() {
		if (!this.request) this.poll();
	},
	
	methodInvocationUrl: function() {
		return document.location.href+"/mi";
	},
	
	poll: function() {
		this.request = this.createXmlRequest();
		this.request.open("GET", this.cometUrl(), true);
		this.request.onreadystatechange = this.pollResponseHandler ;
		this.request.send(null);
	},

	pollResponseHandler: function() {
		// this is S2JConnection.request
		if (this && this.readyState == 4) {
			if (this.status == 200) {
				var content = this.responseText;
				S2JConnection.doIt(content);
				log(this.status, content);
				S2JConnection.poll();
			}
			else if (this.status == 202) {
				S2JConnection.identifier = this.responseText;
				info("Registered with id " + S2JConnection.identifier);
				S2JConnection.poll();
			}
			else info("disconnected");
		}
	},

	sendComet: function(data) {
		this.closeComet();
		this.request = this.createXmlRequest();
		this.request.open("POST", this.methodInvocationUrl(), false);
		this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		this.request.send(data);
		var result = this.request.responseText;
		this.request = null;
		this.openComet();
		return result;
	},

	sendResponseHandler: function() {	
		if ((this.request.readyState == 4) && (this.request.status == 201)) {
			log(201, data);
			this.poll();
		}
	},

	closeComet: function() {
		if (this.request) {
			this.request.abort();
			this.request = null;
		}
	},
	
	// WebSocket

	openSocket: function() {
	
		this.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		this.webSocket.onopen = function(event) {
			info("Successfully opened WebSocket.");
		};
	
		this.webSocket.onerror = function(event) {
			log("WebSocket failed.");
		};
	
		this.webSocket.onmessage = function(event) {			
			   log(200, event.data);
			   S2JConnection.doIt(event.data);
		};
	
		this.webSocket.onclose = function() {
			info("WebSocket received close event.");
		};
	},

	sendSocket: function(message) {
		if (this.webSocket) {
			this.webSocket.send(message);
			log(200, message);
		}
	},

	closeSocket: function() {
		if (this.webSocket) {
			info("WebSocket closed by client.");
			this.webSocket.close();
			this.webSocket = null;
		}
	}
}
