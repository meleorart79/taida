(function () {
	'use strict';

	function blankofmeaning_open() {
		var view = $('<div class="blankofmeaning"></div>');

		view.taida_window({
			header: 'blankofmeaning',
			icon: '/images/file.png',
			width: Math.random() * 300 + 340,
			height: Math.random() * 500 + 100,
			help: 'blankofmeaning'
		});

		view.open();
	}

	$(document).ready(function () {
		taida_startmenu_add(
			'blankofmeaning',
			'/images/file.png',
			blankofmeaning_open
		);
	});

})();