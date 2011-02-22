
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
			assert(this.$anArray.js()[0] == [1, 2, 3][0]);
			assert(this.$anArray.js()[1] == [1, 2, 3][1]);
			assert(this.$anArray.js()[2] == [1, 2, 3][2]);
			assertRaisesError_(function (){this.$anObject.js()});
		},
		
		testFloatLoop: function (){
			var count = 0;
			this.$aFloat.timesRepeat_(block(function (){ count++; }));
			assert(count == 5);
		},
		
		testPointTimes: function (){
			var point = Point.x_y_(number(3), number(2));
			var anotherPoint = point._times(number(5));
			assert(anotherPoint.x().js() == 15);
			assert(anotherPoint.y().js() == 10);
		},
		
		testArray: function (){
			assert(this.$anArray.size().js() == 3);
			assert(this.$anArray.at_(number(1)) == 1);
			this.$anArray.at_put_(number(2), number(4));
			assert(this.$anArray.at_(number(2))._equals(number(4)));
			assert(this.$anArray.isEmpty().js() === false);
		},
		testArrayIncludes: function(){
		  assert(array([number(1), number(2)]).includes_(number(1)).js(), "Array.includes: does not work as expected");
		}
	}
	
});

PrimitivesTester._newInstance();
