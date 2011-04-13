
// This tests is meant to ensure that the server can push code.
// Add more tests in general.

st.class("ConnectionTester", { 

	classInstanceVariables: [ "connectionToClientSuccessful" ],

	instanceMethods: {
		
		setUp: function(){
			this._theClass.connectionToClientSuccessful = false;
		},
		
		testPull: function(){
			var result = 0;
			result = st.communication.performOnServer("[ 42 ]");
			st.tests.assertEquals(result, 42, "Answer from Server has been the wrong number: " + result);
		}
		
		/*testPush: function(){
			st.communication.performOnServer("[ OrcaTestApp sendCode: 'JsGlobal js ConnectionTester js connectionToClientSuccessful js: true'. false ]");
			st.tests.assert(this._theClass.connectionToClientSuccessful, "Server didn't poke this client.");
		}*/
	}

});

st.ConnectionTester._newInstance();
