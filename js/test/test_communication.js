
// This tests is meant to ensure that the server can push code.
// Add more tests in general.

st.class("ConnectionTester", { 
	
	classInstanceVariables: [ "connectionToClientSuccessful" ],
	
	instanceMethods: {
		
		setUp: function(){
			this._theClass.$connectionToClientSuccessful = false;
		},
		
		testPull: function(){
			var result = 0;
			result = OrcaServer.performOnServer("[ 42 ]");
			assertEquals_(result, 42, "Answer from Server has been the wrong number");
		}
		
		/*testPush: function(){
			OrcaServer.performOnServer("[ OrcaTestApp sendCode: 'JsGlobal js ConnectionTester js connectionToClientSuccessful js: true'. false ]");
			assert(this._theClass.$connectionToClientSuccessful, "Server didn't poke this client.");
		}*/
	}
	
});

ConnectionTester._newInstance();
