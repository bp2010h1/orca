
// a test for each class where store-string has been tested

st.klass("StoreStringTester", { 
	
	classInstanceVariables: [ ],
	instanceVariables: [ ],
	
	instanceMethods: {
		
		setUp: function(){
		},
		
		testObjectStoreString: function (){
			var storeString = st.Object._new().storeString();
			st.tests.assert(st.unbox(storeString) === "(Object basicNew yourself)");
		},
		testIntegerStoreString: function (){
			var storeString = st.number(1).storeString();
			st.tests.assert(st.unbox(storeString) === "1");
		},
		testPointStoreString: function (){
			var storeString = st.number(1)._at(st.number(2)).storeString();
			st.tests.assert(st.unbox(storeString) === "(1@2)");
		},
		testArrayStoreString: function (){
			var storeString = st.array([st.number(1), st.number(2)]).storeString();
			st.tests.assert(st.unbox(storeString) === "#(1 2 )");
		},
		testStringStoreString: function (){
			var storeString = st.string("testCase").storeString();
			st.tests.assert(st.unbox(storeString) === "'testCase'");
		},
		testResultStoreString: function (){
			debugger;
			var storeString = st.TestResult._new().storeString();
			st.tests.assert(st.unbox(storeString) === "(TestResult basicNew instVarAt: 1 put: ''24 May 2011 11:05:05 am'' asTimeStamp; instVarAt: 2 put: ((Set new)); instVarAt: 3 put: ((OrderedCollection new)); instVarAt: 4 put: ((OrderedCollection new)); yourself)");
		},
		
	}
});

st.StoreStringTester._newInstance();

