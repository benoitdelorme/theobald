export function stats() {
	const script = document.createElement('script');
	script.onload = function(){
		const stats = new Stats();
		stats.dom.style.left = 'calc(100% - 80px)';


		document.body.appendChild(stats.dom);

		requestAnimationFrame(function loop() {
			stats.update();
			requestAnimationFrame(loop);
		});
	};

	script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';

	document.head.appendChild(script);
}