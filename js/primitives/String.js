
(function() {

	st.String._addInstanceMethods({
		// This is not actually a primitive function, but behaves in the same way the #, method does
		_comma: function(anotherString) { 
			return st.string(st.unbox(this) + st.unbox(anotherString));
		},
		
		_equals: function(anotherString) { 
			return st.bool(st.unbox(this) == st.unbox(anotherString));
		},
		
		_equals_equals: function(anotherString) { 
			return this._equals(anotherString);
		},
		
		isEmpty: function() { 
			return st.bool(st.unbox(this).length === 0);
		},
		
		size: function() { 
			return st.number(st.unbox(this).length);
		},
		
		at_: function(num) { 
			return st.character(st.unbox(this)[st.unbox(num) - 1]);
		}
	});
	st.String._addClassMethods({
		basicNew_: function (sizeRequested){
			//strings can not be initialized to a specific length, which is not their size, but their room in memory
			return st.string(new String());
		}
	});

	/*
	at_ should also be defined in:
	ByteSymbol
	WideString
	WideSymbol
	*/

})();
