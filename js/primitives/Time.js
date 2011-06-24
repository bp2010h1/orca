(function() {
	st.Time._addClassMethods({
		millisecondClockValue: function() { 
			return st.number(new Date().getTime());
		}
	});
})();
