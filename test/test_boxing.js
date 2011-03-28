
// This scripts uses blocks, which require Squeak-classes
S2JTests.setupSqueakEnvironment();

Class("BoxingTester", { instanceMethods: {
	
	setUp: function() {
		this.instVar = "instVar";
		this.instanceVar = "Ins";
		this.counter = 0;
		this.counterBack = 0;
	},
	
	instMethod: function() { return "methodRes"; },
	
	testNativeFunctionBoundBlock: function() {
		var nativeObject = { a: 23, f: function(){ return this.a; } };
	  var box = S2JBox.on_( nativeObject );
	  assert( box.f().value()._equals(number(23)) == _true);
	},
	
	testNativeFunctionBoundBlockTwoObjects: function() {
		var n1 = { a: 24, onChange: undefined };
		var n2 = { a: 25, onChange: undefined };
		var b1 = S2JBox.on_(n1);
		var b2 = S2JBox.on_(n2);
		// b1 onChange: [ b1 a: 'twentyfour' ]
		b1.onChange_(block(function() { b1.a_(string('twentyfour')) } ));
		// b2 onChange: b1 onChange
		b2.onChange_(b1.onChange());
		b2.onChange().value();
		assert(b1.a()._equals(string('twentyfour')) == _true);
		assert(b2.a()._equals(number(25)) == _true);
	},
	
	
}});

BoxingTester._newInstance();