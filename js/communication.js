
// Setup depends on: -
// Runtime depends on: console.js, helpers.js

// API:
// st.communication.send(data)
// st.communication.sendForked(data)

// st.communication.handleMessage(content, status)

// (st.setup_session_id(int) can be called only once)

// Settings:
// st.communication.STRING_PATH (string)
// st.communication.MESSAGE_HANDLER (function(string))

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// 
	// Settings
	// 

	if (!("STRING_PATH" in home)) home.STRING_PATH = "message";
	if (!("MESSAGE_HANDLER" in home)) home.MESSAGE_HANDLER = function(message) {
		st.console.log("Received message: " + message);
		return st.globalEval(message); };

	// 
	// Local variables
	// 

	var session_id = -1;

	// 
	// API functions
	// 

	home.send = function(data) {
		return doSend(data, true, "blocked");
	};

	home.sendForked = function(data) {
		// No meaningfull result-value when sending forked
		doSend(data, false, "forked", true);
		return null;
	};

	home.setup_session_id = function(id) {
		// Allow calling this function only once - delete after usage
		delete home.setup_session_id;
		st.console.log("This session-id is " + id);
		session_id = id;
		doSend("", false, "forked"); // Open the connection initially
	};

	// Use the configured message-handler to evaluate and log the content
	home.handleMessage = function(content) {
		var result;
		try {
			result = home.MESSAGE_HANDLER(content);
		} catch (e) {
			st.console.log("Error handling the content of a server-message: " + e + ".\r\n" +
			"Message was: " + content);
		}
		return result;
	};

	// 
	// Private functions
	// 

	// Increased with every send and decreased with every received "answer"
	var awaitedAnswers = 0;

	var doSend = function(data, isSynchronous, status, ignoreResponse) {
		if (session_id == -1) {
			throw "Session-ID has not been set up yet! Cannot send.";
		}
		var url = st.fullURL(home.STRING_PATH) + "?id=" + session_id;
		
		var request = st.createRequest();
		var content = "status=" + st.escapeAll(status);
		content += "&message=" + st.escapeAll(data);
		if (!ignoreResponse && !isSynchronous)
			request.onreadystatechange = function() { answerToMessage(request); };
		request.open("POST", url, !isSynchronous);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		awaitedAnswers++;
		request.send(content);
		if (!ignoreResponse && isSynchronous)
			return answerToMessage(request);
		return request.responseText;
	}

	// Answering a message can recursively cause doing more sends
	// (either by sending the answer or from inside the MESSAGE_HANDLER)
	// The execution stack will preserve the info, where to return after all the sends
	var answerToMessage = function(request) {
		if (request.readyState == 4) {
			if (request.status == 200) {
				var response = /status=([^&]*)&message=([^&]*)/.exec(request.responseText);
				if (response && response.length >= 2) {
					var status = response[1];
					var message = unescape(response[2]);
					if (status == "answer") {
						// "answerTo: (answer)"
						awaitedAnswers--;
						if (awaitedAnswers < 0) {
							awaitedAnswers = 0;
							st.console.log("Illegal state: Received more answers than sends!");
						}
						return message;
					} else if (status == "blocked") {
						// "answerTo: (blocked)"
						var result = home.handleMessage(message);
						return doSend(result, false, "answer");
					} else if (status == "forked") {
						// "answerTo: (forked)"
						if (awaitedAnswers >= 2) {
							// Inside any blocking send from the client, a forked
							// send from the server becomes blocking, because the clientInformation
							// needs the opening connection to block
							home.handleMessage(message); // Ignore result
							return doSend("", true, "answer");
						} else {
							var result = doSend("", false , "answer");
							home.handleMessage(message); // Ignore result
							return result;
						}
					}
				}
				st.console.log("Illegal message received from the server: " + request.responseText);
			} else {
				st.console.statusInfo("Channel disconnected: " + request.responseText, request.status);
			}
		}
	}

})();
