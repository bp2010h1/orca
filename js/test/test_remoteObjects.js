// Here, we test the implementation of RemoteObjects

st.tests.setupSqueakEnvironment();

st.class("RemoteObjectTester", { 

	superclass: st.Object,
	classInstanceVariables: [ ],
	instanceVariables: [ ],

	instanceMethods: {
		
		testNewOnServer: function (){
			var remoteObject = st.Object.newOnServer();
			st.tests.assert(remoteObject.isRemote(), "Object created through st.Object.newOnServer() is not remote.");
			st.tests.assert((typeof remoteObject._remoteID) === "number", "Returned RemoteID for the created RemoteObject is not a number.");
		},

	}

});

st.RemoteObjectTester._newInstance();
