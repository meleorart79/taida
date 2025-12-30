/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const KEY_SHIFT = 16;
const KEY_CTRL = 17;
const TAIDA_FS_TIMEOUT = 30000;
const ANIMATE_SPEED = 300;

var _taida_setting_error_shown = false;
var _taida_file_icons = [];
var _taida_callbacks_open_file = {};
var _taida_callback_open_directory = undefined;
var _taida_keys_down = {};
var _taida_icon_context_menu = {};
var _taida_timestamp = Date.now();

/* taida basic dialogs
 */
function taida_alert(message, title = '', callback_close = undefined) {
	message = message.replaceAll('\n', '<br />');

	var dialog =
		'<div class="taida_dialog">' +
		'<div class="message">' + message + '</div>' +
		'<div class="btn-group">' +
		'<input type="button" value="Ok" class="btn btn-default" />' +
		'</div>' +
		'</div>';
	var alert_window = $(dialog).taida_window({
		header: title,
		width: 500,
		maximize: false,
		minimize: false,
		close: function() {
			$(document).off('keydown', key_handler);
		},
		resize: false,
		dialog: true
	});

	alert_window.find('div.btn-group input').on('click', function() {
		alert_window.close();

		if (callback_close != undefined) {
			callback_close();
		}
	});

	var key_handler = function(event) {
		if ((event.which != 13) && (event.which != 27)) {
			return;
		}

		alert_window.find('div.btn-group input').trigger('click');
	};
	$(document).on('keydown', key_handler);

	alert_window.open();
}

function taida_confirm(message, callback_okay, callback_cancel = undefined) {
	var dialog =
		'<div class="taida_dialog">' +
		'<div class="message">' + message + '</div>' +
		'<div class="btn-group">' +
		'<input type="button" value="Ok" class="btn btn-default" />' +
		'<input type="button" value="Cancel" class="btn btn-default" />' +
		'</div>' +
		'</div>';
	var confirm_window = $(dialog).taida_window({
		header: 'Confirm',
		width: 500,
		maximize: false,
		minimize: false,
		close: function() {
			$(document).off('keydown', key_handler);
		},
		resize: false,
		dialog: true
	});

	confirm_window.find('div.btn-group input').first().on('click', function() {
		confirm_window.close();

		callback_okay();
	});

	confirm_window.find('div.btn-group input').last().on('click', function() {
		confirm_window.close();

		if (callback_cancel != undefined) {
			callback_cancel();
		}
	});

	var key_handler = function(event) {
		if (event.which == 13) {
			confirm_window.find('div.btn-group input').first().trigger('click');
		} else if (event.which == 27) {
			confirm_window.find('div.btn-group input').last().trigger('click');
		}
	};
	$(document).on('keydown', key_handler);

	confirm_window.open();
}

function taida_prompt(message, input, callback_okay, callback_cancel = undefined) {
	var dialog =
		'<div class="taida_dialog">' +
		'<div class="message">' + message + '</div>' +
		'<input type="text" value="' + input.replace('"', '\\"') + '" class="form-control" />' +
		'<div class="btn-group">' +
		'<input type="button" value="Ok" class="btn btn-default" />' +
		'<input type="button" value="Cancel" class="btn btn-default" />' +
		'</div>' +
		'</div>';
	var prompt_window = $(dialog).taida_window({
		header: 'Input',
		width: 500,
		maximize: false,
		minimize: false,
		open: function() {
			var input = prompt_window.find('input.form-control');
			var length = input.val().length;
			input.focus();
			input[0].setSelectionRange(length, length);
		},
		close: function() {
			$(document).off('keydown', key_handler);
		},
		resize: false,
		dialog: true
	});

	prompt_window.find('div.btn-group input').first().on('click', function() {
		var input = prompt_window.find('input.form-control').val();

		prompt_window.close();

		callback_okay(input);
	});

	prompt_window.find('div.btn-group input').last().on('click', function() {
		prompt_window.close();

		if (callback_cancel != undefined) {
			callback_cancel();
		}
	});

	var key_handler = function(event) {
		if (event.which == 13) {
			prompt_window.find('div.btn-group input').first().trigger('click');
		} else if (event.which == 27) {
			prompt_window.find('div.btn-group input').last().trigger('click');
		}
	};
	$(document).on('keydown', key_handler);

	prompt_window.open();
}

/* Context menu
 */
function taida_contextmenu_add_items(menu_entries, extension) {
	var items = _taida_icon_context_menu[extension];
	if (items == undefined) {
		return;
	}

	menu_entries.push('-');
	items.forEach(function(item) {
		menu_entries.push({ name: item.label, icon: item.icon, callback:item.callback });
	});
}

