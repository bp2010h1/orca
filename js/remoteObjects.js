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
		if (st.unbox(receiver.isRemote())) { 
			// // for test purposes just for unary messages now
			// data = "messageSendFor=" + st.communication.realEscape(receiver._remoteID) 
			// + "&withSelector=" + st.communication.realEscape(st.unbox(message.selector()));
		} else {
			if (st.unbox(receiver.isBehavior()) && st.unbox(message.selector()) == "newOnServer"){
				data = "newObjectOfClassNamed=" + st.communication.realEscape(receiver.name()._unbox());
			} else {
				receiver.error_(string("Unexpected remote message send."));
			}
		}
		var remoteObject = OrcaRemoteObject._newInstance();
		remoteObject._remoteID = st.communication.sendSynchronously(data, st.communication.MESSAGE_SEND_URL);
		return remoteObject;
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
				return remoteId;
			} else {
				return "error=ClassNotFound";
			}
		}
		var passedMessage = message.match(/rid=([0-9]+)&selector=([a-zA-Z0-9:]+)/);
		if (passedMessage !== null) {
			var remoteId = parseInt(passedMessage[1]);
			var selector = passedMessage[2];
			if (reachableObjectMap[remoteId]) {
				// TODO: it works only for unary message sends until now
				return reachableObjectMap[remoteId].perform_(selector);
			} else {
				return "error=RemoteObjectNotAvailable";
			}
		}
		return standardMessageHandler(message);
	};
	
	// 
	// Private
	//	
	
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
				home.passMessage(this, message);
			}
		}
	});
	// Remove the OrcaBox class from the st-namespace, since remoteObjects are only created here
	var OrcaRemoteObject = st.OrcaRemoteObject;
	delete st.OrcaRemoteObject;

})();