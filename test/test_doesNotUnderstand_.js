// Here, we test the doesNotUnderstandSends

S2JTests.setupSqueakEnvironment();

Class("DoesNotUnderstandTester", { 
	superclass: _Object,
	classInstanceVariables: [ ],
	instanceVariables: [ "lastDoesNotUnderstand", "lastArguments" ],
	
	instanceMethods: {
		
		setUp: function(){
			this.$lastDoesNotUnderstand = "";
			this.$lastArguments = "";
		},
		
		testdoesNotUnderstand: function (){
			this.ifTrue_();
			assert(_unboxObject(this.$lastDoesNotUnderstand._equals(string("ifTrue_")).not()), 
				"Although we are within the JavaScriptWorld, the doesNotUnderstand comes from Smalltalk and therefore, the symbol should be the Smalltalk selector-Name.");
			assert(_unboxObject(this.$lastDoesNotUnderstand._equals(string("ifTrue:"))));
		},
		
		testPerform: function (){
			this.perform_(string("thisTest"));
			assert(_unboxObject(this.$lastDoesNotUnderstand._equals(string("thisTest"))));
		},

		testPerformWith: function (){
			this.perform_with_(string("thisTest_"), string("thisTest"));
			assert(_unboxObject(this.$lastDoesNotUnderstand._equals(string("thisTest_"))));
			assert(_unboxObject(this.$lastArguments.at_(number(1))._equals(string("thisTest"))), "Arguments are not transfered correctly.");
		},
		
		testPerformReturnValue: function (){
			assert(_unboxObject(this.perform_(string("aTestMethod"))) == 2);
		},
		aTestMethod: function (){
			return number(2);
		},

		testSelectorTranslation: function (){
			this.perform_(string("aSecondTestMethod:"), number(1));
			assert(this.$lastDoesNotUnderstand.isNil() === "");
		},
		
		testPerformDynamicReturnValue: function (){
			assert(_unboxObject(this.perform_with_(string("aSecondTestMethod:"), number(4))) == 4);
			
		},
		aSecondTestMethod_: function (anObject){
			return anObject;
		},

		
		doesNotUnderstand_: function (aMessage){
			this.$lastDoesNotUnderstand = aMessage.selector();
			this.$lastArguments = aMessage._arguments();
		}
	}
	
});

DoesNotUnderstandTester._newInstance();
