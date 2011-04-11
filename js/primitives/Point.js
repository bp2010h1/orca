
(function() {

	st.Point._addInstanceMethods({
		// TODO why is this implemented here? Really necessary?
		_times: function(aNumber){
			return (this.x()._times(aNumber))._at(this.y()._times(aNumber));
		}
	});

})();
