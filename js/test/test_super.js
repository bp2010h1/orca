
st.class("A", { instanceMethods: { a: function(r) { return "abc" + r; } }});
	st.class("A1", { superclass: st.A, instanceMethods: { a: function(r) { return _super('a')(r + "hehe"); } }});
		st.class("NoMethodsA1", { superclass: st.A1});
			st.class("A2", { superclass: st.NoMethodsA1, instanceMethods: { a: function(r) { return _super('a')(r + 2); } }});
	st.class("NoMethods1", { superclass: st.A});
		st.class("B", { superclass: st.NoMethods1, instanceMethods: { a: function(r) { return _super('a')(3333); } }});
		st.class("NoMethods2", { superclass: st.NoMethods1});
			st.class("A3", { superclass: st.NoMethods2, instanceMethods: { a: function(r) { return _super('a')(r + "hi"); } }});
	st.class("NewImplementation", { superclass: st.A, instanceMethods: { a: function() { return "ThisIsNew"; } }});
		st.class("A4", { superclass: st.NewImplementation, instanceMethods: { a: function(r) { return _super('a')() + r; } }});

// Build up convenience to create instances of the test-classes
classes = [ "A", "A1", "NoMethodsA1", "A2", "NoMethods1", "B", "NoMethods2", "A3", "NewImplementation", "A4" ];
for (cl in classes) {
  this[classes[cl]] = (function(clazz) {return function() {
    return clazz._newInstance() }; })(this[classes[cl]]);
}

st.class("SuperTester", {
	
	instanceMethods: {
		
		test1: function() {
			// not really tests _super, but the inheritance and basics
			assert(A().a(1) == "abc1");
			assert(NoMethods1().a(2) == "abc2");
			assert(NoMethods2().a(3) == "abc3");
			assert(NewImplementation().a(4) == "ThisIsNew");
		},
		
		test2: function() {
			assert(A1().a(12) == "abc12hehe");
		},
		
		test3: function() {
			assert(B().a("ignored") == "abc3333");
		},
		
		test4: function() {
			assert(A2().a(50) == "abc52hehe");
		},
		
		test5: function() {
			assert(A3().a("a2") == "abca2hi");
		},
		
		test6: function() {
			assert(A4().a("Here") == "ThisIsNewHere");
		}
		
	}

});

SuperTester._newInstance();

