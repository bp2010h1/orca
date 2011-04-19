// Here, we test the implementation of RemoteObjects

st.tests.setupSqueakEnvironment();

st.class("RemoteObjectTester", { 

	superclass: st.Object,
	classInstanceVariables: [ ],
	instanceVariables: [ ],

	instanceMethods: {
		
		testNewOnServer: function (){
			var remoteObject = st.Object.newOnServer();
			st.tests.assert(remoteObject.isRemote());
			st.tests.assert((typeof remoteObject._remoteID) === "number");
		},

	}

});

st.RemoteObjectTester._newInstance();
