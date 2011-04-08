
(function() {

	Float._addInstanceMethods({
		_plus: function(other) { return number(this.original$ + other.original$); },
		_minus: function(other) { return number(this.original$ - other.original$); },
		_times: function(other) { return number(this.original$ * other.original$); },
		_slash: function(other) { return number(this.original$ / other.original$); },
		floor: function() { return number(Math.floor(this.original$)); },
		rounded: function() { return number(Math.round(this.original$)); },
		_less: function(other) {
			return bool(this.original$ < other.original$);
		},
		_greater: function(other) {
			return bool(this.original$ > other.original$);
		},
		_less_equals: function(other) {
			return bool(this.original$ <= other.original$);
		},
		_greater_equals: function(other) {
			return bool(this.original$ >= other.original$);
		},
		_equals: function(other) {
			return bool(this.original$ == other.original$);
		},
		_tilde_equals: function(other) {
		  return bool(this.original$ != other.original$);
		},
		timesRepeat_: function(aBlock){
			for (var i = 0; i < this.original$; i++) {
				aBlock.value();
			}
			return this;
		},
		truncated: function() {
			return number(Math.floor(this.original$));
		},
		roundTo_: function(quantum) {
			var result = _unboxObject((this._slash(quantum)).rounded()._times(quantum));
			var decimalCount = 0;
			while (decimalCount <= 21 && _unboxObject(quantum).toFixed(decimalCount) != _unboxObject(quantum)) {
				decimalCount++;
			}
			return number(result.toFixed(decimalCount));
		}
	});

})();
