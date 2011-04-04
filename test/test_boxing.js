
// This scripts uses blocks, which require Squeak-classes
S2JTests.setupSqueakEnvironment();

// Make sure, the slots a and b are handled by doesNotUnderstand_. Add the slot-accessors.
// Enables to test the _Box-code (as it relies on doesNotUnderstand_ working).
// This simulates, that these 4 methods exist in the squeak-image.
_DoesNotUnderstandClass_._addInstanceMethods({
	a: function(){
        return this.doesNotUnderstand_(Message.selector_arguments_(string("a"), array(_toArray(arguments)))); },
	a_: function(){
        return this.doesNotUnderstand_(Message.selector_arguments_(string("a:"), array(_toArray(arguments)))); },
	b: function(){
        return this.doesNotUnderstand_(Message.selector_arguments_(string("b"), array(_toArray(arguments)))); },
	b_: function(){
        return this.doesNotUnderstand_(Message.selector_arguments_(string("b:"), array(_toArray(arguments)))); }
});

Class("BoxingTester", { instanceMethods: {
	
	testNativeFunctionBoundBlock: function() {
		var box = object( { a: 23, b: function(){ return this.a; } } );
		assert( box.b().value()._equals(number(23)) == _true);
	},
	
	testNativeFunctionBoundBlockTwoObjects: function() {
		var b1 = object({ a: 24, b: undefined });
		var b2 = object({ a: 25, b: undefined });
		
		b1.b_(block(function() { b1.a_(string('twentyfour')) } ));
		b2.b_(b1.b());
		b2.b().value();
		assert(b1.a()._equals(string('twentyfour')) == _true);
		assert(b2.a()._equals(number(25)) == _true);
	}
	
}});

BoxingTester._newInstance();
