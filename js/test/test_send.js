
var handlerId = "testsend";

var send = function(data) {
	var result = st.communication.send(data, handlerId);
	return result;
}

var testEnded;

var taskHandler = function(message) {
	if (testEnded) return "Server says: Test already ended, but another message arrived: " + message;
	var nextTask = null;
	// If message is an empty String, this test is finished
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
			case 'e':
				// Test ended
				testEnded = true;
				nextTask = rest;
				if (nextTask == "") return "tests ok";
		}
	}
	if (nextTask != null) {
		return taskHandler(nextTask);
	}
	return "test failed, last message was: " + message;
};

st.communication.addMessageHandler(handlerId, taskHandler);

var performTest = function(testSpec) {
	testEnded = false;
	var result = taskHandler(testSpec);
	st.tests.assert("tests ok" == result, "Send test-spec failed: " + testSpec + ", taskHandler returned: " + result);
	st.tests.assert(testEnded, "Test spec says it's ok, but testEnded has not been set, so something went wrong after all.");
}

st.klass("SendTester", { 

	instanceMethods: {
		
		testSingle: function() {
			// Send blocked and expect immediate answer
			performTest("bae");
		},
		
		testDouble: function() {
			// Send blocked and expect immediate answer
			performTest("babae");
		},
		
		testTriple: function() {
			// Send blocked and expect immediate answer
			performTest("bababae");
		},
		
		testDoubleCascaded: function() {
			// b>
			//   <b
			//     <a
			//   <a
			
			// Open blocked connection 2 times.
			performTest("bbaae");
		},
		
		testTripleCascaded: function() {
			// b>
			//   <b
			//     b>
			//       <a
			//     >a
			//   <a
			
			// Open blocked connection 3 times.
			performTest("bbbaaae");
		},
		
		test4TimesCascaded: function() {
			// b>
			//   <b
			//     b>
			//       b<
			//         >a
			//       <a
			//     >a
			//   <a
			
			// Open blocked connection 4 times.
			performTest("bbbbaaaae");
		},
		
	}

});

st.SendTester._newInstance();
