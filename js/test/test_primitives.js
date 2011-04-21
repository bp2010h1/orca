
// This test is meant to execute the primitives shipped with classes.js
// Therefore it needs the Squeak-Classes salted with these primitives and the Primitives itself:
st.tests.setupSqueakEnvironment();

// downside of these tests is that once the primitives change, these tests have to be updated

st.class("PrimitivesTester", { 
	
	classInstanceVariables: [ ],
	instanceVariables: [ "anObject", "aNumber", "aString", "aFloat", "anArray" ],
	
	instanceMethods: {
		
		setUp: function(){
			this.anObject = st.Object._new();
			this.aNumber =st.number(1);
			this.aString = st.string("Hello World!");
			this.aFloat =st.number(4.2);
			this.anArray = st.array([1, 2, 3]);
		},
		
		testJsFunctions: function(){
			st.tests.assertEquals(this.aNumber._original, 1);
			st.tests.assertEquals(this.aString._original, "Hello World!");
			st.tests.assertEquals(this.aFloat._original, 4.2);
			
			var arr = this.anArray._original;
			var arr2 = [1, 2, 3];
			for (index in arr) {
				st.tests.assertEquals(arr[index], arr2[index]);
			}
		},
		
		testFloatLoop: function (){
			var count = 0;
			this.aFloat.timesRepeat_(st.block(function (){ count++; }));
			st.tests.assert(count == 5);
		},
		
		testFloatRoundTo: function (){
			st.tests.assertEquals(this.aFloat.roundTo_(st.number(1)), 4);
			st.tests.assertEquals(this.aFloat.roundTo_(st.number(0.1)), 4.2);
			st.tests.assertEquals(this.aFloat.roundTo_(st.number(0.01)), 4.20);
			st.tests.assertEquals(this.aFloat.roundTo_(st.number(0.4)), 4.4);
			st.tests.assertEquals(this.aFloat.roundTo_(st.number(0.10)), 4.20);
			st.tests.assertEquals(this.aFloat.roundTo_(st.number(-1)), 4);
		},
		
		testPointTimes: function (){
			var point = st.Point.x_y_(st.number(3),st.number(2));
			var anotherPoint = point._times(st.number(5));
			st.tests.assertEquals(anotherPoint.x(), 15);
			st.tests.assertEquals(anotherPoint.y(), 10);
		},
		
		testArray: function (){
			st.tests.assertEquals(this.anArray.size(), 3, "1");
			st.tests.assertEquals(this.anArray.at_(st.number(1)), 1, "2");
			this.anArray.at_put_(st.number(2),st.number(4), "3");
			st.tests.assertEquals(this.anArray.at_(st.number(2)), 4, "4");
			st.tests.assertEquals(this.anArray.isEmpty(), false, "5");
		},
		testArrayIncludes: function(){
			st.tests.assert(st.array([st.number(1),st.number(2)]).includes_(st.number(1)) == st.true, "Array.includes: does not work as expected");
		},
		
		testArrayJs: function (){
			var testArray = st.array(["a", 1, [2]]);
			st.tests.assertEquals(testArray.at_(st.number(1)), "a");
			st.tests.assertEquals(testArray.at_(st.number(2)), 1);
			st.tests.assertEquals(testArray.at_(st.number(3)).first(), 2);
		},
		
		testBlockPrimitives: function (){
			var func = st.block(function(a, b) {
				if ( !a )
					// boxed!
					return st.string("abc");
				if( !b )
					return a;
				return b;
			});
			this.blockPrimitivesImpl(func);
		},
		testBlockPrimitivesOnLibraryfunction: function() {
			var func = st.object({x : function(a, b) {
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
			st.tests.assert(func.value()._original == "abc", "Calling a BlockClosure with value.");
			st.tests.assert(func.value_(st.number(1))._original == 1, "Calling a BlockClosure with value_.");
			st.tests.assert(func.value_value_(st.number(1),st.number(2))._original == 2, "Calling a BlockClosure with value_value_.");
			st.tests.assert(func.valueWithArguments_(st.array([st.number(1)]))._original == 1, "Calling a BlockClosure with valueWithArguments. 1");
			st.tests.assert(func.valueWithArguments_(st.array([st.number(1),st.number(2)]))._original == 2, "Calling a BlockClosure with valueWithArguments. 2");
		},
		
		testJsNewPrimitives: function() {
			// normal Squeak-block, called jsNew on
			var f = st.block(function(b) {
				// boxed!
				this.a = st.string("a");
				this.b = b;
			});
			this.jsNewPrimitivesImpl(f);
		},
		testJsNewPrimitivesOnLibraryfunction: function() {
			// library function, boxed as block upon entering the Squeak-system (being extracted from the object)
			var f = st.object({x : function(b) {
				// unboxed!
				this.a = "a";
				this.b = b;
			}}).x();
			this.jsNewPrimitivesImpl(f);
		},
		jsNewPrimitivesImpl: function(block) {
			// Here are just basic checks for jsNew-functionality. Extended tests regarding boxing are done elsewhere.
			st.tests.assert(block.jsNew()._original.a == "a", "jsNew() on BlockClosure. 1");
			st.tests.assert(block.jsNew()._original.b == undefined, "jsNew() on BlockClosure. 2");
			
			var b = block.jsNew_("b");
			st.tests.assert(b._original.a == "a" && b._original.b == "b", "jsNew_() on BlockClosure");
			
			b = block.jsNewWithArgs_(["b"]);
			st.tests.assert(b._original.a == "a" && b._original.b == "b", "jsNewWithArgs_() on BlockClosure");
		}
		
	}
	
});

st.PrimitivesTester._newInstance();
