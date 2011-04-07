
(function() {

	Point._addInstanceMethods({
		_times: function(aNumber){
			return (this.x()._times(aNumber))._at(this.y()._times(aNumber));
		}
	});

})();
