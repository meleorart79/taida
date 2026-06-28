/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Orb web desktop
 * https://gitlab.com/hsleisink/orb
 *
 * Licensed under the GPLv2 License
 */

/* Start menu
 */
function taida_startmenu_add(label, icon, callback) {
	var entry = $('<div class="application"><img src="' + icon + '" class="icon" draggable="false" /><span>' + label + '</span></div>');

	entry.on('click', function() {
		taida_startmenu_close();
		callback();
	});

	var startmenu = $('div.taskbar div.startmenu div.applications');

	var applications = startmenu.find('div.application');
	if (applications.length == 0) {
		startmenu.append(entry);
		return;
	}

	label = label.toLowerCase();
	var first = applications.first().find('span').text().toLowerCase();

	if (label.localeCompare(first) == -1) {
		startmenu.prepend(entry);
		return;
	}

	var added = false;
	applications.each(function() {
		var name = $(this).find('span').text();
		if (label.localeCompare(name) == -1) {
			$(this).before(entry);
			added = true;
			return false;
		}
	});

	if (added == false) {
		startmenu.append(entry);
	}
}

function taida_startmenu_system(label, icon, callback) {
	var entry = $('<img src="' + icon + '" class="icon" alt="' + label + '" title="' + label + '" draggable="false" />');

	entry.on('click', function() {
		taida_startmenu_close();
		callback();
	});

	$('div.taskbar div.startmenu div.system').append(entry);
}

function taida_startmenu_close() {
	$('div.taskbar div.startmenu').hide();
}

function taida_settings_open() {
	var current_zoom = $('div.desktop').attr('zoom') || '0.75';
	var view = $(
		'<div class="taida-system-window taida-settings">' +
			'<label>Window color<input type="color" class="settings-color" value="#333333" /></label>' +
			'<label>Desktop zoom<input type="range" class="settings-zoom" min="0.5" max="1.25" step="0.05" value="' + current_zoom + '" /></label>' +
			'<div class="settings-zoom-value">' + current_zoom + '</div>' +
			'<button type="button" class="settings-save">Save</button>' +
		'</div>'
	);

	taida_setting_get('system/color', function(color) {
		view.find('.settings-color').val(color);
	}, function() {
		view.find('.settings-color').val('#333333');
	});

	view.find('.settings-zoom').on('input', function() {
		view.find('.settings-zoom-value').text($(this).val());
	});

	view.find('.settings-save').on('click', function() {
		var color = view.find('.settings-color').val();
		var zoom = view.find('.settings-zoom').val();

		taida_setting_set('system/color', color, function() {
			taida_window_set_color(color);
		});

		taida_setting_set('system/zoom', zoom, function() {
			$('div.desktop').attr('zoom', zoom);
		});
	});

	view.taida_window({
		header: 'Settings',
		icon: '/images/settings.svg',
		width: 320,
		height: 210,
		minWidth: 280,
		resize: false
	});
	view.open();
}

function taida_info_open() {
	var apps = $('div.taskbar div.startmenu div.applications div.application span').map(function() {
		return $(this).text();
	}).get();

	var view = $(
		'<div class="taida-system-window taida-info">' +
			'<h2>Taida</h2>' +
			'<dl>' +
				'<dt>Version</dt><dd>' + ($('div.desktop').attr('version') || 'unknown') + '</dd>' +
				'<dt>User</dt><dd>' + ($('div.desktop').attr('username') || 'unknown') + '</dd>' +
				'<dt>Desktop</dt><dd>' + ($('div.desktop').attr('path') || 'Desktop') + '</dd>' +
				'<dt>Applications</dt><dd>' + apps.length + '</dd>' +
			'</dl>' +
			'<p>Browser desktop, core services, ordinary apps. Keep it weird, keep it useful.</p>' +
		'</div>'
	);

	view.taida_window({
		header: 'Info',
		icon: '/images/info.svg',
		width: 360,
		height: 260,
		minWidth: 300,
		resize: false
	});
	view.open();
}



