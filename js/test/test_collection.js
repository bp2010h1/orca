st.klass("CollectionTester", {
	
	instanceMethods: {
		testConcatenationOfOrderedCollections: function() {
			var collection1 = st.OrderedCollection.with_with_(st.number(1),st.number(2) );
			var collection2 = st.OrderedCollection.with_with_(st.number(1),st.number(4) );
			var concatenatedCollection = collection1._comma(collection2);
			st.tests.assert(concatenatedCollection != undefined, "Result of concatenation is undefined");
		},
		testCopyOfOrderedCollections: function() {
			var collection1 = st.OrderedCollection.with_with_(st.number(1),st.number(2) );
			var collection2 = collection1.copy();
			st.tests.assert(collection2 != undefined, "Result of copy is undefined");
			st.tests.assert(collection2 != collection1 , "Result of copy isn't the same than the original");
			st.tests.assert(collection2.first()._equals(st.number(1)) , "Result of copy isn't the same than the original");
		}
	}
});

supinst = st.CollectionTester._newInstance();

