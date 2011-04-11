
// Runtime depends on: boxing.js

(function() {

	// TODO this must be solved by our system. Load this script only,
	// if the class is actually present.
	if (st.OrcaWidget)
		st.OrcaWidget._addInstanceMethods({
			generateCssId: function() {
				return st.string("id" + Date.now());
			}
		});

})();
