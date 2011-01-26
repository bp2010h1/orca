
Class("A", { instanceMethods: { a: function(r) { return "abc" + r; } }});
	Class("A1", { superclass: A, instanceMethods: { a: function(r) { return _super('a')(r + "hehe"); } }});
		Class("NoMethodsA1", { superclass: A1});
			Class("A2", { superclass: NoMethodsA1, instanceMethods: { a: function(r) { return _super('a')(r + 2); } }});
	Class("NoMethods1", { superclass: A});
		Class("B", { superclass: NoMethods1, instanceMethods: { a: function(r) { return _super('a')(3333); } }});
		Class("NoMethods2", { superclass: NoMethods1});
			Class("A3", { superclass: NoMethods2, instanceMethods: { a: function(r) { return _super('a')(r + "hi"); } }});
	Class("NewImplementation", { superclass: A, instanceMethods: { a: function() { return "ThisIsNew"; } }});
		Class("A4", { superclass: NewImplementation, instanceMethods: { a: function(r) { return _super('a')() + r; } }});

Class("SuperTester", {
	
	instanceMethods: {
		
		test1: function() {
			// not really tests _super, but the inheritance and basics
			assert(A()._newInstance().a(1) == "abc1");
			assert(NoMethods1()._newInstance().a(2) == "abc2");
			assert(NoMethods2()._newInstance().a(3) == "abc3");
			assert(NoMethods3()._newInstance().a(4) == "abc4");
		},
		
		test2: function() {
			assert(A1()._newInstance().a(12) == "abc12hehe");
		},
		
		test3: function() {
			assert(B()._newInstance().a("ignored") == "abc3333");
		},
		
		test4: function() {
			assert(A2()._newInstance().a(50) == "abc52hehe");
		},
		
		test5: function() {
			assert(A3()._newInstance().a("a2") == "abca2hi");
		},
		
		test6: function() {
			assert(A4()._newInstance().a("Here") == "ThisIsNewHere");
		}
		
	}

});

SuperTester._newInstance();
