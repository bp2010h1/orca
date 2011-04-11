
// Runtime depends on: boxing.js

(function() {

	var Global = null;
	var Document = null;

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
		}
	});

})();
