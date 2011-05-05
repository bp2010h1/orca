
st.klass("BlocksTester", { instanceMethods: {
	
	setUp: function() {
		this.instVar = st.string("instVar");
		this.instanceVar = st.string("Ins");
		this.counter = st.number(0);
		this.counterBack = st.number(0);
	},
	
	instMethod: function() { return st.string("methodRes"); },
	
	// Basic, multiple blocks, instance var
	test1: function() {
		var _block = st.block(function(){ return 1; });
		st.tests.assert(_block.value() == 1);
	},
	test2: function() {
		var _block = st.block(function(){
			var a = "c"; // Random stuff in here
			var _block = 1; // shadow the variable...
			return _block; });
		st.tests.assert(_block.value() == 1);
	},
	test3: function() {
		var _block = st.block(function(){
			var inner = st.block(function(){ return "inner"; });
			return inner.value(); });
		st.tests.assert(_block.value() == "inner");
	},
	test4: function() {
		var _block = st.block(function(){
			var inner = st.block(function(){ 
				var innerinner = st.block(function(){ return "innerinner"; });
				return innerinner.value(); });
			return inner.value(); });
		st.tests.assert(_block.value() == "innerinner");
	},
	test5: function() {
		var _block = st.block(function(){ return this.instVar; });
		st.tests.assert(_block.value()._original == "instVar");
	},
	test6: function() {
		var _block = st.block(function(){ return this.instMethod(); });
		st.tests.assert(_block.value()._original == "methodRes");
	},
	
	// Parameters
	test7: function() {
		var _block = st.block(function(arg1, arg2){ return arg1._comma(st.string("22")); });
		st.tests.assert(_block.value_value_("abc", "def")._original == "abc22");
	},
	test8: function() {
		var _block = st.block(function(arg1, arg2){
			var inner = st.block(function(arg1, arg2){
				return arg2._comma(st.string("d"));
			});
			return inner.value_value_(st.number(2), arg1);
		});
		st.tests.assert(_block.value_value_("abc", "def")._original == "abcd");
	},
	test9: function() {
		var local = st.string("outer");
		var local1 = st.string("outer1");
		var _block = st.block(function(local1, arg2){ var local = st.string("inner"); return local1._comma(local); });
		st.tests.assert(_block.value_value_("abc", "def")._original == "abcinner");
	},
	
	// non local return
	test10: function() {
		st.tests.assert(this.helper10() == 2);
	},
	helper10: function() {
		return st.block(function(){ st.nonLocalReturn(2); }).value();
	},
	test11: function() {
		st.tests.assert(this.helper11() == 1);
	},
	helper11: function() {
		return st.block(function(){
			var inner = st.block(function() {
				return 1;
			});
			st.nonLocalReturn(inner.value());
			return 100; }).value();
	},
	test12: function() {
		st.tests.assert(this.helper12() == 1);
	},
	helper12: function() {
		return st.block(function(){
			var inner = st.block(function() {
				st.nonLocalReturn(1);
			});
			inner.value();
			st.nonLocalReturn(100);
			return 200; }).value();
	},
	test13: function() {
		st.tests.assert(this.helper13()._original == "instVarmethodRes");
	},
	helper13: function() {
		return st.block(function(){ st.nonLocalReturn(this.instVar._comma(this.instMethod())); }).value();
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
		
		st.tests.assert(error != "no Error");
		st.tests.assert(result == "before");
	},
	blockSource: function(){ return st.block(function() { st.nonLocalReturn("This should cause an error."); }); },
	test15: function() {
		this.counter = 0;
		this.counterBack = 0;
		st.tests.assert(this.helper15() == "returned");
		st.tests.assert(this.counter == 3);
		st.tests.assert(this.counterBack == 3);
	},
	helper15: function() {
		var result = "unreturned";
		st.block(function(){
			if (this.counter < 3) {
				this.counter++;
				result = this.helper15();
				this.counterBack++;
			} else {
				// Return only from the inner-most invokation
				st.nonLocalReturn("returned");
		}}).value();
		return result;
	},
	test16: function() {
		this.counter = 0;
		this.counterBack = 0;
		this.helper16();
		st.tests.assert(this.counter == 3);
		st.tests.assert(this.counterBack == 0); // !!
	},
	helper16: function() {
		var _block = st.block(function() { st.nonLocalReturn("abc"); });
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
		st.tests.assert(this.counter == 3);
		st.tests.assert(this.counterBack == 0); // !!
	},
	helper17: function() {
		if (this.blockVar == undefined) {
			this.blockVar = st.block(function() { st.nonLocalReturn("returning from outer context"); });
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
		st.tests.assert(result == 1);
	},
	test19: function() {
		var local = st.string("Lokal");
		var result = (function(){
			var receiver = st.string("Ab");
			receiver = receiver._comma(this.instanceVar);
			return receiver._comma(local);
		}).apply(this);
		st.tests.assert(result._original == "AbInsLokal"); // ^^
	},
	test20: function() {
		// Block in cascade
		var result = (function(){
			return st.block(function(){
				return this.instanceVar;
			}).value();
		}).apply(this);
		st.tests.assert(result._original == "Ins");
	},
	test21: function() {
		// Cascade in block
		var result = st.block(function(){
			return (function() {
				return this.instanceVar;
			}).apply(this);
		}).value();
		st.tests.assert(result._original == "Ins");
	},
	test22: function() {
		// "cascade" in Block with arguments
		var lokalouter = st.string("Outer");
		var result = st.block(function(arg1, arg2){
			var lokal = st.string("Inner");
			return (function() {
				return this.instanceVar._comma(arg1)._comma(arg2)._comma(lokal)._comma(lokalouter);
			}).apply(this);
		}).value(st.string("First"), st.string("Second"));
		st.tests.assert(result._original == "InsFirstSecondInnerOuter");
	},
	test23: function() {
		// Block with arguments in cascade
		var outer = st.string("Outer");
		var outerParam = st.string("OuterParam");
		var result = (function(){
			var inner = st.string("Inner");
			var innerParam = st.string("InnerParam");
			return st.block(function(arg1, arg2){
				return this.instanceVar._comma(arg1)._comma(arg2)._comma(outer)._comma(inner);
			}).value(outerParam, innerParam);
		}).apply(this);
		st.tests.assert(result._original == "InsOuterParamInnerParamOuterInner");
	},
	
	test24: function() {
		var _block = st.block( function() { return this.instVar; } );
		var otherTester = st.BlocksTester._newInstance();
		otherTester.instVar = st.string("otherInstVar");
		st.tests.assert("instVar" == otherTester.evaluateBlock(_block)._original);
	},
	evaluateBlock: function(aBlock) {
		return aBlock.value();
	},
	test25: function() {
		var otherTester = st.BlocksTester._newInstance();
		otherTester.instVar = st.string("otherInstVar");
		var _block = st.block(function(){
			var inner = st.block(function(){ 
				var innerinner = st.block(function(){
				  return this.instVar; });
				return innerinner.value(); });
			return inner.value(); });
		st.tests.assert("instVar" == otherTester.evaluateBlock(_block)._original);
	},
	
	testWhileTrue: function() {
		var result = this._testWhileTrueBlock();
		st.tests.assert(result == "OKAAY", "Result was: " + result);
	},
	_testWhileTrueBlock: function(blockParameter) {
		var i = 0;
		st.block(function(){
				i++;
				return st.bool(i < 10);
			})
			.whileTrue_(st.block(function(){
				if (i >= 5) { st.nonLocalReturn("OKAAY"); }
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
		st.tests.assert(exception != null);
	},
	helper_testErrorWhenClosureIsAlreadyLeft: function() {
		return st.block(function(){ st.nonLocalReturn("This should throw error"); });
	}
	
}});

st.BlocksTester._newInstance();
