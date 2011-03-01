
// This scripts uses blocks, which require Squeak-classes
S2JTests.setupSqueakEnvironment();

Class("BlocksTester", { instanceMethods: {
	
	setUp: function() {
		this.instVar = "instVar";
		this.instanceVar = "Ins";
		this.counter = 0;
		this.counterBack = 0;
	},
	
	instMethod: function() { return "methodRes"; },
	
	// Basic, multiple blocks, instance var
	test1: function() {
		var _block = block(function(){ return 1; });
		assert(_block.value() == 1);
	},
	test2: function() {
		var _block = block(function(){
			var a = "c"; // Random stuff in here
			var _block = 1; // shadow the variable...
			return _block; });
		assert(_block.value() == 1);
	},
	test3: function() {
		var _block = block(function(){
			var inner = block(function(){ return "inner"; });
			return inner.value(); });
		assert(_block.value() == "inner");
	},
	test4: function() {
		var _block = block(function(){
			var inner = block(function(){ 
				var innerinner = block(function(){ return "innerinner"; });
				return innerinner.value(); });
			return inner.value(); });
		assert(_block.value() == "innerinner");
	},
	test5: function() {
		var _block = block(function(){ return this.instVar; });
		assert(_block.value() == "instVar");
	},
	test6: function() {
		var _block = block(function(){ return this.instMethod(); });
		assert(_block.value() == "methodRes");
	},
	
	// Parameters
	test7: function() {
		var _block = block(function(arg1, arg2){ return arg1 + "22"; });
		assert(_block.value_value_("abc", "def") == "abc22");
	},
	test8: function() {
		var _block = block(function(arg1, arg2){
			var inner = block(function(arg1, arg2){
				return arg2 + "d";
			});
			return inner.value_value_(2, arg1);
		});
		assert(_block.value_value_("abc", "def") == "abcd");
	},
	test9: function() {
		var local = "outer";
		var local1 = "outer1";
		var _block = block(function(local1, arg2){ var local = "inner"; return local1 + local; });
		assert(_block.value_value_("abc", "def") == "abcinner");
	},
	
	// non local return
	test10: function() {
		assert(this.helper10() == 2);
	},
	helper10: function() {
		return block(function(){ nonLocalReturn(2); }).value();
	},
	test11: function() {
		assert(this.helper11() == 1);
	},
	helper11: function() {
		return block(function(){
			var inner = block(function() {
				return 1;
			});
			nonLocalReturn(inner.value());
			return 100; }).value();
	},
	test12: function() {
		assert(this.helper12() == 1);
	},
	helper12: function() {
		return block(function(){
			var inner = block(function() {
				nonLocalReturn(1);
			});
			inner.value();
			nonLocalReturn(100);
			return 200; }).value();
	},
	test13: function() {
		assert(this.helper13() == "instVarmethodRes");
	},
	helper13: function() {
		return block(function(){ nonLocalReturn(this.instVar + this.instMethod()); }).value();
	},
	test14: function() {
		var _block = this.blockSource();
		var result = "before";
		var error = "no Error";
		try {
			result = _block.value();
		} catch (e) {
			error = e;
		}
		
		assert(error != "no Error");
		assert(result == "before");
	},
	blockSource: function(){ return block(function() { nonLocalReturn("This should cause an error."); }); },
	test15: function() {
		this.counter = 0;
		this.counterBack = 0;
		assert(this.helper15() == "returned");
		assert(this.counter == 3);
		assert(this.counterBack == 3);
	},
	helper15: function() {
		var result = "unreturned";
		block(function(){
			if (this.counter < 3) {
				this.counter++;
				result = this.helper15();
				this.counterBack++;
			} else {
				// Return only from the inner-most invokation
				nonLocalReturn("returned");
		}}).value();
		return result;
	},
	test16: function() {
		this.counter = 0;
		this.counterBack = 0;
		this.helper16();
		assert(this.counter == 3);
		assert(this.counterBack == 0); // !!
	},
	helper16: function() {
		var _block = block(function() { nonLocalReturn("abc"); });
		var result = this.innerhelper16(_block);
		this.counter = 100; // Should also not happen
	},
	innerhelper16: function(aBlock) {
		if (this.counter < 3) {
			this.counter++;
			this.innerhelper16(aBlock);
			counterBack++; // Should not be executed
		} else {
			// Should return from the outer-most context (test16)
			aBlock.value();
		}
	},
	test17: function() {
		this.counter = 0;
		this.counterBack = 0;
		this.helper17();
		assert(this.counter == 3);
		assert(this.counterBack == 0); // !!
	},
	helper17: function() {
		if (this.blockVar == undefined) {
			this.blockVar = block(function() { nonLocalReturn("returning from outer context"); });
		}
		if (this.counter < 3) {
			this.counter++;
			this.helper17();
			this.counterBack++;
		} else {
			this.blockVar.value();
		}
	},
	
	// Cascades
	test18: function() {
		var result = (function(){
			return 1;
		}).apply(this);
		assert(result == 1);
	},
	test19: function() {
		var local = "Lokal";
		var result = (function(){
			var receiver = "Ab";
			receiver = receiver + this.instanceVar;
			return receiver + local;
		}).apply(this);
		assert(result == "AbInsLokal"); // ^^
	},
	test20: function() {
		// Block in cascade
		var result = (function(){
			return block(function(){
				return this.instanceVar;
			}).value();
		}).apply(this);
		assert(result == "Ins");
	},
	test21: function() {
		// Cascade in block
		var result = block(function(){
			return (function() {
				return this.instanceVar;
			}).apply(this);
		}).value();
		assert(result == "Ins");
	},
	test22: function() {
		// cascade in Block with arguments
		var lokalouter = "Outer";
		var result = block(function(arg1, arg2){
			var lokal = "Inner";
			return (function() {
				return this.instanceVar + arg1 + arg2 + lokal + lokalouter;
			}).apply(this);
		}).value("First", "Second");
		assert(result == "InsFirstSecondInnerOuter");
	},
	test23: function() {
		// Block with arguments in cascade
		var outer = "Outer";
		var outerParam = "OuterParam";
		var result = (function(){
			var inner = "Inner";
			var innerParam = "InnerParam";
			return block(function(arg1, arg2){
				return this.instanceVar + arg1 + arg2 + outer + inner;
			}).value(outerParam, innerParam);
		}).apply(this);
		assert(result == "InsOuterParamInnerParamOuterInner");
	},
	
	test24: function() {
		var _block = block( function() { return this.instVar; } );
		var otherTester = BlocksTester._newInstance();
		otherTester.instVar = "otherInstVar";
		assert("instVar" == otherTester.evaluateBlock(_block));
	},
	evaluateBlock: function(aBlock) {
		return aBlock.value();
	},
	test25: function() {
		var otherTester = BlocksTester._newInstance();
		otherTester.instVar = "otherInstVar";
		var _block = block(function(){
			var inner = block(function(){ 
				var innerinner = block(function(){
				  return this.instVar; });
				return innerinner.value(); });
			return inner.value(); });
		assert("instVar" == otherTester.evaluateBlock(_block));
	},
	
	testWhileTrue: function() {
		var result = this._testWhileTrueBlock();
		assert(result == "OKAAY", "Result was: " + result);
	},
	_testWhileTrueBlock: function(blockParameter) {
		var i = 0;
		block(function(){
				i++;
				return bool(i < 10);
			})
			.whileTrue_(block(function(){
				if (i >= 5) { nonLocalReturn("OKAAY"); }
			}));
		return "Sollte nicht";
	},
	
	testErrorWhenClosureIsAlreadyLeft: function() {
		var exception = null;
		try {
			helper_testErrorWhenClosureIsAlreadyLeft().value();
		} catch (e) {
			exception = e;
		}
		assert(exception != null);
	},
	helper_testErrorWhenClosureIsAlreadyLeft: function() {
		return block(function(){ nonLocalReturn("This should throw error"); });
	}
	
	
}});

BlocksTester._newInstance();
