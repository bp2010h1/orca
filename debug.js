function log(text) {
	//prependRow("green", text, null);
}

function info(text) {
	//prependRow("blue", null, text, null);
}

function log(httpStatus, content) {
	if ((httpStatus == 200) || (httpStatus == 201)) {
		var evaluatedContent;
		try {
			evaluatedContent = eval(content);
			//prependRow("green", httpStatus, content, evaluatedContent);
		}
		catch(error) {
			//prependRow("red", httpStatus, content, error);
		}
	}
	else if (httpStatus == 204) {
		//prependRow("yellow", httpStatus, "No content", "");
	}
	else {
		//prependRow("yellow", httpStatus, "Client aborted", "");
	} 
}
	
function prependRow(cssClass, httpStatus, logText, evalText) {
	var tbody = document.getElementsByTagName("tbody")[0];
	var firstRow = tbody.getElementsByTagName("tr")[0];
	var newRow = row(cssClass, httpStatus, logText, evalText);
	tbody.insertBefore(newRow, firstRow);
}

function row(cssClass, httpStatus, logText, evalText) {
	var row = document.createElement("tr");
	row.setAttribute("class", cssClass);
	var httpData = document.createElement("td");
	httpData.innerHTML = httpStatus;
	row.appendChild(httpData);
	var timeData = document.createElement("td");
	timeData.innerHTML = getTime();
	row.appendChild(timeData);
	var logData = document.createElement("td");
	logData.innerHTML = logText;
	row.appendChild(logData);
	var evalData = document.createElement("td");
	evalData.innerHTML = evalText;
	row.appendChild(evalData);
	return row;
}

function getTime() {
	var now = new Date();
	var hours = twoDigit(now.getHours());
	var minutes = twoDigit(now.getMinutes());
	var seconds = twoDigit(now.getSeconds());
	return hours + ":" + minutes + ":" + seconds;
}

function twoDigit(digit) {
	if (digit < 10) return "0" + digit;
	return digit;
}

function clearLog() {
	var tbody = document.getElementsByTagName("tbody")[0];
	while (tbody.childNodes.length > 0) {
		tbody.removeChild(tbody.childNodes[0]);
	}
}
