
Assert.orig_isTrue = Assert.isTrue;
Assert.isTrue = function(aBool) { Assert.orig_isTrue(aBool); console.log(aBool); if (!aBool) { console.log(arguments.callee.caller); } };

Class("Tester", {
	instanceMethods: {
	
	instMethod: function() { return "methodRes"; },
	
	// Basic, multiple blocks, instance var
	test1: function() {
		var _block = block(function(){ return 1; });
		Assert.isTrue(_block.value() == 1);
	},
	test2: function() {
		var _block = block(function(){
			var a = "c"; // Random stuff in here
			var _block = 1; // shadow the variable...
			return _block; });
		Assert.isTrue(_block.value() == 1);
	},
	test3: function() {
		var _block = block(function(){
			var inner = block(function(){ return "inner"; });
			return inner.value(); });
		Assert.isTrue(_block.value() == "inner");
	},
	test4: function() {
		var _block = block(function(){
			var inner = block(function(){ 
				var innerinner = block(function(){ return "innerinner"; });
				return innerinner.value(); });
			return inner.value(); });
		Assert.isTrue(_block.value() == "innerinner");
	},
	test5: function() {
		var _block = block(function(){ return this.instVar; });
		Assert.isTrue(_block.value() == "instVar");
	},
	test6: function() {
		var _block = block(function(){ return this.instMethod(); });
		Assert.isTrue(_block.value() == "methodRes");
	},
	
	// Parameters
	test7: function() {
		var _block = block(function(arg1, arg2){ return arg1 + "22"; });
		Assert.isTrue(_block.value_value_("abc", "def") == "abc22");
	},
	test8: function() {
		var _block = block(function(arg1, arg2){
			var inner = block(function(arg1, arg2){
				return arg2 + "d";
			});
			return inner.value_value_(2, arg1);
		});
		Assert.isTrue(_block.value_value_("abc", "def") == "abcd");
	},
	test9: function() {
		var local = "outer";
		var local1 = "outer1";
		var _block = block(function(local1, arg2){ var local = "inner"; return local1 + local; });
		Assert.isTrue(_block.value_value_("abc", "def") == "abcinner");
	},
	
	// non local return
	test10: function() {
		Assert.isTrue(this.helper10() == 2);
	},
	helper10: function() {
		return block(function(){ nonLocalReturn(2); }).value();
	},
	test11: function() {
		Assert.isTrue(this.helper11() == 1);
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
		Assert.isTrue(this.helper12() == 1);
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
		Assert.isTrue(this.helper13() == "instVarmethodRes");
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
		Assert.isFalse(error == "no Error");
		Assert.isTrue(result == "before");
	},
	blockSource: function(){ return block(function() { nonLocalReturn("This should cause an error."); }); },
	test15: function() {
		this.counter = 0;
		this.counterBack = 0;
		Assert.isTrue(this.helper15() == "returned");
		Assert.isTrue(this.counter == 3);
		Assert.isTrue(this.counterBack == 3);
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
		Assert.isTrue(this.counter == 3);
		Assert.isTrue(this.counterBack == 0); // !!
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
		Assert.isTrue(this.counter == 3);
		Assert.isTrue(this.counterBack == 0); // !!
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
		Assert.isTrue(result == 1);
	},
	test19: function() {
		var local = "Lokal";
		var result = (function(){
			var receiver = "Ab";
			receiver = receiver + this.instanceVar;
			return receiver + local;
		}).apply(this);
		Assert.isTrue(result == "AbInsLokal"); // ^^
	},
	test20: function() {
		// Block in cascade
		var result = (function(){
			return block(function(){
				return this.instanceVar;
			}).value();
		}).apply(this);
		Assert.isTrue(result == "Ins");
	},
	test21: function() {
		// Cascade in block
		var result = block(function(){
			(function() {
				return this.instanceVar;
			}).apply(this);
		}).value();
		Assert.isTrue(result == "Ins");
	},
	test22: function() {
		// cascade in Block with arguments
		var lokalouter = "Outer";
		var result = block(function(arg1, arg2){
			var lokal = "Inner";
			(function() {
				return this.instanceVar + arg1 + arg2 + lokal + lokalouter;
			}).apply(this);
		}).value("First", "Second");
		Assert.isTrue(result == "InsFirstSecondInnerOuter");
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
		Assert.isTrue(result == "InsOuterParamInnerParamOuterInner");
	},
	
	test24: function() {
		var _block = block( function() { return this.instVar; } );
		var otherTester = Tester._newInstance();
		otherTester.instVar = "otherInstVar";
		Assert.isTrue("instVar" == otherTester.evaluateBlock(_block));
	},
	evaluateBlock: function(aBlock) {
		return aBlock.value();
	},
	test25: function() {
		var otherTester = Tester._newInstance();
		otherTester.instVar = "otherInstVar";
		var _block = block(function(){
			var inner = block(function(){ 
				var innerinner = block(function(){
				  return this.instVar; });
				return innerinner.value(); });
			return inner.value(); });
		Assert.isTrue("instVar" == otherTester.evaluateBlock(_block));
	},
}});

var tester = function() { 
	var testerInst = Tester._newInstance();
	testerInst.instVar = "instVar";
	testerInst.instanceVar = "Ins";
	testerInst.counter = 0;
	testerInst.counterBack = 0;
	return testerInst;
}

tester().test1();
tester().test2();
tester().test3();
tester().test4();
tester().test5();
tester().test6();
tester().test7();
tester().test8();
tester().test9();
tester().test10();
tester().test11();
tester().test12();
tester().test13();
tester().test14();
tester().test15();
tester().test16();
tester().test17();
tester().test18();
tester().test19();
tester().test20();
tester().test21();
tester().test22();
tester().test23();
tester().test24();
tester().test25();