function taida_contextmenu_show(icon, event, menu_entries, callback) {
	var menu_x = event.clientX;
	var menu_y = event.clientY;
	var z_index = taida_window_max_zindex() + 2;

	var menu = $('<div class="context_menu" style="position:absolute; display:none; z-index:' + z_index + ';">');
	menu_entries.forEach(function(value) {
		if (value == '-') {
			menu.append('<div><hr /></div>');
		} else {
			var item = $('<div class="option"><span class="fa fa-' + value.icon + '"></span><span class="text">' + value.name + '</span></div>');

			if (value.callback != undefined) {
				var cb = value.callback;
			} else {
				var cb = callback;
			}

			item.on('mousedown', function() {
				$('body div.context_menu').remove();
				cb(icon, value.name);
			});

			menu.append(item);
		}
	});

	$('body div.context_menu').remove();
	$('body').append(menu);

	var desktop_width = Math.round($('div.desktop').width());
	var desktop_height = Math.round($('div.desktop').height());

	var menu = $('div.context_menu');
	var menu_width = Math.round(menu.outerWidth());
	var menu_height = Math.round(menu.outerHeight());

	if (menu_x + menu_width > desktop_width) {
		menu_x -= menu_width;
	}

	if (menu_y + menu_height > desktop_height) {
		menu_y -= menu_height;
	}

	menu.css('left', menu_x + 'px');
	menu.css('top', menu_y + 'px');
	menu.css('display', '');

	$(document).one('mousedown', function() {
		$('body div.context_menu').remove();
	});
}

function taida_contextmenu_extra_item(extension, label, icon, callback) {
	var entry = {
		label: label,
		icon: icon,
		callback: callback
	}

	if (_taida_icon_context_menu[extension] == undefined) {
		_taida_icon_context_menu[extension] = [];
	}

	_taida_icon_context_menu[extension].push(entry);
}

/* Icon functions
 */
function taida_icon_to_filename(icon) {
	var container = $(icon).parent();

	if (container.hasClass('icons') && container.parent().hasClass('desktop')) {
		/* Desktop
		 */
		return 'Desktop/' + $(icon).find('span').text();
	}

	if (container.hasClass('files') && container.parent().hasClass('explorer')) {
		/* Explorer
		 */
		var explorer_window = container.parent();
		var path = explorer_window.data('path');
		if (path != '') {
			path += '/';
		}

		return path + $(icon).find('span').first().text();
	}

	return undefined;
}

function taida_make_icon(name, image) {
	return '<div class="icon">' +
		'<img src="' + image + '" alt="' + name + '" title="' + name + '" draggable="false" />' +
		'<span>' + name + '</span></div>';
}

function taida_get_file_icon(extension) {
	if (typeof extension === 'string') {
		extension = extension.toLowerCase();
	}

	var default_icon = '/images/file.png';
	var handler = _taida_callbacks_open_file[extension];

	if (_taida_file_icons.includes(extension)) {
		default_icon = '/images/icons/' + extension + '.png';
	}

	if (handler == undefined) {
		return default_icon;
	}

	if (handler.icon == undefined) {
		return default_icon;
	}

	return handler.icon;
}

/* File and directory handlers
 */
function taida_upon_file_open(extension, callback, icon = undefined) {
	if (typeof extension === 'string') {
		extension = extension.toLowerCase();
	}

	var handler = {
		callback: callback,
		icon: icon
	}

	if (_taida_callbacks_open_file[extension] == undefined) {
		_taida_callbacks_open_file[extension] = handler;
	} else {
		taida_alert('Duplicate extension handler for .' + extension + ' files.', 'Taida error');
	}
}

function taida_upon_directory_open(callback) {
	if (_taida_callback_open_directory == undefined) {
		_taida_callback_open_directory = callback;
	}
}

function taida_get_file_handler(extension) {
	if (typeof extension === 'string') {
		extension = extension.toLowerCase();
	}

	var handler = _taida_callbacks_open_file[extension];

	if (handler == undefined) {
		return undefined;
	}

	return handler.callback;
}

function taida_get_directory_handler(extension) {
	return _taida_callback_open_directory;
}

/* Cookie
 */
function taida_get_cookie(cookie) {
	var parts = document.cookie.split(';');

	var cookies = {};
	parts.forEach(function(part) {
		var item = part.split('=');
		var key = item[0].trim();
		var value = item[1].trim();

		cookies[key] = value;
	});

	return cookies[cookie];
}

/* Settings
 */
