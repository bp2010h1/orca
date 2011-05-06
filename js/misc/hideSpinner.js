
st.clientSideInitialized = function() {
	var node = document.getElementById("spinner");
	if (node)
		document.getElementsByTagName("body")[0].removeChild(node);
};
