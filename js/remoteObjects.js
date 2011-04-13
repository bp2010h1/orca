// FILE DESCRIPTION

// Setup depends on: classes
// Runtime depends on: communication.js, server.js

// API:
// st.box(anyObject)

// Settings:
// home.METHOD_INVOKATION_URL (String)


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
			// 		} else {
			if (st.unbox(receiver.isBehavior()) && st.unbox(message.selector()) == "newOnServer"){
				data = "newObjectOfClassNamed=" + st.communication.realEscape(receiver.name()._unbox());
			} else {
				receiver.error_(string("Unexpected remote message send."));
			}
		}
		var remoteObject = OrcaRemoteObject._newInstance();
		remoteObject._remoteID = st.communication.sendSynchronously(data, st.communication.MESSAGE_SEND_URL);
		return remoteObject;
	}
	
	// 
	// Private
	//	
	
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