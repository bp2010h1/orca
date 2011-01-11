// 
// Implementations of primitive methods
// This is loaded at the very end, everything is already available
// If this gets too long, split it in multiple files
// 

Error._addInstanceMethods(
	signal: function(){ throw this };
);

// TODO Float: this should be moved to Number or something... the whole Number-class-hierarchy should be supported in JS
// For this, the Parser must "find out" which class is instantiated from a number-literal.. Integer/SmallInteger/Floast/etc.
Float._addInstanceMethods(
	_plus: function(other) { return number(this.num$ + other.num$); },
	_minus: function(other) { return number(this.num$ - other.num$); },
	_times: function(other) { return number(this.num$ * other.num$); },
	_slash: function(other) { return number(this.num$ / other.num$); },
	_slash_slash: function(other) { return number(this.num$ / other.num$); },
	_less: function(other) {
		return bool(this.num$ < other.num$);
	},
	_greater: function(other) {
		return bool(this.num$ > other.num$);
	},
	_less_equals: function(other) {
		return bool(this.num$ <= other.num$);
	},
	_equals: function(other) {
		return bool(this.num$ == other.num$);
	},
	timesRepeat_: function(aBlock){
		for (var i = 0; i < this.num$; i++) {
			aBlock.value();
		}
		return this;
	}
);

Point._addInstanceMethods(
	_times: function(aNumber){
		return (this.x()._times(aNumber))._at(this.y()._times(aNumber));
	}
);

var _blockValueFunction_ = function(){ return this.$func.apply(this, arguments); };
BlockClosure._addInstanceMethods(
	value: _blockValueFunction_,
	value_: _blockValueFunction_,
	value_value_: _blockValueFunction_,
	value_value_value_: _blockValueFunction_,
	value_value_value_value_: _blockValueFunction_,
	
	whileTrue_: function(anotherBlock) {
		// TODO implement whileTrue: for real
		while(this.value() == _true) {
			anotherBlock.value();
		}
	}
);

_Array._addInstanceMethods(
	size: function(){
		return number(this.arr$.length);
	},
	at_put_: function(idx, val){
		this.arr$[idx.num$ - 1] = val;
		return val;
	},
	at_: function(idx){
		return this.arr$[idx.num$ - 1];
	}
);
_Array._addClassMethods(
	new_: function(size){
		return new Array(size.num$)
	}
);
