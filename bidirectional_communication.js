var data = null;
var request = null;

function createXmlRequest() {
	return new XMLHttpRequest();
}

function poll() {
	request = createXmlRequest();
	request.open("GET", "/xml", true);
	request.onreadystatechange = requestHandler;
	request.send(null);
}

function requestHandler() {
	if (request.readyState == 4) {
		if (request.status == 200) {
			var xml = request.responseXML.getElementsByTagName("data")[0].firstChild.data;
			log(request.status, decodeURIComponent(xml));
			poll();
		}
		else {
			log(request.status, null);
		}
	}
}

function send() {
	stop();
	data = document.getElementById("input").value;
	if (data != "") {
		request = createXmlRequest();
		request.open("POST", "/put", true);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		request.onreadystatechange = responseHandler;
		request.send(encodeURIComponent(data));
	}
}

function responseHandler() {
	if ((request.readyState == 4) && (request.status == 201)) {
		log(201, data);
		poll();
	}
}

function stop() {
	if (request != null) {
		request.abort();
		request = null;
	}
}

function log(httpStatus, content) {
	if ((httpStatus == 200) || (httpStatus == 201)) {
		var evaluatedContent;
		try {
				evaluatedContent = eval(content);
			prependRow("green", httpStatus, content, evaluatedContent);
		}
		catch(error) {
			prependRow("red", httpStatus, content, error);
		}
	}
	else if (httpStatus == 204) {
		prependRow("yellow", httpStatus, "No content", "");
	}
	else {
		prependRow("yellow", httpStatus, "Client aborted", "");
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
	var logData = document.createElement("td");
	logData.innerHTML = logText;
	row.appendChild(logData);
	var evalData = document.createElement("td");
	evalData.innerHTML = evalText;
	row.appendChild(evalData);
	return row;
}

function clearLog() {
	var tbody = document.getElementsByTagName("tbody")[0];
	while (tbody.childNodes.length > 0) {
		tbody.removeChild(tbody.childNodes[0]);
	}
}