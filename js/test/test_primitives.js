
// This test is meant to execute the primitives shipped with squeakyJs
// Therefore it needs the Squeak-Classes salted with these primitives and the Primitives itself:
OrcaTests.setupSqueakEnvironment();

//downside of these tests is that once the primitives change, these tests have to be updated

st.class("PrimitivesTester", { 
	
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
			assertEquals_(this.$aNumber.original$, 1);
			assertEquals_(this.$aString.original$, "Hello World!");
			assertEquals_(this.$aFloat.original$, 4.2);
			
			var arr = this.$anArray.original$;
			var arr2 = [1, 2, 3];
			for (index in arr) {
				assertEquals_(arr[index], arr2[index]);
			}
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
			var testArray = array(["a", 1, [2]]);
			assertEquals_(testArray.at_(number(1)), "a");
			assertEquals_(testArray.at_(number(2)), 1);
			assertEquals_(testArray.at_(number(3)).first(), 2);
		},
		
		testBlockPrimitives: function (){
			var func = block(function(a, b) {
				if ( !a )
					// boxed!
					return string("abc");
				if( !b )
					return a;
				return b;
			});
			this.blockPrimitivesImpl(func);
		},
		testBlockPrimitivesOnLibraryfunction: function() {
			var func = object({x : function(a, b) {
				if ( !a )
					// unboxed!
					return "abc";
				if( !b )
					return a;
				return b;
			}}).x();
			this.blockPrimitivesImpl(func);
		},
		blockPrimitivesImpl: function(func) {
			assert(func.value().original$ == "abc", "Calling a BlockClosure with value.");
			assert(func.value_(number(1)).original$ == 1, "Calling a BlockClosure with value_.");
			assert(func.value_value_(number(1), number(2)).original$ == 2, "Calling a BlockClosure with value_value_.");
			assert(func.valueWithArguments_(array([number(1)])).original$ == 1, "Calling a BlockClosure with valueWithArguments. 1");
			assert(func.valueWithArguments_(array([number(1), number(2)])).original$ == 2, "Calling a BlockClosure with valueWithArguments. 2");
		},
		
		testJsNewPrimitives: function() {
			// normal Squeak-block, called jsNew on
			var f = block(function(b) {
				// boxed!
				this.a = string("a");
				this.b = b;
			});
			this.jsNewPrimitivesImpl(f);
		},
		testJsNewPrimitivesOnLibraryfunction: function() {
			// library function, boxed as block upon entering the Squeak-system (being extracted from the object)
			var f = object({x : function(b) {
				// unboxed!
				this.a = "a";
				this.b = b;
			}}).x();
			this.jsNewPrimitivesImpl(f);
		},
		jsNewPrimitivesImpl: function(block) {
			// Here are just basic checks for jsNew-functionality. Extended tests regarding boxing are done elsewhere.
			assert(block.jsNew().original$.a == "a", "jsNew() on BlockClosure. 1");
			assert(block.jsNew().original$.b == undefined, "jsNew() on BlockClosure. 2");
			
			var b = block.jsNew_("b");
			assert(b.original$.a == "a" && b.original$.b == "b", "jsNew_() on BlockClosure");
			
			b = block.jsNewWithArgs_(["b"]);
			assert(b.original$.a == "a" && b.original$.b == "b", "jsNewWithArgs_() on BlockClosure");
		}
		
	}
	
});

PrimitivesTester._newInstance();
