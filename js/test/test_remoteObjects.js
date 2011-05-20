
st.tests.addDoesNotUnderstandMethods(["new", "environment", "runTests", "test_"], ["new", "environment", "runTests", "test:"]);

st.klass("RemoteObjectTester", { 

	classInstanceVariables: [ ],
	instanceVariables: [ ],

	instanceMethods: {
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
			var remoteInstance = st.Object.asRemote().new();
			st.tests.assert(remoteInstance.isNil() === st.false, ">>isNil as unary message to a remoteObject of Object did not return false.");
		},
		
		testBinaryMessage: function(){
			var remoteInstance = st.Float.asRemote().new(); //float get initialized to 2.2...
			st.tests.assert(remoteInstance._less(st.number(3)));
		},
		
		testKeywordMessage: function(){
			var remoteInstance = st.OrderedCollection.asRemote().new();
			var addedValue = remoteInstance.add_(st.number(1));
			st.tests.assert(addedValue._equals(st.number(1)));
			st.tests.assert(remoteInstance.first()._equals(st.number(1)));
		},

		testRemoteSymbol: function(){
			var remoteInstance = st.Object.asRemote().new();
			var remoteObjectClass = remoteInstance._class();
			st.tests.assert(remoteObjectClass.isRemote());
			var remoteObjectClassName = remoteObjectClass.name();
			st.tests.assert(remoteObjectClassName.isRemote() === st.false, "Symbols are no RemoteObjects (yet)");
			st.tests.assert(remoteObjectClassName._equals(st.string("Object")));
		},
		
		testRemoteObjectIdentity: function(){
			var remoteInstance = st.Object.asRemote().new();
			st.tests.assert(remoteInstance.yourself()._equals(remoteInstance));
		},
		
		testObjectParameter: function() {
			var remoteInstance = st.OrderedCollection.asRemote().new();
			var newObject = st.Object._newInstance();
			var returnValue = remoteInstance.add_(newObject);
			st.tests.assert(returnValue._equals(newObject));
		},
		
		testRemoteNewWithNotTranslatedButReferredClasses: function(){
			// test purpose: a not translated, but referred class should allow to create remote-objects as well
			// assumes that OMeta2Base is not translated
			if (st.OMeta2Base === undefined) {
					// setup but only for this test case
					// OMeta2Base is not translated and not in referred classes: so we handle it as we handle referred classes
					st.__defineGetter__("OMeta2Base", function() {
						return st.ILLEGAL_GLOBAL_HANDLER("OMeta2Base");
					});
					
					var referredClass = st.OMeta2Base;
					st.tests.assert(referredClass.isReferredClass() === st.true);
					
					var remoteClass = referredClass.asRemote();
					st.tests.assert(remoteClass.isRemote() === st.true);
					
					var className = remoteClass.name();
					st.tests.assert(st.unbox(className) === "OMeta2Base");
			}
		},
		
		testRemoteSendTriggersRemoteSendOnServer: function() {
			// setup but only for this test case, since OrcaRemoteTestObject might not be in referred classes
			st.__defineGetter__("OrcaRemoteTestObject", function() {
				return st.ILLEGAL_GLOBAL_HANDLER("OrcaRemoteTestObject");
			});
			var remoteObject = st.OrcaRemoteTestObject.asRemote();
			var localObject = st.Object._new();
			// remoteObject>>#test: aRemoteObject itself sends a remote message to the given object
			var answer = remoteObject.test_(localObject);
			st.tests.assert(answer === st.false);
		},
		
		testServerSide: function(){
			var remoteTestCase = st.OrcaRemoteObjectsServerSideTest.asRemote().new();
			if (!remoteTestCase.runTests()._unbox()){
				st.tests.assert(false, "The Tests of OrcaRemoteObjectsServerSideTest are not green.");
			}
		}

	}

});

st.RemoteObjectTester._newInstance();
