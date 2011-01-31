// namespace to avoid even more global state
var S2JConnection = {

	preferWs: false,
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
			return this.useWs() ? sendSocket(data) : this.sendComet(data);
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
		this.request.onreadystatechange = this.pollResponseHandler;
		this.request.send(null);
	},

	pollResponseHandler: function() {
		if (this.request && this.request.readyState == 4) {
			if (this.request.status == 200) {
				var content = this.request.responseText;
				this.doIt(content);
				S2JConsole.logStatus(content, this.request.status);
				this.poll();
			}
			else if (this.request.status == 202) {
				this.identifier = this.request.responseText;
				S2JConsole.info("Registered with id " + this.identifier);
				this.poll();
			}
			else S2JConsole.info("disconnected");
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
			S2JConsole.logStatus(data, 201);
			this.poll();
		}
	},

	closeComet: function() {
		if (this.request) {
			try {
				this.request.abort();
			} catch (e) {
				// This will throw an exception
				debugger;
			}
			this.request = null;
		}
	},
	
	// WebSocket

	openSocket: function() {
	
		this.webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
	
		this.webSocket.onopen = function(event) {
			S2JConsole.info("Successfully opened WebSocket.");
		};
	
		this.webSocket.onerror = function(event) {
			S2JConsole.info("WebSocket failed.");
		};
	
		this.webSocket.onmessage = function(event) {			
			   S2JConsole.logStatus(200, event.data);
			   this.doIt(event.data);
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
	}
}
