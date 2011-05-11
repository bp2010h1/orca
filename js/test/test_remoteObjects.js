
st.tests.addDoesNotUnderstandMethods(["new", "environment", "runTests"], ["new", "environment", "runTests"]);

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
		
		testNewOnServerWithNotTranslatedButReferredClasses: function (){
			// assumes that OMeta2Base is not translated
			if (st.OMeta2Base === undefined) {
					// setup but only for this test case
					st.__defineGetter__("OMeta2Base", function() {
						return st.ILLEGAL_GLOBAL_HANDLER("OMeta2Base");
					});
																										
					var referredClass = st.OMeta2Base;
					st.tests.assert(referredClass.isReferredClass() === st.true);
          
					var remoteClass = referredClass.asRemote();
					st.tests.assert(remoteClass.isRemote() === st.true);
					
					var className = remoteClass.name();
					st.tests.assert(st.unbox(className) === "OMeta2Base");
          
					var remoteInstance = referredClass.newOnServer();
					st.tests.assert(remoteInstance.isRemote() === st.true);
			}
		},
		
		testServerSide: function (){
			var remoteTestCase = st.OrcaRemoteObjectsServerSideTest.newOnServer();
			if (!remoteTestCase.runTests()._unbox()){
				st.tests.assert(false, "The Tests of OrcaRemoteObjectsServerSideTest are not green.");
			}
		}		

	}

});

st.RemoteObjectTester._newInstance();
