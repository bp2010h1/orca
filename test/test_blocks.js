
Class("Tester", {
	instanceMethods: {
	
	// Basic, multiple blocks, instance var
	test1: function() {
		var _block = block(function(){ return 1; });
		Assert.isTrue(_block.value() == 1);
	},
	test2: function() {
		var _block = block(function(){
			var a = v; // Random stuff in here
			var _block = 1;
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
	test41: function() {
		var _block = block(function(){ return this.instVar; });
		Assert.isTrue(_block.value() == "instVar");
	},
	test42: function() {
		var _block = block(function(){ return this.instMethod(); });
		Assert.isTrue(_block.value() == "methodRes");
	},
	
	// Parameters
	test5: function() {
		var _block = block(function(arg1, arg2){ return arg1 + "22"; });
		Assert.isTrue(_block.value_value_("abc", "def") == "abc22");
	},
	test6: function() {
		var _block = block(function(arg1, arg2){
			var inner = _block(function(arg1, arg2){
				return arg2 + "d";
			});
			return inner.value_value_(2, arg1);
		});
		Assert.isTrue(block.value_value_("abc", "def") == "abcd");
	},
	test5: function() {
		var local = "outer";
		var local1 = "outer1";
		var _block = block(function(local1, arg2){ var local = "inner"; return local1 + local; });
		Assert.isTrue(_block.value_value_("abc", "def") == "abcinner");
	},
	
	// non local return
	test7: function() {
		var _block = block(function(){ nonLocalReturn(2); });
		Assert.isTrue(_block.value() == 2);
	},
	test8: function() {
		var _block = block(function(){
			var inner = _block(function() {
				return 1;
			});
			nonLocalReturn(inner.value()); });
		Assert.isTrue(_block.value() == 1);
	},
	test9: function() {
		var _block = block(function(){
			var inner = block(function() {
				nonLocalReturn(1);
			});
			nonLocalReturn(inner.value()); });
		Assert.isTrue(_block.value() == 1);
	},
	test10: function() {
		var _block = block(function(){ nonLocalReturn(this.instVar + this.instMethod()); });
		Assert.isTrue(_block.value() == "instVarmethodRes");
	},
	test11: function() {
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
	test111: function() {
		if (this.counter < 3) {
			this.counter++;
			this.test111();
			this.counterBack++;
		} else {
			// Return only from the inner-most invokation
			nonLocalReturn("returned");
		}
		Assert.isTrue(this.counter == 3);
		Assert.isTrue(this.counterBack == 3);
	},
	test112: function() {
		this.counter = 0;
		this.counterBack = 0;
		this.blockEvaluater();
		Assert.isTrue(this.counter == 3);
		Assert.isTrue(this.counterBack == 0); // !!
	},
	blockEvaluater: function() {
		var _block = block(function() { nonLocalLeturn("abc"); });
		var result = this.innerBlockEvaluater(_block);
		this.counter = 100; // Should also not happen
	},
	innerBlockEvaluater: function(aBlock) {
		if (this.counter < 3) {
			this.counter++;
			this.innerBlockEvaluater(aBlock);
			counterBack++; // Should not be executed
		} else {
			// Should return from the outer-most context (test112)
			aBlock.value();
		}
	},
	test113: function() {
		this.counter = 0;
		this.counterBack = 0;
		blockHelper();
		Assert.isTrue(this.counter == 3);
		Assert.isTrue(this.counterBack == 0); // !!
	},
	blockHelper: function() {
		if (this.blockVar == undefined) {
			this.blockVar = block(function() { nonLocalReturn("returning from outer context"); });
		}
		if (this.counter < 3) {
			this.counter++;
			this.blockHelper();
			this.counterBack++;
		} else {
			this.blockVar.value();
		}
	},
	
	// Cascades
	test12: function() {
		var result = function(){
			return 1;
		}.apply();
		Assert.isTrue(result == 1);
	},
	test13: function() {
		var local = "Lokal";
		var result = function(){
			var receiver = "Ab";
			receiver = receiver + this.instVar;
			return receiver + local;
		}.apply();
		Assert.isTrue(result == "AbInsLokal"); // ^^
	}
}});

var tester = Tester._newInstance();
tester.instVar = "instVar";
tester.instMethod = function(){ return "methodRes"; };
tester.instanceVar = "Ins";
tester.counter = 0;
tester.counterBack = 0;

tester.test1();
tester.test2();
tester.test3();
tester.test4();
tester.test41();
tester.test42();
tester.test5();
tester.test6();
tester.test7();
tester.test8();
tester.test9();
tester.test10();
tester.test11();
tester.test111();
tester.test112();
tester.test113();
tester.test12();
tester.test13();