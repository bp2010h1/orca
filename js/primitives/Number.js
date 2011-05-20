
// Runtime depends on: boxing.js

(function() {

	st.Number._addInstanceMethods({
		printString: function() { return st.string(st.unbox(this).toString()); },
		isInteger: function() { return st.bool(st.isInteger(st.unbox(this))); },

		roundTo_: function(quantum) {
			var result = st.unbox((this._slash(quantum)).rounded()._times(quantum));
			var decimalCount = 0;
			while (decimalCount <= 21 && st.unbox(quantum).toFixed(decimalCount) != st.unbox(quantum)) {
				decimalCount++;
			}
			return st.number(result.toFixed(decimalCount));
		}
	});

})();
