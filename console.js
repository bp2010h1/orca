
var S2JConsole = {

	// 
	// Settings
	// 

	USE_HTML_CONSOLE: false,
	USE_FIREBUG: true,

	// 
	// API methods
	// 

	debug: function(text) {
		this.log(text, "yellow", "", "");
	},

	info: function(text) {
		this.log(text, "blue", "", "");
	},

	error: function(text) {
		this.log(text, "red", "", "");
	},

	statusInfo: function(content, httpStatus) {
		if ((httpStatus == 200) || (httpStatus == 201)) {
			var evaluatedContent;
			try {
				evaluatedContent = eval(content);
				this.log(content, "green", httpStatus, evaluatedContent);
			}
			catch(error) {
				this.log(content, "red", httpStatus, error);
			}
		}
		else if (httpStatus == 204) {
			this.log("No content", "yellow", httpStatus, "");
		}
		else {
			this.log("Client aborted", "yellow", httpStatus, "");
		} 
	},
	
	clearLog: function() {
		if (this.USE_HTML_CONSOLE) {
			var tbody = document.getElementsByTagName("tbody")[0];
			while (tbody.childNodes.length > 0) {
				tbody.removeChild(tbody.childNodes[0]);
			}
		}
	},

	// 
	// private methods, should not be used
	// 

	log: function(text) { // optional: all arguments of prependRow: cssClass, httpStatus, evalText
		if (this.USE_HTML_CONSOLE) {
			this.prependRow(arguments);
		}
		if (this.USE_FIREBUG) {
			console.log(text);
		}
	},

	prependRow: function(logText, cssClass, httpStatus, evaluatedData) {
		var tbody = document.getElementsByTagName("tbody")[0];
		var firstRow = tbody.getElementsByTagName("tr")[0];
		var newRow = this.row(cssClass, httpStatus, logText, evaluatedData);
		tbody.insertBefore(newRow, firstRow);
	},

	row: function(cssClass, httpStatus, logText, evaluatedData) {
		var row = document.createElement("tr");
		row.setAttribute("class", cssClass);
		var httpData = document.createElement("td");
		httpData.innerHTML = httpStatus;
		row.appendChild(httpData);
		var timeData = document.createElement("td");
		timeData.innerHTML = this.getTime();
		row.appendChild(timeData);
		var logData = document.createElement("td");
		logData.innerHTML = logText;
		row.appendChild(logData);
		var evalData = document.createElement("td");
		evalData.innerHTML = evaluatedData;
		row.appendChild(evalData);
		return row;
	},

	getTime: function() {
		var now = new Date();
		var hours = this.twoDigit(now.getHours());
		var minutes = this.twoDigit(now.getMinutes());
		var seconds = this.twoDigit(now.getSeconds());
		return hours + ":" + minutes + ":" + seconds;
	},

	twoDigit: function(digit) {
		if (digit < 10) return "0" + digit;
		return digit;
	}

}
