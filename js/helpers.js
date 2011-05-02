
// Setup depends on: -
// Runtime depends on: -

// API:
// st.toArray(anIterable)
// st.curried(aFunction, anArrayOfArguments)
// st.isInteger(aNumber)

(function() {

	// Set up Namespace
	var home = window.st ? window.st : (window.st = {});

	home.toArray = function(iterable) { 
		if (!iterable) return [];
		if (iterable.toArray) return iterable.toArray();
		var length = iterable.length, results = new Array(length);
		while (length--) results[length] = iterable[length];
		return results;
	};

	home.curried = function(func, boundArgs) { 
		// Return a function with the first parameters bound to boundArgs. Function itself will be bound to this.
		var f = function() { return func.apply(this, boundArgs.concat(home.toArray(arguments))); };
		
		// The prototype of the curried function must be set to the prototype of the original function
		// BECAUSE: the curried function will be used as constructor (with the new-keyword). There, the prototype
		// of the newly created object (it's __proto__-slot) will be the prototype of the function applied on the new-operator.
		f.prototype = func.prototype;
		return f;
	};

	home.escapeAll = function(string) {
		// * @ - _ + . / are not escaped by this default js-function
		var result = escape(string);
		result = result.replace(/(\*)/g, "%2A");
		result = result.replace(/(\@)/g, "%40");
		result = result.replace(/(\-)/g, "%2D");
		result = result.replace(/(\_)/g, "%5F");
		result = result.replace(/(\+)/g, "%2B");
		result = result.replace(/(\.)/g, "%2E");
		result = result.replace(/(\/)/g, "%2F");
		return result;
	};
	
	home.isInteger = function (aNumber) {
		if (isNaN(aNumber)) return false;
		var integralPart = parseInt(aNumber);
		return aNumber == integralPart;
	};

})();