/* Taskbar
 */
function taida_taskbar_add(task_id) {
	var task = $('div.windows div#' + task_id);
	var title = task.find('div.window-header div.title').text();
	var icon = task.find('img.icon').attr('src');
	if (icon != undefined) {
		icon = '<img src="' + icon + '" />';
	} else {
		icon = '';
	}

	var app_id = task_id.substr(11);

	$('div.taskbar div.tasks').append('<div class="task" taskid="' + task_id + '" title="' + title + ' (PID:' + app_id + ')">' + icon + '<span>' + title + '</span></div>');

	$('div.taskbar div.tasks div.task[taskid=' + task_id + ']').on('click', function(event) {
		if ($(this).hasClass('minimized')) {
			task.show();
			taida_window_raise(task);
			task.css('transform', 'translate(0, 0) scale(1)');
			var bar = $(this);

			window.setTimeout(function() {
				task.css('transition', '');
				task.css('transform', '');

				bar.removeClass('minimized');

				var settings = task.data('settings');
				if ((settings.resize != undefined) && (settings.resize != false)) {
					settings.resize();
				}
			}, ANIMATE_SPEED);
		} else if (task.find('span.fa-window-minimize').length == 0) {
			taida_window_raise(task);
		} else if (task.hasClass('focus') == false) {
			taida_window_raise(task);
		} else {
			taida_window_minimize(task_id);
		}

		event.stopPropagation();
	});

	taida_taskbar_set_task_width();
}

function taida_taskbar_focus(task_id) {
	$('div.taskbar div.tasks div.task').removeClass('focus');
	$('div.taskbar div.tasks div.task[taskid=' + task_id + ']').addClass('focus');
}

function taida_taskbar_remove(task_id) {
	$('div.taskbar div.tasks div.task[taskid=' + task_id + ']').remove();

	taida_taskbar_set_task_width();
}

function taida_taskbar_clock() {
	var clock = $('div.taskbar div.clock');

	var d = new Date();
	var time = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
	var date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + (1900 + d.getYear());

	clock.html(time + '<br />' + date);
}

function taida_taskbar_set_task_width() {
	var count = $('div.taskbar div.tasks div.task').length;
	if (count == 0) {
		return;
	}

	var width = $('div.taskbar').innerWidth() - $('div.taskbar div.start').outerWidth() -
	            $('div.taskbar div.quickstart').outerWidth() - $('div.taskbar div.clock').outerWidth();
	width = (width / count) - 7;

	$('div.taskbar div.tasks div.task').css('width', width + 'px');
}

/* Main
 */
$(document).ready(function() {
	$('div.taskbar div.start').on('click', function(event) {
		taida_window_unfocus_all()
		var zindex = taida_window_max_zindex() + 1;
		$('div.taskbar').css('z-index', zindex);
		$('div.taskbar div.startmenu').css('z-index', zindex + 1);
		$('div.taskbar div.startmenu').toggle(200);
		$('div.taskbar div.startmenu div.applications')[0].scrollTop = 0;
		event.stopPropagation();
	});

	$('div.taskbar').on('click', function(event) {
		taida_window_unfocus_all()
		event.stopPropagation();
	});

	$('div.taskbar div.startmenu').on('click', function(event) {
		event.stopPropagation();
	});

	taida_taskbar_clock();

	var d = new Date();
	window.setTimeout(function() {
		taida_taskbar_clock();
		window.setInterval(taida_taskbar_clock, 60000);
	}, (60 - d.getSeconds()) * 1000);

	if ($('div.desktop').attr('login') != 'none') {
		taida_startmenu_system('Settings', '/images/settings.svg', taida_settings_open);
		taida_startmenu_system('Info', '/images/info.svg', taida_info_open);
		taida_startmenu_system('Logout', '/images/logout.png', taida_logout);
	}
});
