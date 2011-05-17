
// Setup depends on: -
// Runtime depends on: -

// API:
// st.toArray(anIterable)
// st.curried(aFunction, anArrayOfArguments)
// st.escapeAll(aString)
// st.isInteger(aNumber)
// String.prototype.endsWidth(aSubString)
// st.isChrome()
// st.localEval(aString)
// st.fullURL(aString)
// st.isExternal(aString)
// st.evalScript(path)
// st.addScriptTags(arrayOfStrings)

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

	String.prototype.endsWith = function(aSubString) {
		return (this.match(aSubString + "$") == aSubString);
	};

	home.isChrome = function() {
		return /WebKit/g.test(navigator.userAgent);
	}

	home.localEval = function(evalString) {
		return (function() { return eval(evalString); })();
	}

	home.globalEval = function(evalString) {
		return (function() { return window.eval(script); })();
	}

	// Load the resource and evaluate it in global context. Return the evaluated result.
	home.evalScript = function(path) {
		var script = null;
		var req = st.createRequest();
		req.open("GET", st.fullURL(path), false);
		req.send(null);
		if (req.status == 200) {
			script = req.responseText;
		} else {
			throw "Could not load file: " + path;
		}
		// The scripts need global context
		return st.globalEval(script);
	};

	home.addScriptTags = function(scriptNames) {
		var i = 0;
		var callback = function() {
			if (i < scriptNames.length) {
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.language = "javascript";
				script.onreadystatechange = callback;
				script.onload = callback;
				script.src = st.fullURL(scriptNames[i]);
				document.getElementsByTagName('HEAD')[0].appendChild(script);
				i++;
			}
		};
		callback();
	};

	home.createRequest = function() {
		return new XMLHttpRequest();
	};

	// Skip adding the session-id when loading static files.
	// This way, the browser identifies the files as same files and keeps breakpoints
	home.fullURL = function(urlPath) {
		if (home.isExternal(urlPath)) {
			return urlPath;
		}
		var baseUrl = document.location.href;
		if (!(/\/$/.test(baseUrl))){
			baseUrl = baseUrl + "/";
		}
		return baseUrl + urlPath;
	}

	home.isExternal = function(urlPath) {
		return (/^http(s)?:\/\//.test(urlPath));
	}

})();
