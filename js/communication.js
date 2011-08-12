
// Setup depends on: -
// Runtime depends on: console.js, helpers.js

// API:
// st.communication.send(data, handlerId)
// st.communication.sendForked(data, handlerId)
// st.communication.addMessageHandler(string, function)
// st.communication.getMessageHandler(string)

// (st.setup_session_id(int) can be called only once)

// Settings:
// st.communication.MESSAGE_PATH (string)

(function() {

	// Set up the namespace
	if (!window.st) window.st = {};
	var home = st.communication ? st.communication : (st.communication = {});

	// 
	// Settings
	// 

	if (!("MESSAGE_PATH" in home)) home.MESSAGE_PATH = "message";

	// 
	// Local variables
	// 

	var messageHandlers = [];
	var session_id = -1;

	// 
	// API functions
	// 

	home.send = function(data, handlerId) {
		// If the client has sent a synchronous request, all following request
		// will become automatically synchronous, too. When this request is finished,
		// we reset the flag indicating that we are in a synchronous context.
		var isOuterMostSynchronousContext = !isInSynchronousCall;
		isInSynchronousCall = true;
		var result = doSend(data, true, "blocked", handlerId);
		if (isOuterMostSynchronousContext) isInSynchronousCall = false;
		return result;
	};

	home.sendForked = function(data, handlerId) {
		// No meaningfull result-value when sending forked
		doSend(data, false, "forked", handlerId, true);
		return null;
	};

	home.addMessageHandler = function(handlerId, handlerFunction) {
		messageHandlers[handlerId] = handlerFunction;
	};

	home.getMessageHandler = function(handlerId) {
		return messageHandlers[handlerId];
	}

	home.setup_session_id = function(id) {
		// Allow calling this function only once - delete after usage
		delete home.setup_session_id;
		st.console.log("This session-id is " + id);
		session_id = id;
		openLongPoll(); // Open the connection initially
	};

	// 
	// Private functions
	// 

	// Set up default handler
	home.addMessageHandler("default",
		function(messageString) { st.console.log("Received unhandled message: " + messageString); });
	home.addMessageHandler("code",
		function(messageString) { return st.globalEval(messageString); });

	// Use the configured message-handler to evaluate and log the content
	var handleMessage = function(content, handlerId) {
		var result;
		try {
			st.console.log("Received message to '" + handlerId + "': " + content);
			var handler = messageHandlers[handlerId];
			if (!handler) {
				// Use the default handler or do nothing by default
				handler = messageHandlers["default"];
			}
			if (handler)
				result = handler(content);
		} catch (e) {
			st.console.log("Error handling the content of a server-message: " + e + ".\r\n" +
			"Message was: " + content);
		}
		return result;
	};

	var isInSynchronousCall = false;

	var openLongPoll = function() {
		doSend("", false, "longPoll", "default", false, true);
	}

	var doSend = function(data, isSynchronousMandatory, status, handlerId, ignoreResponse, isLongPoll) {
		if (session_id == -1) {
			throw "Session-ID has not been set up yet! Cannot send.";
		}
		var url = st.fullURL(home.MESSAGE_PATH) + "?id=" + session_id;
		
		// If we are in a synchronous send from the client, all calls become synchronous calls,
		// because the client is single-threaded.
		isSynchronousMandatory = isSynchronousMandatory || isInSynchronousCall;
		
		var request = st.createRequest();
		var content = "status=" + st.escapeAll(status);
		content += "&message=" + st.escapeAll(data);
		content += "&handlerId=" + st.escapeAll(handlerId ? handlerId : "default");
		if (!ignoreResponse && !isSynchronousMandatory)
			request.onreadystatechange = function() {
				answerToMessage(request, isLongPoll); };
		request.open("POST", url, !isSynchronousMandatory);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		st.console.log("Sending (synchronous: " + isSynchronousMandatory + ", is in synchronous call: " + isInSynchronousCall + ") " + status + " to " + handlerId + ": " + data);
		request.send(content);
		if (!ignoreResponse && isSynchronousMandatory)
			return answerToMessage(request, isLongPoll);
		return request.responseText;
	}

	// Answering a message can recursively cause doing more sends
	// (either by sending the answer or from inside a message handler)
	// The execution stack will preserve the info, where to return after all the sends
	var answerToMessage = function(request, isLongPoll) {
		if (request.readyState == 4) {
			if (isLongPoll)
				// If this response closed the long-poll-connection, reopen it immediately
				// to keep the connection to the server up and show, that we're still alive.
				openLongPoll();
			
			var result;
			if (request.status == 200) {
				var response = /status=([^&]*)&handlerId=([^&]*)&message=([^&]*)/.exec(request.responseText);
				if (response && response.length >= 2) {
					var status = unescape(response[1]);
					var handlerId = unescape(response[2]);
					var message = unescape(response[3]);
					if (status == "empty") {
						// do nothing. The server has answered to a request,
						// that has no meaningfull answer-semanitcs.
						// Mainly this happens in return to an answer sent from the client.
						
						// The result stays null. It should not be relevant anywhere.
					} else if (status == "answer") {
						// "answerTo: (answer)"
						console.log("Received answer: " + message);
						result = message; // No new connection
					} else if (status == "blocked") {
						// "answerTo: (blocked)"
						var server_result = handleMessage(message, handlerId);
						result = doSend(server_result, false, "answer");
					} else if (status == "forked") {
						// "answerTo: (forked)"
						handleMessage(message, handlerId); // Ignore result
						// The result stays null, it should not be relevant anywhere.
					} else {
						st.console.log("Illegal message received from the server: " + request.responseText);
					}
				} else {
					st.console.log("Illegal message received from the server: " + request.responseText);
				}
			} else {
				st.console.statusInfo("Unexpected status in server-response", request.status);
			}
			return result;
		}
	}

})();
