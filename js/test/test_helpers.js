
// This tests verifies helper methods.

st.klass("HelpersTester", { 

	instanceMethods: {
		
		testIsInteger: function(){
			st.tests.assert(st.isInteger(1));
			st.tests.assert(st.isInteger("2"));
			st.tests.assert(st.isInteger(0.0));
			st.tests.assert(st.isInteger(-1));
		},
		
		testIsNoInteger: function() {
			st.tests.deny(st.isInteger(1.5), "1.5 is not an integer");
			st.tests.deny(st.isInteger(.5));
		}
		
	}

});

st.HelpersTester._newInstance();
