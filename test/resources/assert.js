
assert = function(condition, exception_message) {
    var result = document.createElement("li");

    if(condition) {
        result.setAttribute("class", "green");
        result.innerHTML = "OK";
    }
    else {
        result.setAttribute("class", "red");
        result.innerHTML = "FAIL";        
    }
    
    testResults.appendChild(result);
}