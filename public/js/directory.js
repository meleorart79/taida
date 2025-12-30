/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

_taida_directory_update_callbacks = [];

/* Directory updates
 */
function taida_directory_upon_update(callback) {
	_taida_directory_update_callbacks.push(callback);
}

function taida_directory_notify_update(directory) {
	taida_directory_exists(directory, function(exists) {
		if (exists == false) {
			directory = taida_file_dirname(directory);
		}

		_taida_directory_update_callbacks.forEach(function(callback) {
			callback(directory);
		});
	});
}

/* Directory operations
 */
function taida_directory_list(path, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/dir/list/' + path,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		var items = [];
		$(data).find('item').each(function() {
			var item = {
				name: $(this).find('name').text(),
				type: $(this).find('type').text(),
				link: $(this).find('link').text() == 'yes',
				target: $(this).find('target').text(),
				size: $(this).find('size').text(),
				create: $(this).find('create').text(),
				create_timestamp: $(this).find('create').attr('timestamp'),
				access: $(this).find('access').text(),
				access_timestamp: $(this).find('access').attr('timestamp')
			}
			items.push(item);
		});

		callback_done(items);
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_directory_exists(directory, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/dir/exists/' + directory,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		callback_done($(data).find('exists').text() == 'yes');
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_directory_create(directory, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	$.post('/taida/dir/make', {
		directory: directory,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function() {
		directory = taida_file_dirname(directory);
		taida_directory_notify_update(directory);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_directory_remove(directory, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	directory = taida_file_prepare(directory);

	$.post('/taida/dir/remove', {
		directory: directory,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		directory = taida_file_dirname(directory);
		taida_directory_notify_update(directory);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}
