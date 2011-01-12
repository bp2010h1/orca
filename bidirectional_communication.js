var preferWs = true;
var data = null;
var webSocket = null;
var request = null;
var identifier = null;
	
	function isWsSupported() {
		return ("WebSocket" in window);
	}
	
	function useWs() {
		return (isWsSupported() && preferWs);
	}
	
	// common functions
	
	function connect() {
		useWs() ? openSocket() : openComet();
	}
	
	function send() {
		data = document.getElementById("input").value;
		if (data != "") {
			useWs() ? sendSocket(data) : sendComet(data);
		}
	}
	
	function disconnect() {
		useWs() ? closeSocket() : closeComet();
	}

	// comet functions

	function createXmlRequest() {
		return new XMLHttpRequest();
	}
	
	function cometUrl() {
		if (identifier != null) return document.location.href + "/xhr?id=" + identifier;
		return document.location.href+"/xhr";
	}
	
	function openComet() {
		if (request == null) poll();
	}
		
	function poll() {
		request = createXmlRequest();
		request.open("GET", cometUrl(), true);
		request.onreadystatechange = pollResponseHandler;
		request.send(null);
	}
	
	function pollResponseHandler() {
		if (request.readyState == 4) {
			if (request.status == 200) {
				var content = request.responseText;
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
	}
	
	function sendComet(data) {
		stop();
		request = createXmlRequest();
		request.open("POST", cometUrl(), true);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		request.onreadystatechange = sendResponseHandler;
		request.send(encodeURIComponent(data));
	}
	
	function sendResponseHandler() {	
		if ((request.readyState == 4) && (request.status == 201)) {
			log(201, data);
			poll();
		}
	}
	
	function closeComet() {
		if (request != null) {
			request.abort();
			request = null;
		}
	}
	
	// WebSocket
	
	function openSocket() {
		
		webSocket = new WebSocket("ws://" + document.location.href.split("//")[1] + "/ws");
		
		webSocket.onopen = function(event) {
			info("Successfully opened WebSocket.");
		}
		
		webSocket.onerror = function(event) {
			log("WebSocket failed.");
		}
		
		webSocket.onmessage = function(event) {
			log(200, event.data);
		}
		
		webSocket.onclose = function() {
			info("WebSocket received close event.");
		}
	}
	
	function sendSocket(message) {
		if (webSocket != null) {
			webSocket.send(message);
			log(200, message);
		}
	}

	function closeSocket() {
		if (webSocket != null) {
			info("WebSocket closed by client.");
			webSocket.close();
			webSocket = null;
		}
	}
	
	function info(message) {
		alert(message);
	}
	function log(message) {
		alert(message);
	}
	