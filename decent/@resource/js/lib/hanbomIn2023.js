window.addEventListener('load', function() {
	var includeElements = document.querySelectorAll('[data-include-path]');
	Array.prototype.forEach.call(includeElements, function(el, i, arr) {
		var includePath = el.dataset.includePath;
		if (includePath) {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					el.outerHTML = this.responseText;
					includeCallback(includePath, i, arr);
				} else if (this.status == 400){
					el.outerHTML = 'Page not found.';
				}
			};
			xhttp.open('GET', includePath, true);
			xhttp.send();
		}
	});
});