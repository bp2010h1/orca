
// Runtime depends on: boxing.js, helpers.js

(function() {

	var Global = null;
	var Document = null;
	var Window = null;

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
		JSONObject: function() {
			if (!JSONObject)
				JSONObject = st.box(JSON);
			return JSONObject;
		},
		Window: function() {
			if (!Window)
				Window = st.box(window);
			return Window;
		},
		clearIntervals: function() {
			for (var i = 0; i < intervals.length; i++) {
				window.clearInterval(intervals[i]);
			}
		}
	});

})();
