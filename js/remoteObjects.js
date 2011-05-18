
// Setup depends on: communication.js
// Runtime depends on: helpers.js

// API:
// st.passMessage(receiver, message)

// Wrapps the old
// st.communication.ILLEGAL_GLOBAL_HANDLER

(function() {

	// Set up the namespace
	var home = window.st ? window.st :  (window.st = {});

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
			if (st.unbox(receiver.isBehavior())){
				if (st.unbox(message.selector()) == "newOnServer") {
					data = "classNamed=" + st.escapeAll(st.unbox(receiver.name())) + "&newInstance=true";
				} else if (st.unbox(message.selector()) == "asRemote") {
					data = "classNamed=" + st.escapeAll(st.unbox(receiver.name()));
				}
			} 
			if (!data) {
				receiver.error_(string("Unexpected remote message send."));
			}
		}
		answerString = st.communication.send(data, "remote");
		//If possible, substitute eval by a JSON-Parser, parsing eg: [ "testString", { "remoteID": 4}, true ]
		return convertAnswer(evalHandler()(answerString));
	};

	// 
	// Private
	// 

	var evalHandler = function() { return st.communication.getMessageHandler("code"); };

	// Set the ILLEGAL_GLOBAL_HANDLER to allow remote-object creation
	var standardIllegalGlobalHandler = home.ILLEGAL_GLOBAL_HANDLER;
	st.ILLEGAL_GLOBAL_HANDLER = function (globalName) {
		var referredClass = ReferredClass._newInstance();
		referredClass._name = globalName;
		return referredClass;
	}

	// Set the message-handler to handle remote-message-calls
	st.communication.addMessageHandler("remote", function () {
		var newOnClientCall = message.match(/newObjectOfClassNamed=([A-Za-z]+)/);
		if (newOnClientCall !== null) {
			var className = newOnClientCall[1];
			var remoteID;
			if(st[className]){
				remoteID = reachableObjectMap.length;
				reachableObjectMap[remoteID] = st[className]._new();
				return '{ "remoteID": ' + remoteID + " }";
			} else {
				return '{ "error": "ClassNotFound" }';
			}
		}
		var passedMessage = message.match(/rid=([0-9]+)&message=([^&]+)/);
		if (passedMessage !== null) {
			var remoteID = parseInt(passedMessage[1]);
			var reachableObject = reachableObjectMap[remoteID];
			var messageJson = evalHandler()(passedMessage[2]);
			if (reachableObject) {
				var args = [];
				for (var i=0; i<messageJson.args.length; i++) {
					args[i] = convertAnswer(evalHandler()(messageJson.args[i]));
				}
				var selector = evalHandler()(messageJson.selector);
				var message = st.Message.selector_arguments_(selector, args);
				var answer = message.sendTo_(reachableObject);
				return serializeOrExpose(answer);
			} else {
				return '{ "error": "RemoteObjectNotAvailable" }';
			}
		}
	})

	// parameters of message sends to remoteObjects and return values of message sends to reachable objects
	// need to be transmitted either as JSON objects (boolean, number, string, null) or a new reachable object
	// needs to be created
	var serializeOrExpose = function (anObject){
		if (anObject.isRemote && st.unbox(anObject.isRemote())){
			return '{ "reachableObject": ' + anObject._remoteID + " }";
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
				result += serializeOrExpose(anObject._arguments().at_(st.box(i)));
				if (i !== length) result += ",";
			}
			result += "]";
			return result + "}";
		}
		//else
		var remoteID = reachableObjectMap.length;
		reachableObjectMap[remoteID] = anObject;
		return '{ "remoteID": ' + remoteID + " }";
	};

	var convertAnswer = function (anObject){
		if (typeof anObject == "object") {
			return convertObjectAnswer(anObject);
		}
		// signal an error? this should not happen, because we now send serialized primitives
		return anObject;
	};

	var convertObjectAnswer = function (anObject){
			if (anObject.remoteID !== undefined && typeof anObject.remoteID === "number") {
				var remoteObject = OrcaRemoteObject._newInstance();
				remoteObject._remoteID = anObject.remoteID;
				return remoteObject;
			}
			if (anObject.error !== undefined && typeof anObject.error !== "function") {
				return st.Error.signal_(st.box(anObject.error));
			}			
			//Thesis: now, we have only primitive-Objects serialized?
			return anObject;
	};

	// Set up the Remote Object Map
	var reachableObjectMap = [];

	var reachableObjectNamed = function (anIdentifier){
		if (reachableObjectMap[anIdentifier] === undefined){
			return st.Error.signal_(st.box("Returned an ReachableObject which does not exist on this Client."));
		}
		return reachableObjectMap[anIdentifier];
	};

	// Proxy class for objects living on the server
	st.klass("OrcaRemoteObject", {
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

	// A class that can only be used for creating remote obects on the server
	// ReferredClass should only implement methods do indicate its a class and Object's newOnServer and asRemote
	st.klass("ReferredClass", {
		superclass: st.doesNotUnderstandClass,
		instanceVariables: ["_name"],
		instanceMethods: {
			newOnServer: function() {return st.Object.newOnServer.apply(this, arguments)},
			asRemote: function() {return st.Object.asRemote.apply(this, arguments)},
			halt: function() {return st.Object.halt.apply(this, arguments)},
			isBehavior: function() {return st.ProtoObject.isBehavior.apply(this, arguments)},
			doesNotUnderstand_: function() {return st.Object.doesNotUnderstand_.apply(this, arguments)},
			isRemote: function() {return st.false},
			isReferredClass: function() {return st.true},
			name: function() {return st.box(this._name)}
		}
	});
	// Remove the OrcaRemoteObject and ReferredClass classes from the st-namespace, since those are only created here
	var OrcaRemoteObject = st.OrcaRemoteObject;
	delete st.OrcaRemoteObject;
	var ReferredClass = st.ReferredClass;
	delete st.ReferredClass;

})();