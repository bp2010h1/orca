
// Setup depends on: classes
// Runtime depends on: communication.js, helpers.js

// API:
// st.passMessage(receiver, message)

// Settings:
// st.communication.MESSAGE_SEND_URL

// Wrapps the old
// st.communication.MESSAGE_HANDLER

(function() {

	// Set up the namespace
	var home = window.st ? window.st : (window.st = {});	

	// 
	// Settings
	// 

	if (!("MESSAGE_SEND_URL" in home)) home.MESSAGE_SEND_URL = "send";

	// 
	// API functions
	//

	home.passMessage = function(receiver, message) {
		var data;
		var answerString;
		var resultObject;
		if (st.unbox(receiver.isRemote())) { 
			 data = "rid=" + st.escapeAll(receiver._remoteID) +
			 	"&message=" + st.escapeAll(serializeOrExpose(message));
		} else {
			if (st.unbox(receiver.isBehavior()) && st.unbox(message.selector()) == "newOnServer"){
				data = "newObjectOfClassNamed=" + st.escapeAll(st.unbox(receiver.name()));
			} else {
				receiver.error_(string("Unexpected remote message send."));
			}
		}
		answerString = st.communication.sendAndWait(data, home.MESSAGE_SEND_URL);
		//If possible, substitute eval by a JSON-Parser, parsing eg: [ "testString", { "remoteId": 4}, true ]
		return convertAnswer(evalWrapped(answerString));
	};

	// 
	// Private
	// 

	// Set the message-handler to handle remote-message-calls
	var standardMessageHandler = home.communication.MESSAGE_HANDLER;
	st.communication.MESSAGE_HANDLER = function(message){
		var newOnClientCall = message.match(/newObjectOfClassNamed=([A-Za-z]+)/);
		if (newOnClientCall !== null) {
			var className = newOnClientCall[1];
			var remoteId;
			if(st[className]){
				remoteId = reachableObjectMap.length;
				reachableObjectMap[remoteId] = st[className]._new();
				return '{ "remoteId": ' + remoteId + " }";
			} else {
				return '{ "error": "ClassNotFound" }';
			}
		}
		var passedMessage = message.match(/rid=([0-9]+)&message=([^&]+)/);
		if (passedMessage !== null) {
			var remoteId = parseInt(passedMessage[1]);
			var reachableObject = reachableObjectMap[remoteId];
			var messageJson = evalWrapped(passedMessage[2]);
			if (reachableObject) {
				var args = [];
				for (var i=0; i<messageJson.args.length; i++) {
					args[i] = convertAnswer(evalWrapped(messageJson.args[i]));
				}
				var selector = evalWrapped(messageJson.selector);
				var message = st.Message.selector_arguments_(selector, args);
				debugger;
				var answer = message.sendTo_(reachableObject);
				return serializeOrExpose(answer);
			} else {
				return '{ "error": "RemoteObjectNotAvailable" }';
			}
		}
		return standardMessageHandler(message);
	};

	// parameters of message sends to remoteObjects and return values of message sends to reachable objects
	// need to be transmitted either as JSON objects (boolean, number, string, null) or a new reachable object
	// needs to be created
	var serializeOrExpose = function (anObject){
		if (anObject.isRemote && st.unbox(anObject.isRemote())){
			return '{ "remoteId": ' + anObject._remoteId + " }";
		}
		if (anObject.isNumber && st.unbox(anObject.isNumber())){
			return st.unbox(anObject).toString();
		}
		if (anObject.isString && st.unbox(anObject.isString())){
			return '"' + st.unbox(anObject).toString() + '"';
		}
		if (anObject === st.true || anObject === st.false){
			return st.unbox(anObject).toString();
		}
		if (anObject === st.nil){
			return "null";
		}
		if (anObject._class() === st.Message){
			var result = "{";
			result += '"selector": ' + serializeOrExpose(anObject.selector()) + ",";
			result += '"arguments": [';
			var length = st.unbox(anObject._arguments().size());
			for (var i=1; i<=length; i++) {
				result += serializeOrExpose(anObject._arguments().at_(st.number(i)));
				if (i !== length) result += ",";
			}
			result += "]";
			return result + "}";
		}
		//else
		var remoteId = reachableObjectMap.length;
		reachableObjectMap[remoteId] = anObject;
		return '{ "remoteId": ' + remoteId + " }";
	};

	var convertAnswer = function (anObject){
		if (typeof anObject == "object") {
			return convertObjectAnswer(anObject);
		}
		// signal an error? this should not happen, because we now send serialized primitives
		return anObject;
	};
	var convertObjectAnswer = function (anObject){
			if (anObject.remoteId !== undefined && typeof anObject.remoteId === "number") {
				var remoteObject = OrcaRemoteObject._newInstance();
				remoteObject._remoteID = anObject.remoteId;
				return remoteObject;
			}
			if (anObject.error !== undefined && typeof anObject.error !== "function") {
				return st.Error.signal_(st.string(anObject.error));
			}			
			//Thesis: now, we have only primitive-Objects serialized?
			return anObject;
	};
	
	var evalWrapped = function(aString) {
		return eval("st.wrapFunction(function(){ " + aString  + "}).apply(st.nil);");
	};

	// Set up the Remote Object Map
	var reachableObjectMap = [];

	// Class, that will ...
	st.class("OrcaRemoteObject", {
		superclass: st.doesNotUnderstandClass,
		instanceVariables: ['_remoteID'],
		instanceMethods: {
			isRemote: function() { 
				return st.true; 
			},
			doesNotUnderstand_: function(message) {
				return home.passMessage(this, message);
			},
			_equals: function(object) {
				if (object === undefined || object === null) return st.false;
				return st.box(this._remoteID == object._remoteID);
			}
		}
	});
	// Remove the OrcaBox class from the st-namespace, since remoteObjects are only created here
	var OrcaRemoteObject = st.OrcaRemoteObject;
	delete st.OrcaRemoteObject;

})();