/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

var _taida_window_id_label = 'windowframe';

/* About
 */
function taida_window_about(win) {
	var title = win.find('div.window-header div.title').text();
	var id = win.find('div.window-body > div').data('windowframe_id');

	taida_alert('Application: ' + title + '\nProcess ID: ' + id, 'Window information');
}

/* Get window max z-index
 */
function taida_window_max_zindex() {
	var max_zindex = 0;

	$('div.windows > div').each(function() {
		var zindex = parseInt($(this).css('z-index'));
		if (isNaN(zindex) == false) {
			if (zindex > max_zindex) {
				max_zindex = zindex;
			}
		}
	});

	return max_zindex;
}

/* Raise window
 */
function taida_window_raise(windowframe) {
	if (windowframe.hasClass('focus')) {
		return;
	}

	taida_startmenu_close();

	if ($('div.windows > div.dialog:not(.closing)').length > 0) {
		if (windowframe.hasClass('dialog') == false) {
			return;
		}
	}

	var zindex = taida_window_max_zindex() + 1;
	windowframe.css('z-index', zindex);

	$('div.windows div.window').removeClass('focus');
	$('div.windows:not(focus) ul.nav ul').hide();

	windowframe.addClass('focus');

	taida_taskbar_focus(windowframe.prop('id'));
}

/* Maximize window
 */
function taida_window_maximize(window_id) {
    var windowframe = $('div.windows div#' + window_id);
    if (windowframe.length === 0) {
        console.error("taida_window_maximize: No window found with ID", window_id);
        return;
    }

    var windat = windowframe.data('maximize');
    if (windat === undefined) {
        var pos = windowframe.position();
        if (!pos) {
            console.error("taida_window_maximize: Could not get position of window", window_id);
            return;
        }
        windat = [ pos.left, pos.top, windowframe.width(), windowframe.height() ];
        windowframe.data('maximize', windat);
        var pos_x = 0;
        var pos_y = 0;
        var width = Math.round($('div.windows').width());
        var height = Math.round($('div.windows').height());
    } else {
        var [pos_x, pos_y, width, height] = windat;
        windowframe.removeData('maximize');
    }

    windowframe.animate({
        left: pos_x + 'px',
        top: pos_y + 'px',
        width: width + 'px',
        height: height + 'px'
    }, ANIMATE_SPEED, function() {
        var settings = windowframe.data('settings');
        if (settings.resize !== undefined && settings.resize !== false) {
            settings.resize();
        }
    });
}


/* Minimize window
 */
function taida_window_minimize(window_id) {
    var windowframe = $('div.windows div#' + window_id);
    if (windowframe.length === 0) {
        console.error("taida_window_minimize: No window found with ID", window_id);
        return;
    }

    var task = $('div.taskbar div.tasks div.task[taskid=' + window_id + ']');
    task.addClass('minimized');

    windowframe.removeClass('focus');

    var win_pos = windowframe.offset();
    var task_pos = task.offset();
    if (!win_pos || !task_pos) {
        console.error("taida_window_minimize: Failed to get window/task position");
        return;
    }

    var width = windowframe.width();
    var dx = (task_pos.left - win_pos.left).toString();
    var dy = (task_pos.top - win_pos.top).toString();

    windowframe.css('transition', 'all .3s ease-in');
    windowframe.css('transform', 'translate(' + dx + 'px, ' + dy + 'px) scale(0)');

    window.setTimeout(function() {
        windowframe.hide();
    }, ANIMATE_SPEED);
}


/* Unfocus all windows
 */
function taida_window_unfocus_all() {
	$('div.windows ul.nav ul').hide();
	$('div.desktop div.windows div.focus').removeClass('focus');
}

/* Set window color
 */
