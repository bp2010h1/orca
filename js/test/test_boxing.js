
// Make sure, the slots a and b are handled by doesNotUnderstand_. Add the slot-accessors.
// Enables to test the OrcaBox-code (as it relies on doesNotUnderstand_ working).
// This simulates, that these 4 methods exist in the squeak-image.
st.doesNotUnderstandClass._addInstanceMethods({
	a: function(){
        return this.doesNotUnderstand_(st.Message.selector_arguments_(st.string("a"), st.array(st.toArray(arguments)))); },
	a_: function(){
        return this.doesNotUnderstand_(st.Message.selector_arguments_(st.string("a:"), st.array(st.toArray(arguments)))); },
	b: function(){
        return this.doesNotUnderstand_(st.Message.selector_arguments_(st.string("b"), st.array(st.toArray(arguments)))); },
	b_: function(){
        return this.doesNotUnderstand_(st.Message.selector_arguments_(st.string("b:"), st.array(st.toArray(arguments)))); }
});

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
	}
	
}});

st.BoxingTester._newInstance();
