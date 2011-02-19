
// This test is meant to execute the primitives shipped with squeakyJs
// Therefore it needs the Squeak-Classes salted with these primitives and the Primitives itself:
S2JTests.setupSqueakEnvironment();

//downside of these tests is that once the primitives change, these tests have to be updated

Class("PrimitivesTester", { 
	
	classInstanceVariables: [ ],
	instanceVariables: [ "anObject", "aNumber", "aString", "aFloat", "anArray" ],
	
	instanceMethods: {
		
		setUp: function(){
			this.$anObject = _Object._new();
			this.$aNumber = number(1);
			this.$aString = string("Hello World!");
			this.$aFloat = number(4.2);
			this.$anArray = array([1, 2, 3]);
		},
		
		testJsFunctions: function(){
			assert(this.$aNumber.js() == 1);
			assert(this.$aString.js() == "Hello World!");
			assert(this.$aFloat.js() == 4.2);
			assert(this.$anArray.js() == [1, 2, 3]);
			assertRaisesError_(function (){this.$anObject.js()});
		},
		
	}
	
});

PrimitivesTester._newInstance();
