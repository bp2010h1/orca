
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
		throw "Could not load script: " + path;
	}
}

// This loads a script and evaluates it. The script must be thought of as a big function returning one object.
// The returned object is iterated and each function-slot starting with test* is executed as test-case.
runTestScript = function(scriptName) {
	var tester = null;
	try {
		tester = loadScript(scriptName);
	} catch (e) {
		assert(false, "Could not load and evaluate test-script: " + scriptName);
	}
	if (tester != null) {
		for (mt in tester) {
			if (mt 
		}
	}
}

loadScript = function(scriptName) {
	var script = GET("test/file/" + scriptName);
	return eval(script);
}

setupSqueakEnvironment = function() {
	loadScript("test/classes");
	loadScript("bootstrap.js");
	loadScript("kernel_primitives.js");
}
