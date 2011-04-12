// source: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
