
//this function is a paralleled reimplementation of S2JSqueakAstToJsAst class>>#jsFunctionNameFor:
//to avoid filling the global namespace, I wrote a function which invoked will return the right function
var _jsFunctionNameFor_ = (function (){
	
	var escapeCharForMethod = "_";
	
	var reservedWords = {
		"abstract": "", "as": "", "boolean": "", "break": "", 
		"byte": "", 	"case": "", "catch": "", "char": "", 
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
		"Object": "", "Function": "", "Number": "", "Array": "", 
		"String": ""
	};
	
	var escapeReservedWord = function (aString){
			if (aString !== undefined){
				if (reservedWords[aString]){
					return escapeCharForMethod + aString;
				} else {
					return aString;
				}
			}
		};

	var characterList = function (c){
		switch(c){
			case ":": return '';
			case "+": return 'plus';
			case "-": return 'minus';
			case "*": return 'times';
			case "/": return 'slash';
			case "\\": return 'backslash';
			case "~": return 'tilde';
			case "<": return 'less';
			case ">": return 'greater';
			case "=": return 'equals';
			case "@": return 'at';
			case "%": return 'percent';
			case "&": return 'and';
			case "?": return 'question';
			case "!": return 'exclamation';
			case "`": return 'backtick';
			case ",": return 'comma';
			case "±": return 'plusminus';
			case "|": return 'pipe';
			default: return c;
	}};

	return function (aJsString){
		var result = aJsString.replace(/[:+-\/\\~<>=@%&?!`,|±]/g, function (c){
				return escapeCharForMethod + characterList(c);
			});
		return escapeReservedWord(result);
	};
})();

// This adds a function-name, that is handled by 
var _addDoesNotUnderstand = function(methodName) {
	var newMethods = {};
	newMethods[_jsFunctionNameFor_(methodName)] = function() {
		return this.doesNotUnderstand_(
			Message.selector_arguments_(string(methodName), array(_toArray(arguments)))); };
	_DoesNotUnderstandClass_._addInstanceMethods(newMethods);
}
