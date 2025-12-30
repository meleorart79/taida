/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const kB = 1024;
const MB = 1024 * kB;
const GB = 1024 * MB;

const TAIDA_NO_EXTENSION = '___';

/* File icon
 */
function taida_file_make_icon(item, path, type) {
	var name = item.name;
	var link = item.link;
	var target = item.target;

	if (type == 'directory') {
		var image = '/images/directory.png';
		var extension = '';
	} else {
		var extension = taida_file_extension(name);
		if (extension != false) {
			var image = taida_get_file_icon(extension);
		} else {
			var image = '/images/file.png';
			extension = '';
		}
	}

	if (target != undefined) {
		target = ' title="' + target + '"';
	} else {
		target = '';
	}

	return '<div class="icon" type="' + type + '" ext="' + extension + '" link="' + (link ? 'yes' : 'no' ) + '">' +
		'<img src="' + image + '" alt="' + name + '" draggable="false" />' +
		(link ? '<img src="/images/link.png" draggable="false" />' : '') +
		'<span path="' + path + '" type="' + type + '"' + target + '>' + name + '</span></div>';
}

/* File utility functions
 */
function taida_file_prepare(path) {
	while (path.startsWith('/')) {
		path = path.substring(1);
	}

	while (path.endsWith('/')) {
		path = path.substring(0, path.length - 1);
	}

	return path;
}

function taida_file_filename(filename) {
	var pos = filename.lastIndexOf('/');

	if (pos == -1) {
		return filename;
	}

	return filename.substring(pos + 1);
}

function taida_file_dirname(filename) {
	var pos = filename.lastIndexOf('/');

	if (pos == -1) {
		return '';
	}

	return filename.substring(0, pos);
}

function taida_file_extension(filename) {
	var slash = filename.lastIndexOf('/');

	if (slash != -1) {
		filename = filename.substr(slash + 1);
	}

	var pos = filename.lastIndexOf('.');

	if (pos == -1) {
		return TAIDA_NO_EXTENSION;
	}

	return filename.substr(pos + 1);
}

function taida_download_url(filename) {
	url = '/taida/file/download/' + url_encode(filename);

	if ($('div.desktop').attr('debug') == 'yes') {
		var date = new Date();
		url += '?' + date.getTime();
	}

	return url;
}

/* Dialog window
 */
function _taida_file_dialog_update(dialog_window, default_filename = undefined) {
	var path = dialog_window.data('path');

	dialog_window.find('div.path').text(path == '' ? '/' : '/' + path + '/');

	taida_directory_list(path, function(items) {
		var directories = dialog_window.find('div.directories');
		var files = dialog_window.find('div.files');
		var filename = dialog_window.find('div.filename input');

		directories.empty();
		files.empty();
		if (default_filename != undefined) {
			filename.val(default_filename);
		}

		/* Fill dialog
		 */
		items.forEach(function(item) {
			var name = $(this).find('name').text();
			if (item.type == 'directory') {
				directories.append('<div class="directory"><img src="/images/directory.png" />' + item.name + '</div>');
			} else {
				var icon = taida_file_make_icon(item, path, 'file');
				files.append(icon);
			}
		});

		/* Select directory
		 */
		dialog_window.find('div.directories div.directory').on('dblclick', function() {
			var dir = $(this).text();

			if (path == '') {
				path = dir;
			} else {
				path += '/' + dir;
			}

			dialog_window.data('path', path);
			_taida_file_dialog_update(dialog_window);
		});

		/* Select file
		 */
		dialog_window.find('div.files div.icon').on('click', function() {
			filename.val($(this).find('span').text());
		});

		dialog_window.find('div.files div.icon').on('dblclick', function() {
			var callback = dialog_window.data('callback');
			callback(path + '/' + $(this).find('span').text());
			dialog_window.close();
		});
	}, function(result) {
		if (result == 401) {
			dialog_window.close();
			alert('Login has been expired. No access to disk.');
			taida_logout(true);
		} else if ((path != '/') && (path != '')) {
			var parts = path.split('/');
			parts.pop();
			path = parts.join('/');

			dialog_window.data('path', path);
			_taida_file_dialog_update(dialog_window, default_filename);
		}
	});
}

