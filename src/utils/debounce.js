export default function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this;
		// eslint-disable-next-line prefer-rest-params
		var args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
