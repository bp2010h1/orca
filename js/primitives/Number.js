
// Runtime depends on: boxing.js

(function() {

	st.Number._addInstanceMethods({
		printString: function() { return st.string(st.unbox(this).toString()); }
	});

})();
