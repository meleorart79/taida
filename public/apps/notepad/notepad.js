function notepad_open(filename) {
	var view = $(
		'<div class="notepad-app">' +
			'<div class="notepad-toolbar">' +
				'<button type="button" class="notepad-open">Open</button>' +
				'<button type="button" class="notepad-save">Save</button>' +
				'<span class="notepad-filename">Untitled</span>' +
			'</div>' +
			'<textarea spellcheck="false"></textarea>' +
		'</div>'
	);

	var load_file = function(path) {
		taida_file_open(path, function(content) {
			view.find('textarea').val(content);
			view.data('filename', path);
			view.find('.notepad-filename').text(path);
			view.set_header(path);
		}, function() {
			taida_alert('Unable to open file.', 'Notepad');
		});
	};

	view.find('.notepad-open').on('click', function() {
		taida_file_dialog('Open', load_file, _taida_desktop_path);
	});

	view.find('.notepad-save').on('click', function() {
		var save = function(path) {
			taida_file_save(path, view.find('textarea').val(), false, function() {
				view.data('filename', path);
				view.find('.notepad-filename').text(path);
				view.set_header(path);
			}, function() {
				taida_alert('Unable to save file.', 'Notepad');
			});
		};

		var current = view.data('filename');
		if (current == undefined) {
			taida_file_dialog('Save', save, _taida_desktop_path, 'note.txt');
		} else {
			save(current);
		}
	});

	view.taida_window({
		header: 'Notepad',
		icon: '/images/file.png',
		width: 640,
		height: 430,
		minWidth: 360,
		help: 'notepad'
	});
	view.open();

	if (filename != undefined) {
		load_file(filename);
	}
}

$(document).ready(function() {
	taida_startmenu_add('Notepad', '/images/file.png', function() {
		notepad_open();
	});
	taida_upon_file_open('txt', notepad_open, '/images/file.png');
	taida_upon_file_open('md', notepad_open, '/images/file.png');
});
