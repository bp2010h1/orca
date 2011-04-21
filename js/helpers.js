
// Setup depends on: -
// Runtime depends on: -

// API:
// st.toArray(anIterable)
// st.curried(aFunction, anArrayOfArguments)
// st.getRandomInt(min, max)
// st.GET(path)
// st.loadScript(path)

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

	// source: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Math/random
	home.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	home.GET = function(path) {
		var req = new XMLHttpRequest();
		req.open("GET", path, false);
		req.send(null);
		if (req.status == 200) {
			return req.responseText;
		} else {
			throw "Could not load file: " + path;
		}
	};

	// Load the resource and evaluate it in global context. Return the evaluated result.
	home.loadScript = function(path) {
		var script = st.GET(path);
		// The scripts need global context
		return (function() { return window.eval(script); })();
	}

})();
