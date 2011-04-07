
(function() {

	var Global = _boxObject(window);
	var Document = _boxObject(document);

	st.Js._addClassMethods({
		Document: function() {
			return Document;
		},
		Global: function() {
			return Global;
		}
	});

})();
