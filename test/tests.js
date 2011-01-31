
// This script must be loaded after squeaky.js to apply this switch-setting!
DEBUG = false;

var S2JTestScripts = [ "test_squeakyJS.js", "test_blocks.js", "test_super.js" ];

//TestResultBox
var TextBox = function(aNode, aMessage){
	this.textNode = document.createElement("div");
	this.textNode.className = "textBox";
	this.parentNode = aNode;
	this.textNode.innerHTML = aMessage;
	return this;
};
TextBox.prototype.show = function(event, toggleDurability){
		if(!this.durable){
			this.parentNode.appendChild(this.textNode);
			this.textNode.style.top = event.pageY + 1 + "px";
			this.textNode.style.left = event.pageX + 1 + "px";
		}
		if(toggleDurability){
			this.durable = !(this.durable || false);
		}
};
TextBox.prototype.hide = function(){
	if(!this.durable){
		this.parentNode.removeChild(this.textNode);
	}
};
	
// Everything here is executed directly from this S2JTests-object. So we can use this to access other methods in this "namespace".
var S2JTests = {

	// This determines which application is used to load the js-scripts and compiled classes
	APP_NAME: null,

	// This will be the html-element, that contains the test-results
	RESULT_CONTAINER: null,

	// Remember the currently run script and test
	currentScript: null,
	currentTest: null,

	// Exception-object to signalize assert-fails
	ASSERT_FAIL: function(message) { this.IS_ASSERT_FAIL = true; this.message = message; },

	getAppName: function() {
		if (this.APP_NAME === null) {
			throw "Cannot load file/script: APPLICATION_NAME is not set. Use these functions only from test-scripts executed with runTestScripts().";
		}
		return this.APP_NAME;
	},

	TEST_RESULTS: {
		ok: 0,
		fail: new Array(),
		error: new Array()
	},

	logError: function(errorArray, exception_message, error_type) {
		error_type = this.currentScript + "/" + this.currentTest + ": " + error_type;
		if(exception_message) {
			errorArray.push(exception_message);
		} else {
			errorArray.push(error_type);
		}
		console.log(error_type + ". Message: " + exception_message);
	},
	
	showResult: function(colorClass, message, errorMessage) {
		var result = document.createElement("li");
		result.setAttribute("class", colorClass);
		result.innerHTML = message;
		var textBox = new TextBox(result, errorMessage);
		if(errorMessage){
			result.onclick = function(aBox){ return function(event){ aBox.show(event, true); }}(textBox);
			result.onmouseover = function(aBox){ return function(event){ aBox.show(event, false); }}(textBox);
			result.onmouseout = function(aBox){ return function(event){ aBox.hide(); }}(textBox);
		}
		this.RESULT_CONTAINER.appendChild(result);
	},

	assert: function(condition, exception_message) {
		if (!condition) {
			throw new this.ASSERT_FAIL(exception_message);
		}
	},

	testFailed: function(exception_message) {
		this.showResult("red", "ERROR");
		this.logError(this.TEST_RESULTS.error, exception_message, "Error running test");
	},

	GET: function(path) {
		var req = new XMLHttpRequest();
		req.open("GET", path, false);
		req.send(null);
		if (req.status == 200) {
			return req.responseText;
		} else {
			throw "Could not load file: " + path;
		}
	},

	// This loads a script and evaluates it. Directory "test/" is prepended.
	// The script must be thought of as a big function returning one object.
	// The returned object is iterated and each function-slot starting with test* is executed as test-case.
	// If the slot/function setUp is present, it is called before each test*-function.
	// If the slot (string) testedApp is present, the named application is used to load scripts (instead of default test).
	runTestScript: function(scriptName) {
		this.currentScript = scriptName;
		this.currentTest = "(?)";
		var tester = null;
		try {
			this.APP_NAME = "test";
			tester = this.loadScript("test/" + scriptName);
		} catch (e) {
			this.testFailed("Could not load and evaluate script. " + e);
		}
		if (tester) {
			if (tester.testedApp !== undefined) {
				this.APP_NAME = tester.testedApplication;
			} else {
				this.APP_NAME = "test";
			}
			var setup = tester.setUp;
			for (mt in tester) {
				if (mt.indexOf("test") === 0 && typeof tester[mt] === "function") {
					this.currentTest = mt;
					if (setup !== undefined) {
						try {
							setup();
						} catch (e) {
							this.testFailed("SetUp failed. " + e);
						}
					}
					try {
						tester[mt].apply(tester);
						this.showResult("green", "OK");
						this.TEST_RESULTS.ok++;
					} catch (e) {
						if (e.IS_ASSERT_FAIL === true) {
							this.showResult("yellow", "FAIL");
							this.logError(this.TEST_RESULTS.fail, e.message,  "Assertion failed");
						} else {
							this.testFailed(e);
						}
					}
				}
			}
		}
	},

	loadFile: function(fileName) {
		var script = this.GET(fileName);
		return window.eval(script); // The scripts need global context
	},

	loadClasses: function() {
		return this.loadFile(this.getAppName() + "/classes");
	},

	loadScript: function(scriptName) {
		return this.loadFile(this.getAppName() + "/file/" + scriptName);
	},

	setupSqueakEnvironment: function() {
		this.loadClasses();
		this.loadScript("bootstrap.js");
		this.loadScript("kernel_primitives.js");
	},

	runTests: function(){
		this.RESULT_CONTAINER = document.createElement("ul");
		document.getElementsByTagName("body")[0].appendChild(this.RESULT_CONTAINER);

		// The tests are executed directly in these files
		for (testScript in S2JTestScripts) {
			this.runTestScript(S2JTestScripts[testScript]);
		}

		// Send the results to the server
		S2JServer.performOnServer("[ :result | S2JJavascriptTest reportJSResults: result ]", this.TEST_RESULTS.fail.length + this.TEST_RESULTS.error.length);
	}

};

// For shorter test-code. Must apply the method in the context of the namespace.
var assert = function() { S2JTests.assert.apply(S2JTests, arguments); };
