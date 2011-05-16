
// Runtime depends on: boxing.js

(function() {

	st.Symbol._addClassMethods({
		lookup_: function(aStringOrSymbol) { 
			return aStringOrSymbol;
		}
	});
})();
