
(function() {

	st.Exception._addInstanceMethods({
		signal: function(aString) { 
			throw this;
		},
		return_ : function(anObject) {
			/* return the anObject in the Context where the exception was thrown */
			console.log("Exception >> return: can't be used in Javascript.");
			return anObject;
		}
	});

})();
