function explorer_escape(value) {
	return $('<div></div>').text(value).html();
}

function explorer_render(win, path) {
	path = taida_file_prepare(path || _taida_desktop_path || '');
	win.data('path', path);
	win.find('.explorer-path').text(path == '' ? '/' : '/' + path);
	win.find('.explorer-list').empty().append('<div class="explorer-loading">Loading...</div>');

	taida_directory_list(path, function(items) {
		var list = win.find('.explorer-list');
		list.empty();

		items.forEach(function(item) {
			var row = $(
				'<button type="button" class="explorer-row" data-type="' + item.type + '">' +
					'<img src="' + (item.type == 'directory' ? '/images/directory.png' : taida_get_file_icon(taida_file_extension(item.name))) + '" draggable="false" />' +
					'<span>' + explorer_escape(item.name) + '</span>' +
				'</button>'
			);

			row.on('dblclick', function() {
				var child = path == '' ? item.name : path + '/' + item.name;
				if (item.type == 'directory') {
					explorer_render(win, child);
					return;
				}

				var handler = taida_get_file_handler(taida_file_extension(item.name));
				if (handler != undefined) {
					handler(child);
				} else {
					window.open(taida_download_url(child), '_blank').focus();
				}
			});

			list.append(row);
		});
	}, function() {
		win.find('.explorer-list').html('<div class="explorer-empty">Unable to open this folder.</div>');
	});
}

function explorer_open(path) {
	var view = $(
		'<div class="explorer">' +
			'<div class="explorer-toolbar">' +
				'<button type="button" class="explorer-up">Up</button>' +
				'<button type="button" class="explorer-refresh">Refresh</button>' +
				'<span class="explorer-path"></span>' +
			'</div>' +
			'<div class="explorer-list files"></div>' +
		'</div>'
	);

	view.find('.explorer-up').on('click', function() {
		var current = view.data('path') || '';
		explorer_render(view, taida_file_dirname(current));
	});

	view.find('.explorer-refresh').on('click', function() {
		explorer_render(view, view.data('path') || '');
	});

	view.taida_window({
		header: 'File Explorer',
		icon: '/images/directory.png',
		width: 620,
		height: 420,
		minWidth: 360,
		help: 'explorer'
	});
	view.open();
	explorer_render(view, path || _taida_desktop_path);
}

$(document).ready(function() {
	taida_startmenu_add('File Explorer', '/images/directory.png', function() {
		explorer_open(_taida_desktop_path);
	});
	taida_upon_directory_open(explorer_open);
});
