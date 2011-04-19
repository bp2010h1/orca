// FILE DESCRIPTION

// Setup depends on: classes
// Runtime depends on: communication.js, server.js

// API:
// TOTO add API-functions

// Wrapps the old
// st.communication.MESSAGE_HANDLER

(function() {
	
	// Set up the namespace
	var home = window.st ? window.st : (window.st = {});	
	
	// 
	// API functions
	//
	
	home.passMessage = function(receiver, message) {
		var data;
		var answerString;
		var resultObject;
		if (st.unbox(receiver.isRemote())) { 
			 // for test purposes just for unary messages now
			 // TODO: other messages
			 data =  "rid=" + st.communication.realEscape(receiver._remoteID) +
			 	"&selector=" + st.communication.realEscape(st.unbox(message.selector()));
		} else {
			if (st.unbox(receiver.isBehavior()) && st.unbox(message.selector()) == "newOnServer"){
				data = "newObjectOfClassNamed=" + st.communication.realEscape(st.unbox(receiver.name()));
			} else {
				receiver.error_(string("Unexpected remote message send."));
			}
		}
		answerString = st.communication.sendSynchronously(data, st.communication.MESSAGE_SEND_URL);
		//If possible, substitute eval by a JSON-Parser, parsing eg: [ "testString", { "remoteId": 4}, true ]
		return convertAnswer(eval("st.wrapFunction(function(){ return " + answerString + "}).apply(st.nil);"));
	};
	
	var standardMessageHandler = home.communication.MESSAGE_HANDLER;
	home.communication.MESSAGE_HANDLER = function(message){
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
		var passedMessage = message.match(/rid=([0-9]+)&selector=([a-zA-Z0-9:]+)/);
		if (passedMessage !== null) {
			var remoteId = parseInt(passedMessage[1]);
			var selector = passedMessage[2];
			if (reachableObjectMap[remoteId]) {
				// TODO: it works only for unary message sends until now
				var answer = reachableObjectMap[remoteId].perform_(st.string(selector));
				return serializeOrExpose(answer);
			} else {
				return '{ "error": "RemoteObjectNotAvailable" }';
			}
		}
		return standardMessageHandler(message);
	};
	
	// 
	// Private
	//	
	
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
		//besser: Klassenvergleich? isArray?
		if (st.unbox(anObject.isArray())){
			result = "[";
			for (var i = 0; i < st.unbox(anObject.size()); i++){
				result += serializeOrExpose(anObject.at(st.number(i+1)));
				if(i < st.unbox(anObject.size()) - 1 ){
					result += ", ";
				}
			}
			return result + "]";
		}
		//else
		var remoteId = reachableObjectMap.length;
		reachableObjectMap[remoteId] = anObject;
		return '{ "remoteId": ' + remoteId + " }";
	};
	
	var convertAnswer = function (anObject){
		// these are the tree json-types: array, object, primitive
		if (typeof anObject == "Array") {
			return convertArrayAnswer(anObject);
		}
		if (typeof anObject == "object") {
			return convertObjectAnswer(anObject);
		}
		return anObject;
		
	};
	var convertArrayAnswer = function (anArray){
		var result = [];
		for(var i = 0; i < anArray.length; i++){
			result[i] = convertAnswer(anArray[i]);
		}
		return result;
	};
	var convertObjectAnswer = function (anObject){
		for (var aProperty in anObject){
			if (aProperty == "remoteId") {
				var remoteObject = OrcaRemoteObject._newInstance();
				remoteObject._remoteID = anObject.remoteId;
				return remoteObject;
			}
			if (aProperty == "error") {
				return st.Error.signal_(st.string(anObject.error));
			}
		}
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
			}
		}
	});
	// Remove the OrcaBox class from the st-namespace, since remoteObjects are only created here
	var OrcaRemoteObject = st.OrcaRemoteObject;
	delete st.OrcaRemoteObject;

})();