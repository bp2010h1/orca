
// Runtime depends on: boxing.js, perform.js

(function() {

	var doesNotUnderstand = function(message) {
		var msg = this + " did not understand " + st.unbox(message.selector());
		st.Exception.signal_(st.string(msg));
	};

	st.Object._addInstanceMethods({
		doesNotUnderstand_: doesNotUnderstand,
		_class: function() { return this._theClass; },
		halt: function() { debugger; },
		
		perform_: st.perform,
		perform_with_: st.perform,
		perform_with_with_: st.perform,
		perform_with_with_with_: st.perform,
		perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection){
			var args = [aSTMessageSelector].concat(st.unbox(anArgumentsCollection));
			return st.perform.apply(this, args);
		}
		
	});
	st.Object._addClassMethods({
		newOnServer: function() {
			return st.passMessage(this, st.Message.selector_(st.string("newOnServer")));
		},
		halt: function() { debugger; },
		doesNotUnderstand_: doesNotUnderstand
	});

})();
