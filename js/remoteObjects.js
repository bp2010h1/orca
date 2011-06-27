
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

	home.passMessage = function(receiver, message, messageType) {
		var message, answerString, resultObject;
		if (st.unbox(receiver.isRemote())) {
			var messageArgs = [];
			message._arguments().do_(st.block(function(each) {
				messageArgs.push(serializeOrExpose(each));
			}));
			message = {
				rid: receiver._remoteID,
				message: {
					selector: st.unbox(message.selector()),
					arguments: messageArgs
					}
				};
		} else if (st.unbox(receiver.isBehavior()) && st.unbox(message.selector()) == "asRemote"){
			message = { classNamed : st.unbox(receiver.name()) };
		}
		if (!message) {
			receiver.error_(string("Unexpected remote message send."));
		}
		message = JSON.stringify(message);
		if (messageType === "forked") {
			st.communication.sendForked(message, "remote");
			return st.nil;
		} else if (messageType === "blocked") {
			answerString = st.communication.send(message, "remote");
			return parseAnswer(JSON.parse(answerString));
		} else {
			throw "Remote message sends have to be either forked or blocked"; 
		}
		
	};

	// 
	// Private
	// 

	// Set the ILLEGAL_GLOBAL_HANDLER to allow remote-object creation
	var standardIllegalGlobalHandler = home.ILLEGAL_GLOBAL_HANDLER;
	st.ILLEGAL_GLOBAL_HANDLER = function (globalName) {
		var referredClass = ReferredClass._newInstance();
		referredClass._name = globalName;
		return referredClass;
	}

	// Set the message-handler to handle remote-message-calls
	st.communication.addMessageHandler("remote", function (messageString) {
		var message = JSON.parse(messageString);
		var answer;
		if ("remoteIdForClass" in message) {
			var className = message.remoteIdForClass;
			if (className in st) {
				var remoteID = reachableObjectMap.length;
				reachableObjectMap[remoteID] = st[className];
				answer = { rid: remoteID };
			} else {
				answer = { error: "ClassNotFound" };
			}
		} else if ("rid" in message && "message" in message) {
			var reachableObject = reachableObjectMap[message.rid];
			message = message.message;
			if (reachableObject) {
				var args = [];
				for (index in message.args) {
					args.push(parseAnswer(message.args[index]));
				}
				var messageInstance = st.Message.selector_arguments_(st.box(message.selector), st.box(args));
				try {
					var answerObject = messageInstance.sendTo_(reachableObject);
					answer = serializeOrExpose(answerObject);
				} catch (e) {
					var errorString = (e && e.messageText) ? st.unbox(e.messageText) : e+"";
					answer = { error: errorString };
				}
			} else {
				answer = { error: "RemoteObjectNotAvailable" };
			}
		}
		return JSON.stringify(answer);
	})

	var serializeOrExpose = function (anObject){
		// Always check first, whether the method (isString etc.) is present, before calling it
		// remote object is reachable on server-side
		if (anObject.isRemote && st.unbox(anObject.isRemote())){
			return { localRid: anObject._remoteID};
		}
		// immutables: serialized and transfered directly
		if (anObject.isNumber && st.unbox(anObject.isNumber()) ||
			anObject.isString && st.unbox(anObject.isString()) ||
			anObject === st.true || anObject === st.false || anObject ===  st.nil) {
				return st.unbox(anObject);
		}
		// object: transfer rid
		var remoteID = reachableObjectMap.indexOf(anObject)
		if (remoteID == -1 /*not included*/) {
			remoteID = reachableObjectMap.length;
			reachableObjectMap[remoteID] = anObject;
		} 
		return { rid: remoteID };
	};

	var parseAnswer = function (anObject) {
		if (typeof anObject == "object") {
			if ("rid" in anObject) {
				return OrcaRemoteObject.withId(anObject.rid);
			}
			if ("error" in anObject) {
				return st.Error.signal_(st.box(anObject.error));
			}
			if ("localRid" in anObject) { // Server sent an object, that lives on this client
				return reachableObjectMap[anObject.localRid];
			}
		}
		return st.box(anObject); // Immutable/primitive value
	};

	// Set up the Remote Object Map
	var reachableObjectMap = [];

	// Proxy class for objects living on the server
	st.klass("OrcaRemoteObject", {
		superclass: st.doesNotUnderstandClass,
		instanceVariables: ['_remoteID'],
		instanceMethods: {
			isRemote: function() { 
				return st.true; 
			},
			doesNotUnderstand_: function(message) {
				return home.passMessage(this, message, "blocked");
			},
			_equals: function(object) {
				if (object === undefined || object === null) return st.false;
				return st.box(this._remoteID == object._remoteID);
			},
			performForked_WithArguments_: function(selector, argsArray) {
				var message = st.Message.selector_arguments_(selector, argsArray);
				return home.passMessage(this, message, "forked");
			},
			performForked_: function(selector) {
				return this.performForked_WithArguments_(selector, st.Array.new_(st.number(0)));
			},
			performForked_With_: function(selector, anObject) {
				return this.performForked_WithArguments_(selector, st.Array.with_(anObject));
			},
			performForked_With_With_: function(selector, firstObject, secondObject) {
				return this.performForked_WithArguments_(selector, st.Array.with_with_(firstObject, secondObject));
			},
			performForked_With_With_With_: function(selector, firstObject, secondObject, thirdObject) {
				return this.performForked_WithArguments_(selector, st.Array.with_with_with_(firstObject, secondObject, thirdObject));
			}
		},
		classMethods: {
			withId: function(id) {
				var remoteObject = this._newInstance();
				remoteObject._remoteID = id;
				return remoteObject;
			}
		}
	});

	// A class that can only be used for creating remote obects on the server
	st.klass("ReferredClass", {
		superclass: st.doesNotUnderstandClass,
		instanceVariables: ["_name"],
		// Instances of ReferredClass are used to replace/proxy classes
		instanceMethods: {
			asRemote: function() {return st.Object.asRemote.apply(this, arguments)},
			halt: function() {return st.Object.halt.apply(this, arguments)},
			isBehavior: function() {return st.ProtoObject.isBehavior.apply(this, arguments)},
			doesNotUnderstand_: function() { standardIllegalGlobalHandler(this._name); },
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
