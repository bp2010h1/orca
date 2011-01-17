var SERVER = {
	
	_waitingForResponse: null,
	_result: null,
	
	performOnServer : function (classname, selector, stringArgument) {
		// Object >> perform: selector withArguments: argArray
		var command = "INVOKE: " + classname + "." + selector;		
		if (arguments.length == 3) {
		  command = command + "." + stringArgument;
		}
		CONNECTION.send(command);
		SERVER._waitingForResponse = true;
		
		/*while(SERVER._waitingForResponse) {
			// busy wait
		}*/
		waitFor(SERVER._waitingForResponse == false)
		
		return SERVER._result;
	},
	
	callback : function(result) {
		// response handled through comet or sockets will
		// contain as result a function call like "callback(result)"
		alert(result);
		SERVER._result = result;
		SERVER._waitingForResponse = false;
	}
	
}


var waitFor = function( params )
  {
      var condition  = params.condition;
      var callback   = params.callback;
      var interval   = params.interval || 100;
      var maxTries   = params.maxTries || 7;
      var currentTry = params._currentTry || 0; // private

      // If condition passes, run the code
      if ( condition() === true )
          return callback();

      // Limit the # of attempts
      if ( currentTry < maxTries )
      {
          // Increment the attempt #
          params._currentTry = currentTry+1;

          // Create the recursive call
          var f = function() { return waitFor( params ); }

          // Wait for one interval and execute
          setTimeout( f, interval );
      }
      else
      {
          // alert( 'Maximum tries used for waitFor()...quitting' );
      }
  };