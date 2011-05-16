
(function() {

	st.Exception._addInstanceMethods({
		signal: function(aString) { 
			throw this;
		}
	});

})();
