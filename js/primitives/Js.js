
// Runtime depends on: boxing.js, helpers.js

(function() {

	var Global = null;
	var Document = null;

	// Set up setInterval to track all added intervals
	var intervals = [];
	var originalSetInterval = window.setInterval;
	window.setInterval = function() {
		var id = originalSetInterval.apply(window, st.toArray(arguments));
		intervals.push(id);
		return id; };

	st.Js._addClassMethods({
		Document: function() {
			if (!Document)
				Document = st.box(document);
			return Document;
		},
		Global: function() {
			if (!Global)
				Global = st.box(window);
			return Global;
		},
		clearIntervals: function() {
			for (var i = 0; i < intervals.length; i++) {
				window.clearInterval(intervals[i]);
			}
		}
	});

})();
