
// Runtime depends on: boxing.js

(function() {

	st.TestCase._addInstanceMethods({
		runCase: function() { 
			/* normaly TestCase is using TimeOuts to ensure the test will be respond */
			return this.performTest();
		},
		performTest: function() { 
			return this.perform_(this.selector());
		},
		hash: function() {
			return st.number(this._instanceNumber);
		}
	});
})();

