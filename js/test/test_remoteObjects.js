
st.klass("RemoteObjectTester", { 

	superclass: st.Object,
	classInstanceVariables: [ ],
	instanceVariables: [ ],

	instanceMethods: {
		
		testNewOnServer: function(){
			var remoteObject = st.Object.newOnServer();
			st.tests.assert(remoteObject.isRemote() === st.true, "Object created through st.Object.newOnServer() is not remote.");
			st.tests.assert((typeof remoteObject._remoteID) === "number", "Returned RemoteID for the created RemoteObject is not a number.");
		},
		
		testAsRemote: function(){
			var remoteObject = st.Object.asRemote();
			st.tests.assert(remoteObject.isRemote() === st.true, "Object created through st.Object.asRemote() is not remote.");
			st.tests.assert((typeof remoteObject._remoteID) === "number", "Returned RemoteID for the created RemoteObject is not a number.");
		},
		
		testAsRemoteIsBehavior: function(){
			var remoteObject = st.Object.asRemote();
			st.tests.assert(remoteObject.isBehavior() === st.true);
		},

		testAsRemoteInstanceIsRemoteToo: function(){
			var remoteObject = st.Object.asRemote();
			var remoteInstance = remoteObject.new();
			st.tests.assert(remoteInstance.isRemote() === st.true);
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
		
		testRemoteObjectIdentity: function(){
			var remoteObject = st.Object.newOnServer();
			st.tests.assert(remoteObject.yourself()._equals(remoteObject));
		},
		
		testObjectParameter: function(){
			var remoteObject = st.OrderedCollection.newOnServer();
			var newObject = st.Object._new();
			var returnValue = remoteObject.add_(newObject);
			st.tests.assert(returnValue._equals(newObject));
		},
		
		// testObjectParameter2: function(){
		// 	// Set's add checks whether that object is already in the collection and calls the object's hash therefore...
		// 	// cross message sends!
		// 	// TODO: find a minimal example
		// 	var remoteObject = st.OrderedCollection.newOnServer();
		// 	var firstObject = st.Object._new();
		// 	var secondObject = st.Object._new();
		// 	remoteObject.add_(firstObject);
		// 	var returnValue = remoteObject.includes_(secondObject);
		// 	st.tests.assert(returnValue._equals(secondObject));
		// }

	}

});

st.RemoteObjectTester._newInstance();
