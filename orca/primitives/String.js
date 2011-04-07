
(function() {

	_String._addInstanceMethods({
		// This is not actually a primitive function, but behaves in the same way the #, method does
		_comma: function(anotherString) { return string(this.original$ + anotherString.original$); },
		_equals: function(anotherString) { return bool(this.original$ == anotherString.original$); },
		_equals_equals: function(anotherString) { return this._equals(anotherString); },
		isEmpty: function() { return bool(this.original$.length === 0); },
		size: function() { return number(this.original$.length); },
		at_: function(num) { return character(this.original$[num.original$ - 1]); }
	});

	/*
	at_ should also be defined in:
	ByteSymbol
	WideString
	WideSymbol
	*/

})();
