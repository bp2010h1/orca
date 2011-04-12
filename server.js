var OrcaServer = {
	
	_waitingForResponse: null,
	
	realEscape: function(string) {
		// * @ - _ + . / are not escaped
		var result = escape(string);
			
		result = result.replace(/(\*)/g, "%2A");
		result = result.replace(/(\@)/g, "%40");
		result = result.replace(/(\-)/g, "%2D");
		result = result.replace(/(\_)/g, "%5F");
		result = result.replace(/(\+)/g, "%2B");
		result = result.replace(/(\.)/g, "%2E");
		result = result.replace(/(\/)/g, "%2F");
		return result;
	},
	
	performOnServer: function(squeakCode) {
		var length = arguments.length;
		var args = "";
		for (var i = 1; i < arguments.length; i++) {
		  // to make sure the arguments and code get sent properly we must url-encode them by escape
			args += "&arg" + (i - 1) + "=" + this.realEscape(arguments[i]);
		}
		var result = OrcaConnection.sendSynchronously("code=" + this.realEscape(squeakCode) + args, OrcaConnection.codeExecutionUrl());
		return eval(result);
	},
	
	passMessage: function(receiver, message) {
		if (false) {//(receiver.isRemote()){
			// transparent message passing
		} else {
			if (receiver.isBehavior() && message.selector()._unbox() == "newOnServer"){
				var data = "newObjectOfClassNamed=" + this.realEscape(receiver.name()._unbox());
				OrcaConnection.sendSynchronously(data, OrcaConnection.remoteMessageSendUrl());
			} else {
				receiver.error_(string("Unexpected remote message send."));
			}
		}
	}
	
}
