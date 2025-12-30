/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Orb web desktop
 * https://gitlab.com/hsleisink/orb
 *
 * Licensed under the GPLv2 License
 */

const USER_LOGIN_SCRIPT = 'login.ujs';
const USER_LOAD_SCRIPT = 'load.ujs';

var user_javascript_errors = [];

function javascript_execute_file(filename) {
	taida_file_exists(filename, function(exists) {
		if (exists == false) {
			taida_alert('Javascript not found.');
			return;
		}

		var js_id = 'js_' + sha256(filename);

		filename = '/taida/file/download/' + filename;

		if ($('div.desktop').attr('debug') == 'yes') {
			filename += '?' + Date.now();
		}

		$('head script#' + js_id).remove();
		$('head').append('<script id=\"' + js_id + '\" type="text/javascript" src="' + filename + '"></script>');
	});
}

function javascript_log_error(message) {
	message = '<div class="item">' + message + '</div>';

	user_javascript_errors.push(message);

	var error_apps = $('div.user_javascript_errors');

	if (error_apps.length > 0) {
		error_apps.append(message);
		return;
	}

	var error_content = '<div class="user_javascript_errors"></div>';
	var error_window = $(error_content).taida_window({
		header: 'User Javascript errors',
		icon: '/images/error.png',
		width: 500,
		height: 200
	});

	user_javascript_errors.forEach(function(error) {
		error_window.append(message);
	});

	error_window.open();
}

$(document).ready(function() {
	taida_upon_file_open('ujs', javascript_execute_file, '/images/application.png');

	/* Check login and load scripts
	 */
	if (parseInt($('div.desktop').attr('counter')) == 0) {
		taida_file_exists(USER_LOGIN_SCRIPT, function(exists) {
			if (exists) {
				javascript_execute_file(USER_LOGIN_SCRIPT);
			}
		});
	}

	taida_file_exists(USER_LOAD_SCRIPT, function(exists) {
		if (exists) {
			javascript_execute_file(USER_LOAD_SCRIPT);
		}
	});

	/* Debugging on mobile devices
	 */
	window.setTimeout(function() {
		if ($('div.desktop').attr('mobile') != 'yes') {
			return;
		}

		window.onerror = function(message, url, linenr) {  
			javascript_log_error('[ERROR] ' + message + ' (' + linenr + ')');
			return false;
		};

		var _console_log = console.log;
		console.log = function(message) {
			javascript_log_error('[CONSOLE] ' + message);
			_console_log.apply(console, arguments);
		};
	}, 500);
});
