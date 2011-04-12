
// Runtime depends on: boxing.js

(function() {

	st.ProtoObject._addClassMethods({
		basicNew: function() { return this._newInstance(); },
		_new: function() { return this.basicNew().initialize(); },
		name: function() { return st.string(this._classname); }
	});
	st.ProtoObject._addInstanceMethods({
		_equals_equals: function(anObject) { return st.bool(this === anObject); },
		identityHash: function() { return st.number(this.instanceNumber$); },
		isBehavior: function() { return st.false; }
	});

})();
