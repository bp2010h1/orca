
// Runtime depends on: boxing.js

(function() {

	st.TestCase._addInstanceMethods({
		
		performTest: function() { 
			return this.perform_(this.selector());
		},
		
		hash: function() {
			return st.number(this._instanceNumber);
		}
		
	});
})();