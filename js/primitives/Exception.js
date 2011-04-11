
(function() {

	st.Exception._addInstanceMethods({
		signal: function() { 
			throw this;
		}
	});

})();