function taida_window_set_color(bgcolor) {
	if (typeof bgcolor != 'string') {
		return false;
	} else if (bgcolor.length != 7) {
		return false;
	} else if (bgcolor.substr(0, 1) != '#') {
		return false;
	}

	var red = Number('0x' + bgcolor.substr(1, 2)) / 255;
	var green = Number('0x' + bgcolor.substr(3, 2)) / 255;
	var blue = Number('0x' + bgcolor.substr(5, 2)) / 255;

	var max = Math.max(red, Math.max(green, blue));
	var min = Math.min(red, Math.min(green, blue));
	var luminosity = (max + min) / 2;

	var txt_color = (luminosity > 0.5) ? '#000000' : '#ffffff';

	$('head style#taida_window_color').remove();

	var style = '<style id="taida_window_color" type="text/css">\n' +
		'div.windows div.window div.window-header {' +
		'\tcolor: ' + txt_color + ';' +
		'\tbackground-color: ' + bgcolor + ';' +
		'}\n' +
		'</style>';

	$('head').append(style);

	return true;
}

/* Set window title
 */
function taida_window_set_title(windowframe, title) {
	windowframe.parent().parent().find('div.window-header div.title').text(title);

}

/* Window plugin
 */
(function($) {
	const MARGIN_BOTTOM = 30;

	var pluginName = 'taida_window';
	var defaults = {
		top: undefined,
		width: 600,
		minWidth: 400,
		height: undefined,
		bgcolor: undefined,
		header: 'Application',
		icon: undefined,
		menu: undefined,
		open: undefined,
		close: undefined,
		maximize: undefined,
		minimize: undefined,
		resize: undefined,
		dialog: false,
		taskbar: true
	};

	var mouse_offset_x;
	var mouse_offset_y

	/* Constructor
	 */
	var plugin = function(el, options) {
		var element = $(el);
		var settings = $.extend({}, defaults, options);
		var id = 1;
		while ($('div.windows div#' + _taida_window_id_label + id).length > 0) {
			id++;
		}

		if (settings.dialog == true) {
			settings.minimize = false;
		}

		element.data('windowframe_id', id);
		element.data('header', settings.header);

		var menu = '';
		if (settings.menu != undefined) {
			menu += '<ul class="nav nav-tabs">';
			for ([item, entries] of Object.entries(settings.menu)) {
				menu += '<li class="dropdown">' +
				        '<a class="dropdown-toggle" href="#" onClick="javascript:return false" ' +
				        ' ondragstart="return false">' + item +
				        '</a><ul class="dropdown-menu">';
				entries.forEach(function(entry) {
					if (entry == '-') {
						menu += '<li class="divider"></li>';
					} else {
						menu += '<li><a class="entry" href="#" onClick="javascript:return false" ondragstart="return false">' + entry + '</a></li>';
					}
				});
				menu += '</ul></li>';
			};
			menu += '</ul>';
		}

		/* Window frame
		 */

		var window_buttons =
			'<div class="window-buttons">' +
				(settings.minimize === true ? '' : '<span class="window-btn minimize-btn"></span>') +
				(settings.maximize === true ? '' : '<span class="window-btn maximize-btn"></span>') +
				(settings.close === true ? '' : '<span class="window-btn close-btn"></span>') +
			'</div>';
		var icon = (settings.icon == undefined) ? '' : '<img src="' + settings.icon + '" class="icon" />';
		var windowframe = '<div id="windowframe' + id + '" class="window" tabindex="' + id + '"><div class="window-header">' +
			icon + '<div class="title">' + settings.header + '</div>' + window_buttons + '</div>' +
			menu + '<div class="window-body"></div></div>';
		$('div.windows').append(windowframe);

		windowframe = $('div.windows div#' + _taida_window_id_label + id);
		windowframe.data('settings', settings);
		if (settings.dialog) {
			windowframe.addClass('dialog');
		}

		/* Menu
		 */
		windowframe.find('ul.nav > li').on('click', function(event) {
			taida_window_raise(windowframe);

			var visible = $(this).find('ul:visible').length > 0;
			$(this).parent().find('ul').hide();

			if (visible == false) {
				event.stopPropagation();

				$(this).find('ul').show(50);

				$('body').one('click', function() {
					windowframe.find('ul.nav ul').hide();
				});
			}
		});

		windowframe.find('ul.nav > li > a').mouseover(function(event) {
			var visible = $(this).parent().parent().find('ul:visible');

			if (visible.length == 0) {
				return;
			}

			if ($(this).is(visible.parent().children('a'))) {
				return;
			}

			$(this).parent().parent().find('ul').hide();
			$(this).parent().find('ul').show(50);
		});

		windowframe.find('ul.nav a.entry').on('click', function(event) {
			$(this).parent().parent().hide();

			var div = windowframe.find('div.window-body').children().first();
			settings.menuCallback(div, $(this).text());
			windowframe.find($('ul.nav li').removeClass('open'));

			event.stopPropagation();
		});

		/* Right-click dummy
		 */
		$('div.windows div#' + _taida_window_id_label + id).on('contextmenu', function() {
			menu_entries = [{ name: 'About this application', icon: 'info-circle' }];
			taida_contextmenu_show($(this), event, menu_entries, taida_window_about);

			taida_window_raise($(this));

			return false;
		});

		/* Window header buttons */
		windowframe.find('span.close-btn').on('click', function(event) {
			event.stopPropagation();
			windowframe_close.call($(this).closest('.window')[0]);
		});


		windowframe.find('span.maximize-btn').on('click', function(event) {
			var windowframe_id = $(this).closest('.window').attr('id');
			taida_window_maximize(windowframe_id);

			var windowframe = $('div.windows div#' + windowframe_id);
			var settings = windowframe.data('settings');
			if ((settings.resize != undefined) && (settings.resize != false)) {
				settings.resize();
			}
		});

		windowframe.find('span.minimize-btn').on('click', function(event) {
			var windowframe_id = $(this).closest('.window').attr('id');

			taida_window_minimize(windowframe_id);

			event.stopPropagation();
		});


		/* Add body
		 */
		var body = element.detach();
		windowframe.find('div.window-body').append(body.show());

		/* Style
		 */
		if (settings.width > window.innerWidth - 40) {
			settings.width = window.innerWidth - 40;
		}

		windowframe.css({
			display: 'none', position: 'absolute',
			boxShadow: '10px 10px 20px #181818',
			width: settings.width + 'px', zIndex: 1
		});

		if (settings.height + 50 > window.innerHeight - MARGIN_BOTTOM) {
			settings.height = window.innerHeight - MARGIN_BOTTOM - 50;
		}

		if (settings.height != undefined) {
			windowframe.css({
				height: (settings.height + 50) + 'px'
			});
		}

		if (settings.bgcolor != undefined) {
			windowframe.css('background-color', settings.bgcolor);
		}

		/* Click
		 */
		windowframe.on('click', function(event) {
			windowframe.find('ul.nav ul').hide();
			taida_window_raise($(this));

			event.stopPropagation();
		});

		/* Draggable
		 */
		windowframe.draggable({
			containment: 'div.windows',
			handle: 'div.window-header',
			start: function() {
				taida_window_raise($(this));
				taida_startmenu_close();
			},
			stop: function() {
				var pos = $(this).position();
				if (pos.left < 0) {
					$(this).css('left', '0px');
				}
				if (pos.top < 0) {
					$(this).css('top', '0px');
				}
			}
		});

		/* Resizable
		 */
		if (settings.resize !== false) {
			windowframe.resizable({
				minWidth: settings.minWidth,
				stop: function() {
					if ((settings.resize != undefined) && (settings.resize != false)) {
						settings.resize();
					}
					windowframe.removeData('maximize');
				}
			});
		}
	};

	/* Functions
	 */
	var unselect_text = function() {
		if (window.getSelection || document.getSelection) {
			window.getSelection().removeAllRanges();
		} else {
			document.selection.empty();
		}
	}

	var windowframe_open = function() {
		var windowframe_id = $(this).data('windowframe_id');
		var windowframe = $('div.windows div#' + _taida_window_id_label + windowframe_id);
		var settings = windowframe.data('settings');

		/* Dialog
		 */
		if (settings.dialog) {
			var zindex = taida_window_max_zindex() + 1;
			var overlay = '<div class="overlay overlay' + windowframe_id + '" style="z-index:' + zindex + '"></div>';
			$('div.windows').append(overlay);
			$('div.taskbar').append(overlay);
			$('div.overlay').on('click', function(event) {
				event.stopPropagation();
			});
			$('div.overlay').on('contextmenu', function(event) {
				event.stopPropagation();
				return false;
			});
		}

		taida_window_raise(windowframe);

		windowframe.fadeIn(400, function() {
			if (settings.open != undefined) {
				settings.open();
			}
		});

		if ((settings.dialog == false) && settings.taskbar) {
			taida_taskbar_add('windowframe' + windowframe_id);
		}

		/* Center windowframe
		 */
		var mobile_device = $('div.desktop').attr('mobile') == 'yes';

		var left = Math.round((window.innerWidth / 2) - (settings.width / 2));
		if (mobile_device == false) {
			left += Math.floor((Math.random() * 50) - 25);
		}
		if (left < 0) {
			left = 0;
		}
		windowframe.css('left', left + 'px');

		var height = windowframe.outerHeight(false);
		if (settings.top == undefined) {
			var top = Math.round((window.innerHeight / 2.5) - (height / 2));
			if (mobile_device == false) {
				top += Math.floor((Math.random() * 50) - 25);
			}
			if (top < 0) {
				top = 0;
			}
			windowframe.css('top', top + 'px');
		} else {
			windowframe.css('top', settings.top);
		}

		var pos = windowframe.position();
		if (pos.top < 0) windowframe.css('top', '0px');
		if (pos.left < 0) windowframe.css('left', '0px');
		var bottom = pos.top + height;
		if (bottom > window.innerHeight - MARGIN_BOTTOM) {
			windowframe.find('div.window-body').css({
				maxHeight: (height - (bottom - window.innerHeight) - 45 - MARGIN_BOTTOM) + 'px',
				overflowY: 'auto'
			});
		}
	};

	var windowframe_close = function(event) {
		// close via javascript?
		var windowframe_id = $(this).attr('id');
		if (windowframe_id == undefined) {
			// close via window header close button?
			windowframe_id = $(this).parent().parent().attr('id');
		}

		if (windowframe_id != undefined) {
			var windowframe = $('div.windows div#' + windowframe_id);
			var settings = windowframe.data('settings');

			if ((settings.close != undefined) && (settings.close != false)) {
				if (settings.close() === false) {
					return;
				}
			}

			windowframe.removeClass('focus');
			windowframe.addClass('closing');

			if (settings.dialog) {
				var id = windowframe.find('div.window-body > div').data('windowframe_id');
				$('div.windows div.overlay' + id).remove();
				$('div.taskbar div.overlay' + id).remove();
			}

			windowframe.fadeOut(200, function() {
				windowframe.remove();
				taida_taskbar_remove(windowframe_id);

				delete $(this);
			});
		} else {
			taida_confirm('Taida Error: Object has no window id. Remove anyway?', function() {
				$('div.windows div.overlay').remove();
				$('div.taskbar div.overlay').remove();
				$(this).parent().parent().remove();
			});
		}
	};

	var get_body = function() {
		var windowframe_id = $(this).data('windowframe_id');
		return $('div.windows div#' + _taida_window_id_label + windowframe_id + ' div.window-body').children().first();
	}

	var set_header = function(extra = '') {
		var header = $(this).data('header');
		if (extra != '') {
			header += ' :: ' + taida_file_filename(extra);
		}

		$(this).parent().parent().find('div.window-header div.title').text(header);

		var windowframe_id = $(this).data('windowframe_id');
		$('div.desktop div.taskbar div.tasks div[taskid=windowframe' + windowframe_id + '] span').text(header);
	}

	/* jQuery prototype
	 */
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			(new plugin(this, options));
		});
	};

	$.fn.extend({
		open: windowframe_open,
		close: windowframe_close,
		body: get_body,
		set_header: set_header
	});
})(jQuery);
