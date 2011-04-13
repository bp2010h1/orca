// Here, we test the doesNotUnderstandSends

st.tests.setupSqueakEnvironment();

st.class("DoesNotUnderstandTester", { 

	superclass: st.Object,
	classInstanceVariables: [ ],
	instanceVariables: [ "lastDoesNotUnderstand", "lastArguments" ],

	instanceMethods: {
		
		setUp: function(){
			this.lastDoesNotUnderstand = "";
			this.lastArguments = "";
		},
		
		testdoesNotUnderstand: function (){
			this.ifTrue_();
			st.tests.assert(st.unbox(this.lastDoesNotUnderstand._equals(st.string("ifTrue_")).not()), 
				"Although we are within the JavaScriptWorld, the doesNotUnderstand comes from Smalltalk and therefore, the symbol should be the Smalltalk selector-Name.");
			st.tests.assert(st.unbox(this.lastDoesNotUnderstand._equals(st.string("ifTrue:"))));
		},
		
		testPerform: function (){
			this.perform_(st.string("thisTest"));
			st.tests.assert(st.unbox(this.lastDoesNotUnderstand._equals(st.string("thisTest"))));
		},

		testPerformWith: function (){
			this.perform_with_(st.string("thisTest_"), st.string("thisTest"));
			st.tests.assert(st.unbox(this.lastDoesNotUnderstand._equals(st.string("thisTest_"))));
			st.tests.assert(st.unbox(this.lastArguments.at_(st.number(1))._equals(st.string("thisTest"))), "Arguments are not transfered correctly.");
		},

		testPerformReturnValue: function (){
			st.tests.assert(st.unbox(this.perform_(st.string("aTestMethod"))) == 2);
		},
		aTestMethod: function (){
			return st.number(2);
		},

		testSelectorTranslation: function (){
			this.perform_(st.string("aSecondTestMethod:"), st.number(1));
			st.tests.assert(this.lastDoesNotUnderstand === "");
		},

		testPerformDynamicReturnValue: function (){
			st.tests.assert(st.unbox(this.perform_with_(st.string("aSecondTestMethod:"),st.number(4))) == 4);
			
		},
		aSecondTestMethod_: function (anObject){
			return anObject;
		},

		doesNotUnderstand_: function (aMessage){
			this.lastDoesNotUnderstand = aMessage.selector();
			this.lastArguments = aMessage._arguments();
		}
	}
	
});

st.DoesNotUnderstandTester._newInstance();