function taida_file_dialog(action, callback, directory = '', filename = undefined) {
	var dialog =
		'<div class="file_dialog">' +
		'<button class="btn btn-default btn-xs up"><img src="/images/chevron-up.svg" width="16" height="16" style="vertical-align: middle;"></button>' +
		'<div class="path"></div>' +
		'<div class="directories"></div>' +
		'<div class="files"></div>' +
		'<div class="filename"><input placeholder="Enter filename..." class="form-control" /></div>' +
		'<div class="btn-group">' +
		'<input type="button" value="' + action + '" class="btn btn-default action" />' +
		'<input type="button" value="Cancel" class="btn btn-default cancel" />' +
		'</div>' +
		'</div>';
	var dialog_window = $(dialog).taida_window({
		header: action + ' file',
		width: 700,
		height: 350,
		maximize: false,
		minimize: false,
		resize: false,
		dialog: true,
		open: function() {
			dialog_window.find('input.form-control').focus();
		},
		close: function() {
			$(document).off('keydown', key_handler);
		}
	});

	dialog_window.open();

	var key_handler = function(event) {
		if (event.which == 27) {
			dialog_window.find('div.btn-group input.cancel').trigger('click');
		}
	};
	$(document).on('keydown', key_handler);

	dialog_window.find('button.up').on('click', function() {
		var path = dialog_window.data('path');

		if (path == '') {
			return;
		}

		var parts = path.split('/');
		parts.pop();
		path = parts.join('/');

		dialog_window.data('path', path);
		_taida_file_dialog_update(dialog_window);
	});

	dialog_window.find('input.action').on('click', function() {
		var filename = dialog_window.find('div.filename input').val();

		if (filename == '') {
			return;
		}

		var path = dialog_window.data('path');
		var callback = dialog_window.data('callback');
		callback(path + '/' + filename);

		dialog_window.close();
	});

	dialog_window.find('input.cancel').on('click', function() {
		dialog_window.close();
	});

	dialog_window.data('path', directory);
	dialog_window.data('callback', callback);

	_taida_file_dialog_update(dialog_window, filename);
}

/* File operations
 */
function taida_file_nice_size(size, bytes = false) {
	if (size > GB) {
		size = (size / GB).toFixed(1) + " GB";
	} else if (size > MB) {
		size = (size / MB).toFixed(1) + " MB";
	} else if (size > kB) {
		size = (size / kB).toFixed(1) + " kB";
	} else if (bytes) {
		size = size + " bytes";
	}

	return size;
}

function taida_file_type(filename, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/file/type/' + filename,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		callback_done($(data).find('type').text());
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_exists(filename, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/file/exists/' + filename,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		callback_done($(data).find('exists').text() == 'yes');
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_open(filename, callback_done, callback_fail = undefined) {
	filename = taida_file_prepare(filename);

	$.ajax({
		url: '/taida/file/load/' + filename,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		var content = atob($(data).find('content').text());
		callback_done(content);
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_save(filename, content, binary = false, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	filename = taida_file_prepare(filename);

	if (binary) {
		content = btoa(content);
	}

	$.post('/taida/file/save', {
		filename: filename,
		content: content,
		encoding: (binary ? 'base64' : 'none'),
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		var directory = taida_file_dirname(filename);
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

function taida_file_rename(source, destination, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	source = taida_file_prepare(source);
	destination = taida_file_prepare(destination);

	var parts = source.split('/');
	var filename = parts.pop();
	if (filename == destination) {
		return;
	}

	$.post('/taida/file/rename', {
		source: source,
		new_filename: destination,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function() {
		var source_path = taida_file_dirname(source);
		taida_directory_notify_update(source_path);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_move(source, destination, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	source = taida_file_prepare(source);
	var source_path = taida_file_dirname(source);
	destination = taida_file_prepare(destination);

	if (source_path == destination) {
		return;
	}

	$.post('/taida/file/move', {
		source: source,
		destination: destination
	}).done(function() {
		taida_directory_notify_update(source_path);
		taida_directory_notify_update(destination);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_copy(source, destination, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	source = taida_file_prepare(source);
	var source_path = taida_file_dirname(source);
	destination = taida_file_prepare(destination);

	if (source_path == destination) {
		return;
	}

	$.post('/taida/file/copy', {
		source: source,
		destination: destination
	}).done(function() {
		taida_directory_notify_update(destination);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_link(filename, link, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	filename = taida_file_prepare(filename);

	$.post('/taida/file/link', {
		source: filename,
		destination: link
	}).done(function() {
		var destination = taida_file_dirname(link);
		taida_directory_notify_update(destination);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_remove(filename, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	filename = taida_file_prepare(filename);

	$.post('/taida/file/remove', {
		filename: filename
	}).done(function(data) {
		var directory = taida_file_dirname(filename);
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

function taida_file_search(filename, path, callback_done, callback_fail = undefined) {
	$.post('/taida/file/search', {
		search: filename,
		path: path
	}).done(function(data) {
		var result = [];

		$(data).find('file').each(function() {
			var item = {
				filename: $(this).text(),
				type: $(this).attr('type')
			};
			result.push(item);
		});

		callback_done(result);
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}
