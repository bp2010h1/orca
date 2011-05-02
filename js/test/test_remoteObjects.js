
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

		testUnaryMessage: function(){
			var remoteObject = st.Object.newOnServer();
			st.tests.assert(remoteObject.isNil() == st.false, ">>isNil as unary message to a remoteObject of Object did not return false.");
		}

	}

});

st.RemoteObjectTester._newInstance();
