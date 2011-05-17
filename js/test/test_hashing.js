
st.klass("HashTester", {
	
	instanceMethods: {
		
		testFloatHashing: function() {
			st.tests.assert(st.number(1.2).hash() != undefined, "the hash is undefined");
		},
		testFloatHashIdentity: function() {
			st.tests.assert( st.number(1.3).hash()._equals(st.number(1.3).hash()), "the hash value of a float is everytime the same");
			st.tests.assert( st.number(2.3).hash()._equals(st.number(1.2).hash()).not(), "the hash value of 2 floats is different");
		}
		

		
	}

});

supinst = st.HashTester._newInstance();

