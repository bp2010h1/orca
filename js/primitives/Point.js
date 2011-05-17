
(function() {

	st.Point._addInstanceMethods({
		_times: function(aNumber){
			arg.isPoint().ifTrue_(st.block(function () {
				return st.nonLocalReturn(this.$x._times(arg.x())._at(this.$y._times(arg.y())));
			}));
			// Instead of sending #adaptToPoint:andSend: to the argument,
			// Treat it as a Number. Not equal to the squeak-implementation.
			return (this.x()._times(aNumber))._at(this.y()._times(aNumber));
		}
	});

})();
