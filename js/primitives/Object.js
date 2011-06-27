
// Runtime depends on: boxing.js, perform.js, remoteObjects.js

(function() {

	st.Object._addInstanceMethods({
		halt: function () { debugger; },
		_class: function () { return this._theClass; },
		
		doesNotUnderstand_: function(message) {
			var msg = this + " did not understand " + st.unbox(message.selector());
			st.Exception.signal_(st.string(msg));
		},
		perform_: st.perform,
		perform_with_: st.perform,
		perform_with_with_: st.perform,
		perform_with_with_with_: st.perform,
		perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection) {
			var args = [aSTMessageSelector].concat(st.unbox(anArgumentsCollection));
			return st.perform.apply(this, args);
		},
		copy : function () {
			var duplicate = this._class().basicNew();
			
			for (slot in this) { 
				if ((typeof(this[slot])!= "function")  && (slot[0]=='$')){
					duplicate[slot] = this[slot];
				}
			}
			return duplicate;
		},
		
		basicSize: function () {
			this._class().isVariable().ifTrue_ifFalse_(
				st.block(function () { debugger; }), 
				st.block(function () { return st.number(0); }));
		},
		instVarAt_:function (index) {
			if (index.isInteger() === st.false){
				return st.Error.signal("Access to instVarAt: without Integer Parameter");
			}
			var jsIndex = st.unbox(index) - 1;
			if (jsIndex >= this.instanceVariables.length) {
				if (this._class().isVariable() === st.false){
					return st.Error.signal("Access to an instVar at an index out of bounds.")
				} else {
					// not used yet
					debugger;
				}
			}
			return this[this.instanceVariables[jsIndex]];
		}
		
	});
	st.Object._addClassMethods({
		asRemote: function() {
			return st.passMessage(this, st.Message.selector_(st.string("asRemote")), "blocked");
		}
	});

})();
