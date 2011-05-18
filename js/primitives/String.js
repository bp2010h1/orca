
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
			//strings are initialized with whitespace, if they should have a specifiy length
			var string = "";
			for (var i = 0; i < st.unbox(sizeRequsted); i++)
			string += " ";
			return st.string(string);
		}
	});

	/*
	at_ should also be defined in:
	ByteSymbol
	WideString
	WideSymbol
	*/

})();
