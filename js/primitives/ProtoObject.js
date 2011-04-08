
(function() {

	ProtoObject._addClassMethods({
		basicNew: function() { return this._newInstance(); },
		_new: function() { return this.basicNew().initialize(); },
		name: function() { return this._classname; }
	});
	ProtoObject._addInstanceMethods({
		_equals_equals: function(anObject) { return bool(this === anObject); },
		identityHash: function() { return number(this.instanceNumber$); }
	});

})();
