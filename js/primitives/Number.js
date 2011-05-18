
// Runtime depends on: boxing.js

(function() {

	st.Number._addInstanceMethods({
		printString: function() { return st.string(st.unbox(this).toString()); },
		isInteger: function() { return st.bool(st.isInteger(st.unbox(this))); },
		

		_plus: function(other) { return st.number(st.unbox(this) + st.unbox(other)); },
		_minus: function(other) { return st.number(st.unbox(this) - st.unbox(other)); },
		_times: function(other) { return st.number(st.unbox(this) * st.unbox(other)); },
		_slash: function(other) { return st.number(st.unbox(this) / st.unbox(other)); },
		fractionPart: function(){ return this._minus(this.truncated()) },
		floor: function() { return st.number(Math.floor(st.unbox(this))); },
		rounded: function() { return st.number(Math.round(st.unbox(this))); },
		_less: function(other) {
			return st.bool(st.unbox(this) < st.unbox(other));
		},
		_greater: function(other) {
			return st.bool(st.unbox(this) > st.unbox(other));
		},
		hash: function () { return this.truncated(); },
		_less_equals: function(other) {
			return st.bool(st.unbox(this) <= st.unbox(other));
		},
		_greater_equals: function(other) {
			return st.bool(st.unbox(this) >= st.unbox(other));
		},
		_equals: function(other) {
			return st.bool(st.unbox(this) == st.unbox(other));
		},
		_tilde_equals: function(other) {
		  return st.bool(st.unbox(this) != st.unbox(other));
		},
		timesRepeat_: function(aBlock){
			for (var i = 0; i < st.unbox(this); i++) {
				aBlock.value();
			}
			return this;
		},
		truncated: function() {
			return st.number(Math.floor(st.unbox(this)));
		},
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
