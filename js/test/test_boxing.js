
// Make sure, the slots a and b are handled by doesNotUnderstand_. Add the slot-accessors.
// Enables to test the OrcaBox-code (as it relies on doesNotUnderstand_ working).
// This simulates, that these 4 methods exist in the squeak-image.

st.tests.addDoesNotUnderstandMethods(["a", "a_", "b", "b_"], ["a", "a:", "b", "b:"]);

st.klass("BoxingTester", { instanceMethods: {
	
	testNativeFunctionBoundBlock: function() {
		var box = st.object( { a: 23, b: function(){ return this.a; } } );
		st.tests.assert( box.b().value()._equals(st.number(23)) == st.true);
	},
	
	testNativeFunctionBoundBlockTwoObjects: function() {
		var b1 = st.object({ a: 24, b: undefined });
		var b2 = st.object({ a: 25, b: undefined });
		
		b1.b_(st.block(function() { b1.a_(st.string('twentyfour')) } ));
		b2.b_(b1.b());
		b2.b().value();
		st.tests.assert(b1.a()._equals(st.string('twentyfour')) == st.true);
		st.tests.assert(b2.a()._equals(st.number(25)) == st.true);
	},
	
	testCanonicalization: function() {
		st.tests.assert(st.number(123123) === st.number(123123), "Equal Numbers are different instances!");
		//st.tests.assert(st.string("123123") === st.string("123123"), "Equal Strings are different instances!");
		st.tests.assert(st.character("1") === st.character("1"), "Equal characters are different instances!");
	},
	
	testCanonicalization2: function() {
		st.tests.assert(st.number(123123) !== st.number(123124), "Different Numbers are same instances!");
		st.tests.assert(st.string("123123") !== st.number("123124"), "Different Strings are same instances!");
		st.tests.assert(st.character("1") !== st.character("2"), "Different characters are same instances!");
		st.tests.assert(st.character("1") !== st.number("1"), "Characters and Numbers are equal instances!");
	}
	
}});

st.BoxingTester._newInstance();
