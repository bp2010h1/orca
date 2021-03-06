
// Runtime depends on: boxing.js

(function() {

	st.Integer._addInstanceMethods({
		_plus: function(other) { return st.number(st.unbox(this) + st.unbox(other)); },
		_minus: function(other) { return st.number(st.unbox(this) - st.unbox(other)); },
		_times: function(other) { return st.number(st.unbox(this) * st.unbox(other)); },
		_slash: function(other) { return st.number(st.unbox(this) / st.unbox(other)); },
		even: function(other) { return st.supa('even')(other); },
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
		bitShiftMagnitude_: function (other){
			return st.number(st.unbox(this) * Math.pow(2, st.unbox(other))).floor();
		},
		bitAnd_: function (other){
			return st.number(st.unbox(this) & st.unbox(other));
		},
		printOn_base_: function (aStream, base){
			var numberString = st.unbox(this).toString(st.unbox(base));
			aStream.nextPutAll_(st.string(numberString));
		},
		digitDiv_neg_: function(arg, ng) {
			var divident = st.unbox(this);
			var divisor = st.unbox(arg);
			var isNegative = st.unbox(ng);
			var remainder = divident % divisor;
			var quotient = (divident - remainder) / divisor;
			if (isNegative) {
				return st.array([st.number(-1 * quotient), st.number(remainder)]);
			} else {
				return st.array([st.number(quotient), st.number(remainder)]);
			}
		}
	});

})();
