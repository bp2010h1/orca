
var S2JConnection = {

	// 
	// Configuration
	// 
	
	preferWs: true,
	
	// 
	// Local variables
	// 
	
	webSocket: null,
	request: null,
	identifier: null,

	// 
	// API
	// 
	
	isWsSupported: function() {
		return ("WebSocket" in window);
	},

	useWs: function() {
		return (this.isWsSupported() && this.preferWs);
	},

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
		this.send(document.getElementById("input").value);
	},

	disconnect: function() {
		this.useWs() ? this.closeSocket() : this.closeComet();
	},

	// 
	// Private Comet functions
	// 
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
		this.request.onreadystatechange = function() {
			// this is S2JConnection.request
			if (this.readyState == 4) {
				if (this.status == 200) {
					var content = this.responseText;
					S2JConnection.doIt(content);
					S2JConsole.statusInfo(content, this.status);
					S2JConnection.poll();
				}
				else if (this.status == 202) {
					S2JConnection.identifier = this.responseText;
					S2JConsole.info("Registered with id " + S2JConnection.identifier);
					S2JConnection.poll();
				}
				else S2JConsole.info("disconnected");
			}
		}
		this.request.send(null);
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

	closeComet: function() {
		if (this.request) {
			// TODO this is not pretty: this abort()-call always results in a "Failed to load resource" in the browser...
			this.request.abort();
			this.request = null;
		}
	},
	
	// 
	// Private WebSocket functions
	// 
	
	openSocket: function() {
	
		this.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		this.webSocket.onopen = function(event) {
			S2JConsole.info("Successfully opened WebSocket.");
		};
	
		this.webSocket.onerror = function(event) {
			S2JConsole.info("WebSocket failed.");
		};
	
		this.webSocket.onmessage = function(event) {
			   S2JConsole.statusInfo(200, event.data);
			   S2JConnection.doIt(event.data);
		};
	
		this.webSocket.onclose = function() {
			S2JConsole.info("WebSocket received close event.");
		};
	},

	sendSocket: function(message) {
		if (this.webSocket) {
			this.webSocket.send(message);
			S2JConsole.log(message, 200);
		}
	},

	closeSocket: function() {
		if (this.webSocket) {
			S2JConsole.info("WebSocket closed by client.");
			this.webSocket.close();
			this.webSocket = null;
		}
	},
	
	// This gets ovewritten in another script
	doIt: function(code) {
		return eval(code);
	}
	
}
