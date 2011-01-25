
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

loadScript = function(scriptName) {
	var result;
	try {
		var script = GET("test/file/" + scriptName);
		result = eval(script);
	} catch (e) {
		debugger;
	}
	return result;
}

setupSqueakEnvironment = function() {
	// this must be printed from the image using "S2JApp writeClassesToFile: 'the/current/dir/classes.js'"
	loadScript("test/resources/compiled_classes.js");
	loadScript("bootstrap.js");
	loadScript("kernel_primitives.js");
}
