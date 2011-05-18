
// Runtime depends on: boxing.js

(function() {
	
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
