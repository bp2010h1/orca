
// Runtime depends on: boxing.js

(function() {

	st.ProtoObject._addClassMethods({
		basicNew: function() { return this._newInstance(); },
		_new: function() { return this.basicNew().initialize(); },
		name: function() { return st.string(this._classname); },
		isBehavior: function() { return st.true; },
		isRemote: function() {	return st.false; }
	});
	st.ProtoObject._addInstanceMethods({
		_equals_equals: function(anObject) { return st.bool(this === anObject); },
		identityHash: function() { return st.number(this._instanceNumber); },
		isBehavior: function() { return st.false; },
		isRemote: function() {	return st.false; }
	});

})();
