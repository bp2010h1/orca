
var handlerId = "testsend";

var send = function(data) {
	return st.communication.send(data, handlerId);
}

var sendForked = function(data) {
	return st.communication.sendForked(data, handlerId);
}

var asynchMessages = 0;

var taskHandler = function(message) {
	// If message is an empty String, this test is finished
	var nextTask = null;
	if (message.length > 0) {
		var firstChar = message[0];
		var rest = message.substr(1);
		switch (firstChar) {
			case 'a': 
				// Answer directly
				return rest;
			case 'b': 
				// Blocked send
				nextTask = send(rest);
				break;
			case 'f': 
				// Forked send
				sendForked("asynch");
				nextTask = rest;
				break;
			case 'r': 
				// Forked send, asynch reply expected
				sendForked("asynch please reply");
				nextTask = rest;
				break;

			case '0': 
				// Check, that 0 asynch sends has arrived in the meantime
				st.tests.assert(asynchMessages == 0);
			case '1': 
				// Check, that 1 asynch send has arrived in the meantime
				st.tests.assert(asynchMessages == 1);
			case '2': 
				// Check, that 2 asynch sends has arrived in the meantime
				st.tests.assert(asynchMessages == 2);
			case '3': 
				// Check, that 3 asynch sends has arrived in the meantime
				st.tests.assert(asynchMessages == 3);
			case '4': 
				// Check, that 4 asynch sends has arrived in the meantime
				st.tests.assert(asynchMessages == 4);
			case 'all_numbers': // Above cases enter here, because there is no break;
				asynchMessages = 0;
				nextTask = rest;
		}
	}
	if (nextTask != null) {
		return taskHandler(nextTask);
	}
	return "tests ok";
};

st.communication.addMessageHandler(handlerId, function(message) {
	if (message == "asynch") {
		// When receiving a forked message, don't send anything.
		// It would get lost, as testing here cannot handle forked threads.
		asynchMessages++;
		return;
	}
	if (message == "asynch please reply") {
		// Server want an answer to an asynch message
		return sendForked("asynch");
	}
	return "BAD TESTS";
});

var performTest = function(testSpec) {
	st.tests.assert("tests ok" == handler(testSpec), "Send test-spec failed: " + testSpec);
}

st.klass("SendTester", { 

	classInstanceVariables: [ ],
	instanceVariables: [ ],

	instanceMethods: {
		
		test1: function() {
			// Send blocked and expect immediate answer
			// No asynch messages in the meantime
			performTest("ba0");
		},
		
		test2: function() {
			// b>
			//   b<
			//     f>
			//       f<
			//     a>
			//   a<
			
			// Client calls blocked, Server calls blocked,
			// Client calls forked, server replies with forked.
			// Client returs, Server returns. One asynch message has arrived on client.
			
			performTest("bbra1");
		},
		
		test3: function() {
			// b>
			//   <b
			//     b>
			//       <a
			//     <a
			//   <a
			
			// Open blocked connection 3 times. More is not necessary for testing.
			
			performTest("bbbaaa0");
		},
		
		test4: function() {
			// b>
			//   f<
			//     f>
			//   f<
			//   f<
			//     f>
			//   f<
			
			
			// Send many forked messages, answer some forked messages in the meantime
			
			performTest("brfrfa4");
		},
		
	}

});

st.SendTester._newInstance();

// This leads to this test being commented out
/*
var a = {testMock:function(){}};
a;
*/
