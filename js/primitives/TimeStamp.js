
// Runtime depends on: boxing.js

(function() {

	st.TimeStamp._addClassMethods({
		now: function() { return new Date().getTime(); }
	});
})();
