
// Runtime depends on: classes, boxing.js, helpers.js

// API:
// st.perform(aSmalltalkSelector)

(function() {

	// Set up Namespace
	var home = window.st ? window.st : (window.st = {});

	// 
	// API functions
	// 

	home.perform = function(aSmalltalkSelector) {
		var theArguments = st.toArray(arguments);
		theArguments.shift();
		var method = this[jsFunctionNameFor(st.unbox(aSmalltalkSelector))];
		if (method !== undefined) {
			return method.apply(this, theArguments);
		} else {
			return this.doesNotUnderstand_(st.Message.selector_arguments_(aSmalltalkSelector, st.array(theArguments)));
		}
	};

	// 
	// Private functions and variables
	// 

	var escapeCharacter = "_";

	var reservedWords = {
		"abstract": "", "as": "", "boolean": "", "break": "", 
		"byte": "", "case": "", "catch": "", "char": "", 
		"class": "", "continue":	"", "const": "", "debugger": "", 
		"default": "", "delete": "", "do": "", "double": "", 
		"else": "", "enum": "", "export": "", "extends": "", 
		"false": "", "final": "", "finally": "", "float": "",
		"for": "", "function": "", "goto": "", "if": "",
		"implements": "", "import": "", "in": "", "instanceof": "",
		"int": "", "interface": "", "is": "", "long": "",
		"namespace": "", "native": "", "new": "", "null": "",
		"package": "", "private": "", "protected": "", "public": "", 
		"return": "", "short": "", "static": "", "super": "", 
		"switch": "", "synchronized": "", "this": "", "throw": "", 
		"throws": "", "transient": "", "true": "", "try": "", 
		"typeof": "", "use": "", "var": "", "void": "", 
		"volatile": "", "while": "", "with": "", "arguments": "",
		
		"st": "" // Our namespace
	};

	var characterList = {
		":": '',
		"+": 'plus',
		"-": 'minus',
		"*": 'times',
		"/": 'slash',
		"\\": 'backslash',
		"~": 'tilde',
		"<": 'less',
		">": 'greater',
		"=": 'equals',
		"@": 'at',
		"%": 'percent',
		"&": 'and',
		"?": 'question',
		"!": 'exclamation',
		"`": 'backtick',
		",": 'comma',
		"±": 'plusminus',
		"|": 'pipe'
	};

	var replacedChars = /[:+-\/\\~<>=@%&?!`,|±]/g;

	var escapeReservedWord = function(aString) {
		if (aString) {
			return (reservedWords[aString] ? escapeCharacter : "") + aString;
		}
	};

	// this function is a paralleled reimplementation of OrcaSqueakAstToJsAst class>>#jsFunctionNameFor:
	var jsFunctionNameFor = function(aJsString) {
		var result = aJsString.replace(replacedChars, function(c) {
			return escapeCharacter + characterList[c];
		});
		return escapeReservedWord(result);
	};

})();
