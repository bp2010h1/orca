
// Runtime depends on: boxing.js

(function() {

	st.TestCase._addInstanceMethods({
		hash: function() {
			return st.number(this._instanceNumber);
		}
		
	});
})();