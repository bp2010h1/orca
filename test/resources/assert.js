
// This determines which application is used to load the js-scripts and compiled classes
var APP_NAME = null;

var getAppName = function() {
	if (APP_NAME === null) {
		throw "Cannot load file/script: APPLICATION_NAME is not set. Use these functions only from test-scripts executed with runTestScripts().";
	}
	return APP_NAME;
}

TEST_RESULTS = {
    green: 0,
    red: new Array()
}

initTestRunner = function() {
    testResults = document.createElement("ul");
    document.getElementsByTagName("body")[0].appendChild(testResults);
}

assert = function(condition, exception_message) {
    var result = document.createElement("li");
	
    if(condition) {
        result.setAttribute("class", "green");
        result.innerHTML = "OK";
		
        TEST_RESULTS.green++;
    }
    else {
        result.setAttribute("class", "red");
        result.innerHTML = "FAIL";
        if(exception_message) {
            TEST_RESULTS.red.push(exception_message);            
        } else {
            TEST_RESULTS.red.push("AssertionError");            
        }
    }
    
    testResults.appendChild(result);
}

GET = function(path) {
	var req = new XMLHttpRequest();
	req.open("GET", path, false);
	req.send(null);
	if (req.status == 200) {
		return req.responseText;
	} else {
		throw "Could not load file: " + path;
	}
}

// This loads a script and evaluates it. Directory "test/" is prepended.
// The script must be thought of as a big function returning one object.
// The returned object is iterated and each function-slot starting with test* is executed as test-case.
// If the slot/function setUp is present, it is called before each test*-function.
// If the slot (string) testedApp is present, the named application is used to load scripts (instead of default test).
runTestScript = function(scriptName) {
	var tester = null;
	try {
		tester = loadScript("test/" + scriptName);
	} catch (e) {
		assert(false, "Could not load and evaluate test-script: " + scriptName);
	}
	if (tester != null) {
		if (tester.testedApp != undefined) {
			APP_NAME = tester.testedApplication;
		} else {
			APP_NAME = "test";
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
}

loadFile = function(fileName) {
	var script = GET(fileName);
	return eval(script);
}

loadClasses = function() {
	return loadFile(getApplicationName() + "/classes");
}

loadScript = function(scriptName) {
	return loadFile(getApplicationName() + "/file/" + scriptName);
}

setupSqueakEnvironment = function() {
	loadClasses();
	loadScript("bootstrap.js");
	loadScript("kernel_primitives.js");
}
