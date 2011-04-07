
(function() {

	_Object._addInstanceMethods({
		doesNotUnderstand_: function(message) {
			// TODO implement this correctly
			var msg = this + "(instance of " + this._class().name() + 
					") did not understand " + _unboxObject(message.selector());
			Exception.signal_(string(msg));
		},
		_class: function() { return this.__class; },
		halt: function() { debugger; },
		// _perform_ is implemented in boxing.js
		perform_: _perform_,
		perform_with_: _perform_,
		perform_with_with_: _perform_,
		perform_with_with_with_: _perform_,
		perform_withArguments_: function (aSTMessageSelector, anArgumentsCollection){
			return _perform_.apply(this, _unboxObject(anArgumentsCollection));
		}
	});

})();
