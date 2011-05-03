
// Runtime depends on: boxing.js

(function() {

	st.ProtoObject._addClassMethods({
		toString: function() {
			return "st." + this._classname;
		},
		basicNew: function() { return this._newInstance(); },
		_new: function() { return this.basicNew().initialize(); },
		name: function() { return st.string(this._classname); },
		isBehavior: function() { return st.true; },
		isRemote: function() {	return st.false; }
	});
	st.ProtoObject._addInstanceMethods({
		toString: function() {
			return (/^[AEIOUaeiouYy]/g.test(this._theClass._classname) ?
				"an" : "a" ) + " st." + this._theClass._classname;
		},
		_equals_equals: function(anObject) { return st.bool(this === anObject); },
		identityHash: function() { return st.number(this._instanceNumber); },
		isRemote: function() { return st.false; }
	});

})();
