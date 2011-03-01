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
	_equals_equals: function(anObject) { return bool(this === anObject); },
	identityHash: function() { return number(this.instanceNumber$); },	
});

_Object._addInstanceMethods({
	_class: function() { return this.__class; },
	halt: function() { debugger; },
});

Exception._addInstanceMethods({
	signal: function(){ throw this }
});

_String._addInstanceMethods({
	// This is not actually a primitive function, but behaves in the same way the #, method does
	_comma: function(anotherString) { return string(this.string$ + anotherString.string$) },
	_equals: function(anotherString) { return bool(this.string$ == anotherString.string$) },
	isEmpty: function() { return bool(this.string$.length == 0) },
	size: function() { return number(this.string$.length); },
	at_: function(num) { return character(this.string$[num.num$ - 1]);},
	ifEmpty_: function(aBlock) {return this.isEmpty().ifTrue_(aBlock);},
	ifNotEmpty_: function(aBlock) {return this.isEmpty().ifFalse_(aBlock);}
});

ByteString._addInstanceMethods({
	at_: function(num) { return character(this.string$[num.num$ - 1]); }
});

/*
at_ should also be defined in:
ByteSymbol
WideString
WideSymbol
*/

_Number._addInstanceMethods({
	printString: function() { return string(this.num$.toString()); }
});

Float._addInstanceMethods({
	_plus: function(other) { return number(this.num$ + other.num$); },
	_minus: function(other) { return number(this.num$ - other.num$); },
	_times: function(other) { return number(this.num$ * other.num$); },
	_slash: function(other) { return number(this.num$ / other.num$); },
	floor: function() { return number(Math.floor(this.num$)); },
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
	_tilde_equals: function(other) {
	  return bool(this.num$ != other.num$);
	},
	timesRepeat_: function(aBlock){
		for (var i = 0; i < this.num$; i++) {
			aBlock.value();
		}
		return this;
	},
	truncated: function() {
		return number(Math.floor(this.num$));
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
		while (this.value() === _true) {
			anotherBlock.value();
		}
		return nil;
	},
	whileTrue: function(anotherBlock) {
		// TODO implement whileTrue: for real
		while (this.value() === _true) ;
		return nil;
	},
	whileFalse_: function() {
		while (this.value() === _false) {
			anotherBlock.value();
		}
		return nil;
	},
	whileFalse: function() {
		while (this.value() === _false) ;
		return nil;
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
		return bool(this.arr$.length == 0);
	},
	
	/* this is actually not a primitive and should be implemented by squeak.
	   it is only implemented here to work around a hardly tracable bug, probably in out blocks
	   and nonlocal return */
	includes_: function(anElement) {
    for(var i = 0; i < this.arr$.length; i++) {
      if(this.arr$[i]._equals(anElement).js())
        return _true;
    }
    return _false;
	}
});
_Array._addClassMethods({
	new_: function(size){
		var arr = new Array(size.num$);
		for (var i = 0; i < size.num$; i++) {
			arr[i] = nil;
		}
		return array(arr);
	}
});

