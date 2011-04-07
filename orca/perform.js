
// API:
// st.performImpl(aSmalltalkSelector)

(function() {

	// 
	// API functions
	// 

	st.performImpl = function(aSmalltalkSelector) {
		var theArguments = _toArray(arguments);
		theArguments.shift();
		var method = this[jsFunctionNameFor(_unboxObject(aSmalltalkSelector))];
		if (method !== undefined) {
			return method.apply(this, theArguments);
		} else {
			return this.doesNotUnderstand_(Message.selector_arguments_(aSmalltalkSelector, array(theArguments)));
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
		"volatile": "", "while": "", "with": "", "arguments": ""
	};

	var characterList = {
		":": '',
		"+": 'plus',
		"-": 'minus',
		"*": 'times',
		"/": 'slash',
		"\\": 'backslash',
		"~": 'tilde';
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
			return escapeCharacter + characterList(c);
		});
		return escapeReservedWord(result);
	};

})();
