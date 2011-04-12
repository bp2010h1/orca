
var OrcaConnection = {

	// 
	// Configuration
	// 
	
	preferWs: true,
	
	// 
	// Local variables
	// 
	
	webSocket: null,
	request: null,
	identifier: getRandomInt(0, 4294967296),

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
	
	sendSynchronously: function(data, url) {
		if (data) {
			if (!this.useWs()) this.closeComet();
			this.request = this.createXmlRequest();
			this.request.open("POST", url, false);
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
		return this.serverUrl() + "xhr?id=" + this.identifier;
	},

	openComet: function() {
		if (!this.request) this.poll();
	},
	
	codeExecutionUrl: function() {
		return this.serverUrl() + "mi";
	},
	
	remoteMessageSendUrl: function() {
		return this.serverUrl() + "send?id=" + this.identifier;
	},
	
	serverUrl: function() {
		var baseUrl = document.location.href
		if (/\/$/.test(baseUrl)){
			return baseUrl;
		}
		return baseUrl + "/";
	},
	
	poll: function() {
		this.request = this.createXmlRequest();
		this.request.open("GET", this.cometUrl(), true);
		this.request.onreadystatechange = function() {
			// this is OrcaConnection.request
			if (this.readyState == 4) {
				if (this.status == 200) {
					var content = this.responseText;
					OrcaConnection.doIt(content);
					OrcaConsole.statusInfo(content, this.status);
					OrcaConnection.poll();
				}
				else OrcaConsole.info("disconnected");
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
	
		this.webSocket = new WebSocket("ws://" + this.serverUrl().split("//")[1] + "/ws");
	
		this.webSocket.onopen = function(event) {
			OrcaConsole.info("Successfully opened WebSocket.");
		};
	
		this.webSocket.onerror = function(event) {
			OrcaConsole.info("WebSocket failed.");
		};
	
		this.webSocket.onmessage = function(event) {
			   OrcaConsole.statusInfo(200, event.data);
			   OrcaConnection.doIt(event.data);
		};
	
		this.webSocket.onclose = function() {
			OrcaConsole.info("WebSocket received close event.");
		};
	},

	sendSocket: function(message) {
		if (this.webSocket) {
			this.webSocket.send(message);
			OrcaConsole.log(message, 200);
		}
	},

	closeSocket: function() {
		if (this.webSocket) {
			OrcaConsole.info("WebSocket closed by client.");
			this.webSocket.close();
			this.webSocket = null;
		}
	},
	
	// This gets ovewritten in another script
	doIt: function(code) {
		return eval(code);
	}
	
}
