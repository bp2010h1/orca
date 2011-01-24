TEST_RESULTS = {
    green: 0,
    red: new Array()
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