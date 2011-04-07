
(function() {

	Exception._addInstanceMethods({
		signal: function() { 
			throw this;
		}
	});

})();
