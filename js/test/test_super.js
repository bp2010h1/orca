
st.klass("A", { instanceMethods: { a: function(r) { return "abc" + r; } }});
	st.klass("A1", { superclass: st.A, instanceMethods: { a: function(r) { return st.supa('a')(r + "hehe"); } }});
		st.klass("NoMethodsA1", { superclass: st.A1});
			st.klass("A2", { superclass: st.NoMethodsA1, instanceMethods: { a: function(r) { return st.supa('a')(r + 2); } }});
	st.klass("NoMethods1", { superclass: st.A});
		st.klass("B", { superclass: st.NoMethods1, instanceMethods: { a: function(r) { return st.supa('a')(3333); } }});
		st.klass("NoMethods2", { superclass: st.NoMethods1});
			st.klass("A3", { superclass: st.NoMethods2, instanceMethods: { a: function(r) { return st.supa('a')(r + "hi"); } }});
	st.klass("NewImplementation", { superclass: st.A, instanceMethods: { a: function() { return "ThisIsNew"; } }});
		st.klass("A4", { superclass: st.NewImplementation, instanceMethods: { a: function(r) { return st.supa('a')() + r; } }});

// Build up convenience to create instances of the test-classes
classes = [ "A", "A1", "NoMethodsA1", "A2", "NoMethods1", "B", "NoMethods2", "A3", "NewImplementation", "A4" ];
for (cl in classes) {
  this[classes[cl]] = (function(clazz) {return function() {
    return clazz._newInstance() }; })(st[classes[cl]]);
}

st.klass("SuperTester", {
	
	instanceMethods: {
		
		test1: function() {
			// not really tests st.supa(, but the inheritance and basics
			st.tests.assert(A().a(1) == "abc1");
			st.tests.assert(NoMethods1().a(2) == "abc2");
			st.tests.assert(NoMethods2().a(3) == "abc3");
			st.tests.assert(NewImplementation().a(4) == "ThisIsNew");
		},
		
		test2: function() {
			st.tests.assert(A1().a(12) == "abc12hehe");
		},
		
		test3: function() {
			st.tests.assert(B().a("ignored") == "abc3333");
		},
		
		test4: function() {
			st.tests.assert(A2().a(50) == "abc52hehe");
		},
		
		test5: function() {
			st.tests.assert(A3().a("a2") == "abca2hi");
		},
		
		test6: function() {
			st.tests.assert(A4().a("Here") == "ThisIsNewHere");
		},	
		testSuperClass: function() {
			st.tests.assert(st.A1.superclass() == st.A, "incorrect super class");
		},
		testSuperClassOfObject : function() {
			st.tests.assert(st.Object.superclass() == st.Object.$superclass, "Superclass methods works properly");
		}
		
	}

});

supinst = st.SuperTester._newInstance();

