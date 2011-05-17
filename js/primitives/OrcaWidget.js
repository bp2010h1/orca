
// Runtime depends on: boxing.js

(function() {

	st.OrcaWidget._addInstanceMethods({
		generateCssId: function() {
			return st.string("id" + Date.now());
		}
	});

})();
