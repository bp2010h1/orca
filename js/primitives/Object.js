
// Runtime depends on: boxing.js

(function() {

	st.Object._addInstanceMethods({
		
		doesNotUnderstand_: function(message) {
			// TODO implement this correctly
			var msg = this + "(instance of " + this._class().name() + 
					") did not understand " + st.unbox(message.selector());
			st.Exception.signal_(st.string(msg));
		},
		
		_class: function() { return this._theClass; },
		
		halt: function() { debugger; },
		
		// st.perform is implemented in boxing.js
		perform_: st.perform,
		perform_with_: st.perform,
		perform_with_with_: st.perform,
		perform_with_with_with_: st.perform,
		perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection){
			return st.perform.apply(this, st.unbox(anArgumentsCollection));
		}
		
	});

})();
