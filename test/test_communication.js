
//This tests is meant to ensure that the server can push code.
//Add more tests in general.

//global var wich has to be written to when calling the push. may be moved to classside
var connectionToClientSuccessful = false;

Class("ConnectionTester", { instanceMethods: {
		
		setUp: function(){
			connectionToClientSuccessful = false;
		},
		
		testPull: function(){
			var result = 0;
			result = S2JServer.performOnServer("[ 42 ]");
			assert(result.js() == 42, "Answer from Server has been the wrong number: " + result.js());
		},
		
		testPush: function(){
			S2JServer.performOnServer(
				"[ S2JTestApp sendCode: 'JsGlobal js connectionToClientSuccessful js: true'. " + 
					"(Delay forSeconds: 1) wait. " + 
					"true ]");
			assert(connectionToClientSuccessful, "Server didn't poke this client.");
		}
}});

ConnectionTester._newInstance();
