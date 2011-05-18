(function() {

	st.Behavior._addInstanceMethods({
		toString: function() {
			return "st." + this._classname;
		},
		basicNew: function() { return this._newInstance(); },
		_new: function() { return this.basicNew().initialize(); },
		name: function() { return st.string(this._classname); },
	});
	
})();
