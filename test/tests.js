
// This script must be loaded after squeaky.js to apply this switch-setting!
DEBUG = false;

var S2JTestScripts = [ "test_squeakyJS.js", "test_blocks.js" ];

var S2JTests = {

	// This determines which application is used to load the js-scripts and compiled classes
	APP_NAME: null,

	getAppName: function() {
		if (S2JTests.APP_NAME === null) {
			throw "Cannot load file/script: APPLICATION_NAME is not set. Use these functions only from test-scripts executed with runTestScripts().";
		}
		return S2JTests.APP_NAME;
	},

	TEST_RESULTS: {
		green: 0,
		red: new Array()
	},

	assert: function(condition, exception_message) {
		var result = document.createElement("li");
		
		if(condition) {
			result.setAttribute("class", "green");
			result.innerHTML = "OK";
			
			S2JTests.TEST_RESULTS.green++;
		}
		else {
			result.setAttribute("class", "red");
			result.innerHTML = "FAIL";
			if(exception_message) {
				S2JTests.TEST_RESULTS.red.push(exception_message);            
			} else {
				S2JTests.TEST_RESULTS.red.push("AssertionError");            
			}
		}
		
		testResults.appendChild(result);
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
		var tester = null;
		try {
			tester = S2JTests.loadScript("test/" + scriptName);
		} catch (e) {
			S2JTests.assert(false, "Could not load and evaluate test-script: " + scriptName);
		}
		if (tester != null) {
			if (tester.testedApp != undefined) {
				S2JTests.APP_NAME = tester.testedApplication;
			} else {
				S2JTests.APP_NAME = "test";
			}
			var setup = tester.setUp;
			for (mt in tester) {
				if (mt.indexOf("test") === 0 && typeof tester[mt] === "function") {
					if (setup != undefined) {
						setup();
					}
					tester[mt]();
				}
			}
		}
	},

	loadFile: function(fileName) {
		var script = S2JTests.GET(fileName);
		return eval(script);
	},

	loadClasses: function() {
		return S2JTests.loadFile(S2JTests.getAppName() + "/classes");
	},

	loadScript: function(scriptName) {
		return S2JTests.loadFile(S2JTests.getAppName() + "/file/" + scriptName);
	},

	setupSqueakEnvironment: function() {
		S2JTests.loadClasses();
		S2JTests.loadScript("bootstrap.js");
		S2JTests.loadScript("kernel_primitives.js");
	},

	runTests: function(){
		document.getElementsByTagName("body")[0].appendChild(document.createElement("ul"));
		
		// The tests are executed directly in these files
		for (testScript in S2JTestScripts) {
			S2JTests.runTestScript(testScript);
		}
		
		// Send the results to the server
		S2JConnection.connect();
		S2JConnection.send(S2JTests.TEST_RESULTS.red.length);
		S2JConnection.disconnect();
	}

}

// For shorter test-code
var assert = S2JTests.assert;
