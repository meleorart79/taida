/* Taida template application
 *
 * Copyright (c) by NAME
 *
 * Let every function in this file start with the application name
 * to avoid conflicts with other applications.
 *
 * Always use template_window to interact with your application to
 * avoid issues with multiple instances of your application.
 */

const TEMPLATE_ICON = '/images/application.png';

function template_menu_click(template_window, item) {
	var disabled = false;
	notifications_window.parent().parent().find('ul.nav a.entry').each(function () {
		if ($(this).text() == item) {
			if ($(this).parent().hasClass('disabled')) {
				disabled = true;
				return false;
			}
		}
	});
	if (disabled) {
		return;
	}

	switch (item) {
		case 'Exit':
			template_window.close();
			break;
		case 'About':
			taida_alert('<img src="' + TEMPLATE_ICON + '" class="about" draggable="false" />Template\nCopyright (c) by NAME', 'About');
			break;
	}
}

function template_open(filename = undefined) {
	var window_content =
		'<div class="template">' +
		'<p>This is the Taida Template application.</p>' +
		'</div>';

	var template_window = $(window_content).taida_window({
		header: 'Template',
		icon: TEMPLATE_ICON,
		width: 400,
		height: 200,
		menu: {
			'File': ['Exit'],
			'Help': ['About']
		},
		menuCallback: template_menu_click
	});

	template_window.open();

	if (filename != undefined) {
	}
}

function template_initialize() {
	taida_startmenu_add('Template', TEMPLATE_ICON, template_open);
}
