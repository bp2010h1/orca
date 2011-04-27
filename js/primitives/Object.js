
// Runtime depends on: boxing.js, perform.js

(function() {

	var doesNotUnderstand = ;

	st.Object._addInstanceMethods({
		
		doesNotUnderstand_: function(message) {
			// TODO implement this correctly
			var msg = this + "(instance of " + this._class().name() + 
					") did not understand " + st.unbox(message.selector());
			st.Exception.signal_(st.string(msg));
		},
		
		_class: function() { return this._theClass; },
		
		halt: function() { debugger; },
		
		perform_: st.perform,
		perform_with_: st.perform,
		perform_with_with_: st.perform,
		perform_with_with_with_: st.perform,
		perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection){
			return st.perform.apply(this, st.unbox(anArgumentsCollection));
		}
		
	});
	st.Object._addClassMethods({
		newOnServer: function() {
			return st.passMessage(this, st.Message.selector_(st.string("newOnServer")));
		},
		halt: function() { debugger; },
		doesNotUnderstand_: function(message) {
			// TODO implement this correctly
			var msg = this + "(" + this.name() + " class" + 
					") did not understand " + st.unbox(message.selector());
			st.Exception.signal_(st.string(msg));
		}
	});

})();
