
// Runtime depends on: boxing.js

(function() {

	st.Integer._addInstanceMethods({
		_plus: function(other) { return st.number(st.unbox(this) + st.unbox(other)); },
		_minus: function(other) { return st.number(st.unbox(this) - st.unbox(other)); },
		_times: function(other) { return st.number(st.unbox(this) * st.unbox(other)); },
		_slash: function(other) { return st.number(st.unbox(this) / st.unbox(other)); },
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
		}
	});

})();
