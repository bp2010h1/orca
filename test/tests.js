
// This script must be loaded after squeaky.js to apply this switch-setting!
DEBUG = false;

var S2JTestScripts = [ "test_squeakyJS.js", "test_blocks.js", "test_super.js", "test_communication.js" ];

// This variable is used by tests to send some kind of result back to the server. This removes the need to load classes (like ByteString)
var S2JmockTestResult = "abc123";

var S2JTests = {

	// If this is set to true, a test, that fails (or throws an error) is executed again.
	// Only works for the actual test, not the setup or if loading the script fails.
	DEBUG_ON_ERROR: false,

	// 
	// Test API
	// 
	
	// Run all tests defined in the array S2JTestScripts
	runTests: function() {
		this.RESULT_CONTAINER = document.createElement("ul");
		document.getElementsByTagName("body")[0].appendChild(this.RESULT_CONTAINER);

		// The tests are executed directly in these files
		for (testScript in S2JTestScripts) {
			var script = S2JTestScripts[testScript];
			if (typeof script == "string") {
				this.runTestScript(script);
			}
		}

		// Send the results to the server
		S2JServer.performOnServer("[ :result | S2JJavascriptTest reportJSResults: result ]", this.TEST_RESULTS.fail.length + this.TEST_RESULTS.error.length);
	},
	
	// Simply load the resource (relative to root)
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

	// Load the resource and evaluate it in global context. Return the evaluated result.
	loadFile: function(fileName) {
		var script = this.GET(fileName);
		return (function() { return window.eval(script); })(); // The scripts need global context
	},

	// Load and evaluate the compiled squeak-classes
	loadClasses: function() {
		return this.loadFile("classes");
	},

	// Load the resource distributed from our file-handler in the image
	loadScript: function(scriptName) {
		return this.loadFile("file/" + scriptName);
	},

	// Load all resources needed to setup the squeak-environment on the client
	setupSqueakEnvironment: function() {
		this.loadClasses();
		this.loadScript("bootstrap.js");
		this.loadScript("kernel_primitives.js");
	},
	
	// Run one test-script.
	// This loads a script and evaluates it. Directory "test/" is prepended.
	// The script must be thought of as a big function returning one object.
	// The returned object is iterated and each function-slot starting with test* is executed as test-case.
	// If the slot/function setUp is present, it is called before each test*-function.
	// If the slot (string) testedApp is present, the named application is used to load scripts (instead of default test).
	runTestScript: function(scriptName) {
		S2JConsole.info("Running test-script " + scriptName + "...");
		this.currentScript = scriptName;
		this.currentTest = "(?)";
		var tester = null;
		
		this.tryCatch(function() {
			this.APP_NAME = "test";
			tester = this.loadScript("test/" + scriptName);
		}, function(e) {
			this.testError("Could not load and evaluate script. " + e);
		});
		if (tester) {
			if (tester.testedApp !== undefined) {
				this.APP_NAME = tester.testedApplication;
			} else if (setup !== undefined) {
				this.APP_NAME = "test";
			}
			var setup = tester.setUp;
			for (mt in tester) {
				if(/^test/.test(mt) && typeof tester[mt] === "function"){
					this.currentTest = mt;
					this.tryCatch(function() {
						if (setup !== undefined) {
							setup.apply(tester);
						}
						this.tryCatch(function() {
								tester[mt].apply(tester);
								this.testOk();
							}, function(e) {
								if (e.S2J_IS_ASSERT_FAIL === true) {
									this.testFail(e.message);
								} else {
									this.testError(e);
								}
							});
					}, function(e) {
						this.testError("SetUp failed. " + e);
					});
				}
			}
	  }
	},
	
	// 
	// Local variables
	// 
	
	// This determines which application is used to load the js-scripts and compiled classes
	APP_NAME: null,

	// This will be the html-element, that contains the test-results
	RESULT_CONTAINER: null,

	// Remember the currently run script and test
	currentScript: null,
	currentTest: null,
	
	// Exception-object to signalize assert-fails
	ASSERT_FAIL: function(message) { this.S2J_IS_ASSERT_FAIL = true; this.message = message; },

	TEST_RESULTS: {
		ok: 0,
		fail: new Array(),
		error: new Array()
	},
	
	// 
	// Private functions
	// 
	
	tryCatch: function(tryFunction, catchFunction) {
		try {
			tryFunction.apply(this);
		} catch(e) {
			catchFunction.apply(this, [e]);
			if (this.DEBUG_ON_ERROR) {
				debugger;
				// Step into this function to re-execute, what just has failed.
				tryFunction.apply(this);
			}
		}
	},
	
	// This is private, but exposed directly over the global method assert (defined below this namespace)
	assert: function(condition, exception_message) {
		if (!condition) {
			throw new this.ASSERT_FAIL(exception_message);
		}
	},
	
	getAppName: function() {
		if (this.APP_NAME === null) {
			throw "Cannot load file/script: APPLICATION_NAME is not set. Use these functions only from test-scripts executed with runTestScripts().";
		}
		return this.APP_NAME;
	},

	testError: function(message) {
		var message = this.logError(this.TEST_RESULTS.error, message, "Error running test");
		this.showResult("red", "ERROR", message);
	},
	
	testFail: function(message) {
		var message = this.logError(this.TEST_RESULTS.fail, message, "Assertion failed");
		this.showResult("yellow", "FAIL", message);
	},
	
	testOk: function() {
		this.TEST_RESULTS.ok++;
		this.showResult("green", "OK", this.currentTestName());
	},
	
	logError: function(errorArray, exception_message, error_type) {
		var message = this.currentTestName() + ": " + error_type + ". Message: " + exception_message;
		errorArray.push(message);
		S2JConsole.info(message);
		return message;
	},

	currentTestName: function() {
		return this.currentScript + "/" + this.currentTest;
	},
	
	showResult: function(colorClass, message, errorMessage) {
		var result = document.createElement("li");
		result.setAttribute("class", colorClass);
		result.innerHTML = message;
		var textBox = new this.TextBox(result, errorMessage);
		result.onclick = function(event) { textBox.show(event, true); };
		result.onmouseover = function(event) { textBox.show(event, false); };
		result.onmouseout = function(event) { textBox.hide(); };
		this.RESULT_CONTAINER.appendChild(result);
	},

	// TestResultBox, shown on mouse-hovering of result-labels
	TextBox: function(aNode, aMessage) {
		this.textNode = document.createElement("div");
		this.textNode.className = "textBox";
		this.parentNode = aNode;
		this.textNode.innerHTML = aMessage;
		
		this.show = function(event, toggleDurability){
			if(!this.durable){
				this.parentNode.appendChild(this.textNode);
				this.textNode.style.top = event.pageY + 1 + "px";
				this.textNode.style.left = event.pageX + 1 + "px";
			}
			if(toggleDurability){
				this.durable = !(this.durable || false);
			}
		};
		this.hide = function(){
			if(!this.durable){
				this.parentNode.removeChild(this.textNode);
			}
		};
		return this;
	}
	
};

// For shorter test-code. Must apply the method in the context of the namespace.
var assert = function() { S2JTests.assert.apply(S2JTests, arguments); };

