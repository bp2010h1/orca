
(function() {

	OrcaWidget._addInstanceMethods({
		generateCssId: function() {
			return string("id" + Date.now());
		}
	});

})();
