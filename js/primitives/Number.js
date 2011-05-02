
// Runtime depends on: boxing.js

(function() {

	st.Number._addInstanceMethods({
		printString: function() { return st.string(st.unbox(this).toString()); },
		isInteger: function() { return st.bool(st.isInteger(st.unbox(this))); }
	});

})();
