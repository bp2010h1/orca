
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
			assertEquals_(this.$aNumber, 1);
			assertEquals_(this.$aString, "Hello World!");
			assertEquals_(this.$aFloat, 4.2);
      // assertEquals_(this.$anArray, [1, 2, 3]);
      assertRaisesError_(function (){_unboxObject(this.$anObject); });
		},
		
		testFloatLoop: function (){
			var count = 0;
			this.$aFloat.timesRepeat_(block(function (){ count++; }));
			assert(count == 5);
		},
		
		testFloatRoundTo: function (){
			assertEquals_(this.$aFloat.roundTo_(number(1)), 4);
			assertEquals_(this.$aFloat.roundTo_(number(0.1)), 4.2);
			assertEquals_(this.$aFloat.roundTo_(number(0.01)), 4.20);
			assertEquals_(this.$aFloat.roundTo_(number(0.4)), 4.4);
			assertEquals_(this.$aFloat.roundTo_(number(0.10)), 4.20);
			assertEquals_(this.$aFloat.roundTo_(number(-1)), 4);
		},
		
		testPointTimes: function (){
			var point = Point.x_y_(number(3), number(2));
			var anotherPoint = point._times(number(5));
			assertEquals_(anotherPoint.x(), 15);
			assertEquals_(anotherPoint.y(), 10);
		},
		
		testArray: function (){
			assertEquals_(this.$anArray.size(), 3, "1");
			assertEquals_(this.$anArray.at_(number(1)), 1, "2");
			this.$anArray.at_put_(number(2), number(4), "3");
			assertEquals_(this.$anArray.at_(number(2)), 4, "4");
			assertEquals_(this.$anArray.isEmpty(), false, "5");
		},
		testArrayIncludes: function(){
		  assert(array([number(1), number(2)]).includes_(number(1)) == _true, "Array.includes: does not work as expected");
		},
		
		testArrayJs: function (){
			var testArray = array([string("a"), number(1), array([number(2)])]);
			assert(testArray.js()[0] == "a", "Array doesn't unpack it's element when converted to JS-Array, 1");
			assert(testArray.js()[1] == 1, "Array doesn't unpack it's element when converted to JS-Array, 2");
			assert(testArray.js()[2][0] == 2, "Array doesn't unpack it's element when converted to JS-Array, 3");
			assert(testArray.js()[2].length == 1, "Array doesn't unpack it's element when converted to JS-Array, 4");
		},
		
		testFunctionPrimitives: function (){
			var func = function (){ return "1"; };
			assert(func.value() == "1", "Calling Js functions like a BlockClosure with value.");
			func = function(a, b){ if( !b ){ return a; } return b; };
			assert(func.value_(number(1)) == 1, "Calling Js functions like a BlockClosure with value_." + func(number(1)));
			assert(func.value_value_(number(1), number(2)) == 2, "Calling Js functions like a BlockClosure with value_value_.");
			assert(func.valueWithArguments_(array([number(1)])) == 1, "Calling Js functions like a BlockClosure with valueWithArguments. 1");
			assert(func.valueWithArguments_(array([number(1), number(2)])) == 2, "Calling Js functions like a BlockClosure with valueWithArguments. 2");
		}
	}
	
});

PrimitivesTester._newInstance();