function taida_setting_get(setting, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/setting/' + setting
	}).done(function(data) {
		var result = $(data).find('result').text();
		callback_done(result);
	}).fail(function(result) {
		if ((result.status == 500) && (_taida_setting_error_shown == false)) {
			_taida_setting_error_shown = true;
			taida_alert('User settings file not found. Read INSTALL for instructions.', 'Taida error');
		}

		if (callback_fail != undefined) {
			callback_fail(result.status);
		}
	});
}

function taida_setting_set(setting, value, callback_done = undefined, callback_fail = undefined) {
	$.post('/taida/setting/' + setting, {
		value: value
	}).done(function() {
		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if ((result.status == 500) && (_taida_setting_error_shown == false)) {
			_taida_setting_error_shown = true;
			taida_alert('User settings file not writable for webserver.', 'Taida error');
		}

		if (callback_fail != undefined) {
			callback_fail(result.status);
		}
	});
}

/* Dynamically add resources
 */
function taida_load_javascript(javascript) {
	if ($('div.desktop').attr('debug') == 'yes') {
		javascript += '?' + _taida_timestamp;
	}

	if ($('head script[src="' + javascript + '"]').length > 0) {
		return;
	}

	$('head').append('<script type="text/javascript" src="' + javascript + '"></script>');
}

function taida_load_stylesheet(stylesheet) {
	if ($('div.desktop').attr('debug') == 'yes') {
		stylesheet += '?' + _taida_timestamp;
	}

	if ($('head link[href="' + stylesheet + '"]').length > 0) {
		return;
	}

	$('head').append('<link rel="stylesheet" type="text/css" href="' + stylesheet + '" />');
}

/* Logout
 */
function taida_logout(force = false) {
	var taida_do_logout = function() {
		var login = $('div.desktop').attr('login');

		var logout = window.location.protocol + '//';

		if (login == 'http') {
			logout += 'log:out@';
		}

		logout += window.location.hostname;

		if (login == 'taida') {
			logout += '/?logout';
		}

		$('body').empty().css('background-color', '#202020');
		window.location = logout;
	};

	if (force) {
		taida_do_logout();
	} else if ($('div.windows div.window').length > 0) {
		taida_confirm('Close all windows and logout?', taida_do_logout);
	} else {
		taida_do_logout();
	}
}

/* Key press
 */
function taida_key_pressed(key) {
	return _taida_keys_down[key];
}

/* Main
 */
$(document).ready(function() {
	/* Custom icons
	 */
	$.ajax({
		url: '/taida/icon/default'
	}).done(function(data) {
		$(data).find('icon').each(function() {
			_taida_file_icons.push($(this).text());
		});
	}).fail(function() {
		taida_alert('Error loading custom icons.', 'Taida error');
	});

	/* Register ctrl press
	 */
	var keys_init = function() {
		_taida_keys_down[KEY_SHIFT] = false;
		_taida_keys_down[KEY_CTRL] = false;
	};

	$(window).focus(keys_init);
	keys_init();

	$('body').on('keydown', function(event) {
		if (_taida_keys_down[event.which] !== undefined) {
			_taida_keys_down[event.which] = true;
		}

		if (event.which == KEY_CTRL) {
			if ($('div.ui-draggable-dragging div.plus').length == 0) {
				var plus = '<div class="plus">+<div>';
				$('div.ui-draggable-dragging').prepend(plus);
			}
		}
	});

	$('body').on('keyup', function(event) {
		if (_taida_keys_down[event.which] !== undefined) {
			_taida_keys_down[event.which] = false;
		}

		if (event.which == KEY_CTRL) {
			$('div.ui-draggable-dragging').find('div.plus').remove();
		}
	});

	/* Keep session alive
	 */
	var timeout = $('div.desktop').attr('timeout');
	if ((timeout != undefined) && (timeout != '')) {
		timeout = parseInt(timeout);
		if (isNaN(timeout)) {
			taida_alert('Invalid session timeout.', 'Taida error');
		} else {
			timeout = (timeout - 10) * 1000;
			setInterval(function() {
				$.ajax({
					url: '/taida/ping'
				}).fail(function(result) {
					if (result.status == 401) {
						taida_logout(true);
					}
				});
			}, timeout);
		}
	}

	/* Check for autosave files
	 */
	$.ajax({
		url: '/taida/autosave'
	}).done(function(data) {
		$(data).find('autosave').each(function() {
			var autosave = $(this).text();
			var filename = taida_file_filename(autosave);
			var parts = filename.split('_');
			var app = parts[0] + '_open';
			window[app](autosave);
		});
	});
});
