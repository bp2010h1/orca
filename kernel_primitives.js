// 
// Implementations of primitive methods
// This is loaded at the very end, everything is already available
// If this gets too long, split it in multiple files
// 

ProtoObject._addClassMethods({
	basicNew: function() { return this._newInstance(); },
	_new: function() { return this.basicNew().initialize(); },
	name: function() { return this._classname; }
});
ProtoObject._addInstanceMethods({
	_equals_equals: function(anObject) { if (this === anObject) {return _true; } else { return _false; } }
});

_Object._addInstanceMethods({
	_class: function() { return this.__class; }
	halt: function() { debugger; }
});

Error._addInstanceMethods({
	signal: function(){ throw this }
});

String._addInstanceMethods({
	// This is not actually a primitive function, but behaves in the same way the #, method does
	_comma: function(anotherString) { return string(this.string$ + anotherString.string$) },
	_equals: function(anotherString) { return bool(this.string$ == anotherString.string$) },
	isEmpty: function() { return bool(this.string$.length == 0) }
});

_Number._addInstanceMethods({
	printString: function() { return string(this.num$.toString()); }
});

Float._addInstanceMethods({
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
	_greater_equals: function(other) {
		return bool(this.num$ >= other.num$);
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
});

Point._addInstanceMethods({
	_times: function(aNumber){
		return (this.x()._times(aNumber))._at(this.y()._times(aNumber));
	}
});

var _blockValueFunction_ = function(){ return this.func$.apply(this, arguments); };
BlockClosure._addInstanceMethods({
	value: _blockValueFunction_,
	value_: _blockValueFunction_,
	value_value_: _blockValueFunction_,
	value_value_value_: _blockValueFunction_,
	value_value_value_value_: _blockValueFunction_,
	
	whileTrue_: function(anotherBlock) {
		// TODO implement whileTrue: for real
		while (this.value() === _true) {
			anotherBlock.value();
		}
	},
	
	onServer: function() {
		
	}
});

_Array._addInstanceMethods({
	size: function(){
		return number(this.arr$.length);
	},
	at_put_: function(idx, val){
		this.arr$[idx.num$ - 1] = val;
		return val;
	},
	at_: function(idx){
		return this.arr$[idx.num$ - 1];
	},
	isEmpty: function(){
    return (this.arr$.length == 0);
	}
});
_Array._addClassMethods({
	new_: function(size){
		return array([]);
	}
});

// Defined in bootstrap.js. Must be called after primitives-initialization.
JsGlobal.AddJsFunctionToAllObjects();
