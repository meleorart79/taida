/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const KEY_ENTER = 13;

$(document).ready(function() {
	$('input#username').keypress(function(event) {
		if (event.which == KEY_ENTER) {
			$('input#password').focus();
		}
	});

	$('input#password').keypress(function(event) {
		if (event.which == KEY_ENTER) {
			$('button').first().trigger('click');
		}
	});

	$('button').first().on('click', function() {
		var username = $('input#username').val();
		var password = $('input#password').val();

		$.post('/', {
			username: username,
			password: password
		}).done(function(data) {
			window.location = '/';
		}).fail(function(result) {
			$('p.warning').remove();
			$('h1').after('<p class="warning">Invalid login.</p>');

			if ($('input#username').val() == '') {
				$('input#password').val('');
				$('input#username').focus();
			} else {
				$('input#password').val('').focus();
			}
		});
	});

	$('input#username').focus();
});
