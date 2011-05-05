
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
			st.tests.assert(remoteObject.isNil() === st.false, ">>isNil as unary message to a remoteObject of Object did not return false.");
		},
		
		testBinaryMessage: function(){
			var remoteObject = st.Float.newOnServer(); //float get initialized to 2.2...
			st.tests.assert(remoteObject._less(st.number(3)));
		},
		
		testKeywordMessage: function(){
			var remoteObject = st.OrderedCollection.newOnServer();
			var addedValue = remoteObject.add_(st.number(1));
			st.tests.assert(addedValue._equals(st.number(1)));
			st.tests.assert(remoteObject.first()._equals(st.number(1)));
		},

		testRemoteSymbol: function(){
			var remoteObject = st.Object.newOnServer();
			var remoteObjectClass = remoteObject._class();
			st.tests.assert(remoteObjectClass.isRemote());
			var remoteObjectClassName = remoteObjectClass.name();
			st.tests.assert(remoteObjectClassName.isRemote() === st.false, "Symbols are no RemoteObjects (yet)");
			st.tests.assert(remoteObjectClassName._equals(st.string("Object")));
		},
		
		testRemoteClassNameEquality: function(){
			var remoteClass = st.Object.newOnServer()._class();
			st.tests.assert(remoteClass.isRemote());
			var objectClass = st.Object;
			st.tests.assert(remoteClass.name()._equals(objectClass.name()));
		},
		
		testRemoteObjectIdentity: function (){
			var remoteObject = st.Object.newOnServer();
			st.tests.assert(remoteObject.yourself()._equals(remoteObject));
		},
		
		testObjectParameter: function (){
			var remoteObject = st.OrderedCollection.newOnServer();
			var newObject = st.Object._new();
			var returnValue = remoteObject.add_(newObject);
			st.tests.assert(returnValue._equals(newObject));
		}

	}

});

st.RemoteObjectTester._newInstance();
