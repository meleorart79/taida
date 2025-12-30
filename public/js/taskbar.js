/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
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
		taida_startmenu_system('Logout', '/images/logout.png', taida_logout);
	}
});
