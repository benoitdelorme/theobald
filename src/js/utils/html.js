export function getParents(elem) {
	const parents = [];

	for (; elem && elem !== document; elem = elem.parentNode)
		parents.push(elem);


	return parents;
}

export function getClosest(elem, selector) {
	if (!Element.prototype.matches)
		Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
            	const matches = (this.document || this.ownerDocument).querySelectorAll(s),
            		i = matches.length;
            	while (--i >= 0 && matches.item(i) !== this) {}
            	return i > -1;
            };

	for (; elem && elem !== document; elem = elem.parentNode)
		if (elem.matches(selector)) return elem;

	return null;
};

export function offset(el) {
	const rect = el.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};