
// This tests is meant to ensure that the server can push code.
// Add more tests in general.

Class("ConnectionTester", { 
	
	classInstanceVariables: [ "connectionToClientSuccessful" ],
	
	instanceMethods: {
		
		setUp: function(){
			this.__class.$connectionToClientSuccessful = false;
		},
		
		testPull: function(){
			var result = 0;
			result = S2JServer.performOnServer("[ 42 ]");
			assert(result.js() == 42, "Answer from Server has been the wrong number: " + result.js());
		},
		
		testPush: function(){
			S2JServer.performOnServer("[ S2JTestApp sendCode: 'JsGlobal js ConnectionTester js connectionToClientSuccessful js: true'. true ]");
			assert(this.__class.$connectionToClientSuccessful, "Server didn't poke this client.");
		}
	}
	
});

ConnectionTester._newInstance();
