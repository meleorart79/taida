/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Orb web desktop
 * https://gitlab.com/hsleisink/orb
 *
 * Licensed under the GPLv2 License
 */

var _taida_desktop_path;
var taida_read_only;
let bg_video = null;


/* Icon
 */
function taida_icon_coord_to_grid(coord, grid_size) {
	var delta = coord % grid_size;
	coord -= delta;

	if (delta > (grid_size >> 1)) {
		coord += grid_size;
	}

	return coord;
}

/* Context menu
 */
function get_context_menu_icon(icon_name) {
	switch (icon_name) {
		case 'play':
			return `<img src="/images/play.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px; filter: invert(1);">`;
		case 'pause':
			return `<img src="/images/pause.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px; filter: invert(1);">`;
		default:
			return ''; // or a fallback icon
	}
}

function taida_contextmenu_show(target, event, items, handler) {
	const $menu = $('#taida-contextmenu');
	$menu.empty();

	items.forEach(item => {
		const $entry = $('<li></li>')
			.text(item.name)
			.addClass('context-item')
			.prepend(get_context_menu_icon(item.icon))
			.on('click', function(e) {
				e.stopPropagation();
				$menu.hide();
				handler(target, item.name);
			});
		$menu.append($entry);
	});

	$menu.css({
		top: event.pageY + 'px',
		left: event.pageX + 'px',
		display: 'inline-block',
		position: 'absolute',
		zIndex: 99999
	});
}


/* Refresh desktop
 */
function taida_desktop_refresh() {
	taida_directory_list(_taida_desktop_path, function(items) {
		var desktop = $('div.desktop div.icons');

		desktop.empty();

		/* Fill explorer
		 */
		items.forEach(function(item) {
			if (item.type == 'directory') {
				var icon = taida_file_make_icon(item, _taida_desktop_path, 'directory');
				desktop.append(icon);
			}
		});

		items.forEach(function(item) {
			if (item.type == 'file') {
				var icon = taida_file_make_icon(item, _taida_desktop_path, 'file');
				desktop.append(icon);
			}
		});

		var y = 0;
		$('div.desktop div.icons div.icon').each(function() {
			var width = Math.round($(this).outerWidth());
			var height = Math.round($(this).innerHeight() - $(this).find('span').innerHeight()) + 30;

			$(this).css('top', (y++ * height) + 'px');

			/* Drag file
			 */
			if (taida_read_only == false) {
				$(this).draggable({
					containment: 'parent',
					helper: 'clone',
					handle: 'img',
					zIndex: 10000,
					start: function() {
						taida_startmenu_close();
					},
					stop: function(event, ui) {
						if (taida_key_pressed(KEY_CTRL)) {
							return;
						}

						var pos = $(ui.helper).position();

						pos.top = taida_icon_coord_to_grid(pos.top, height);
						pos.left = taida_icon_coord_to_grid(pos.left, width);

						var win_y = $('div.icons').height();
						var icon = $(this);
						var moved;

						do {
							moved = false;

							$('div.desktop div.icons div.icon').each(function() {
								if ($(this).hasClass('ui-draggable-dragging')) {
									return true;
								}

								if ($(this).is(icon)) {
									return true;
								}

								var other = $(this).position();
								if ((pos.top == other.top) && (pos.left == other.left)) {
									pos.top += height;

									if (pos.top + height > win_y) {
										pos.top = taida_icon_coord_to_grid(0, height);
										pos.left += width;
									}

									moved = true;
								}
							});
						} while (moved);

						$(this).css('top', pos.top + 'px');
						$(this).css('left', pos.left + 'px');
					}
				});
			}
		});

		/* Click file on mobile device
		 */
		if ($('div.desktop').attr('mobile') == 'yes') {
			$('div.desktop div.icons div.icon').on('click', function() {
				var filename = _taida_desktop_path + '/' + $(this).find('span').text();

				if (desktop.data('click_last') == filename) {
					desktop.data('click_last', null);
					$(this).trigger('dblclick');
				} else {
					desktop.data('click_last', filename);
				}
			});
		}

		/* Double click file
		 */
		$('div.desktop div.icons div.icon').on('dblclick', function() {
			var filename = _taida_desktop_path + '/' + $(this).find('span').text();
			var type = $(this).attr('type');

			if (type == 'file') {
				var extension = taida_file_extension(filename);

				if ((handler = taida_get_file_handler(extension)) != undefined) {
					handler(filename);
				} else {
					window.open('/taida/file/download/' + url_encode(filename), '_blank').focus();
				}
			} else {
				if ((handler = taida_get_directory_handler()) != undefined) {
					handler(filename);
				}
			}
		});

		/* Right click
		 */
		$('div.desktop div.icons div.icon').on('contextmenu', function(event) {
			taida_startmenu_close();

			var menu_entries = [];
			if ($(this).attr('type') == 'file') {
				menu_entries.push({ name: 'Download', icon: 'download' });
			}
			menu_entries.push({ name: 'Rename', icon: 'edit' });
			menu_entries.push({ name: 'Delete', icon: 'remove' });

			taida_contextmenu_show($(this), event, menu_entries, taida_desktop_contextmenu_handler);
			return false;
		});
	}, function(result) {
		taida_alert('The directory "' + _taida_desktop_path + '" is missing in your home directory.', 'Error');
	});
}

/* Rearrange windows and icons on the desktop
 */
function taida_desktop_rearrange() {
	/* Rearrange windows
	 */
	var windows_width = Math.round($('div.windows').width());
	var windows_height = Math.round($('div.windows').height());

	$('div.windows div.window').each(function() {
	    if ((windat = $(this).data('maximize')) != undefined) {
			$(this).removeData('maximize');
			taida_window_maximize($(this).attr('id'));
			$(this).data('maximize', windat);
			return true;
		}

		if ($(this).is(':visible') == false) {
			return true;
		}

		var pos = $(this).position();
		var width = Math.round($(this).outerWidth());
		var height = Math.round($(this).outerHeight());

		if (pos.left + width >= windows_width) {
			pos.left = windows_width - width;
		}

		if (pos.left < 0) {
			pos.left = 0;
			if ($(this).is('.ui-resizable')) {
				if (pos.left + width > windows_width) {
					$(this).css('width', windows_width + 'px');
				}
			}
		}

		if (pos.top + height >= windows_height) {
			pos.top = windows_height - height;
		}

		if (pos.top < 0) {
			pos.top = 0;
			if ($(this).is('.ui-resizable')) {
				if (pos.top + height > windows_height) {
					$(this).css('height', windows_height + 'px');
				}
			}
		}

		$(this).css('top', pos.top + 'px');
		$(this).css('left', pos.left + 'px');
	});

	/* Rearrange icons
	 */
	var icons_width = Math.round($('div.icons').width());
	var icons_height = Math.round($('div.icons').height());

	$('div.desktop div.icons div.icon').each(function() {
		var pos = $(this).position();
		var width = Math.round($(this).outerWidth());
		var height = Math.round($(this).outerHeight());

		while (pos.left + width >= icons_width) {
			pos.left -= width;
			if (pos.left < 0) {
				pos.left = 0;
				break;
			}
		}

		while (pos.top + height >= icons_height) {
			pos.top -= height;
			if (pos.top < 0) {
				pos.top = 0;
				break;
			}
		}

		$(this).css('top', pos.top + 'px');
		$(this).css('left', pos.left + 'px');
	});
}

/* Load wallpaper
 */
function load_video_background(video_url) {
  const desktop_div = document.querySelector('.desktop');
  if (!desktop_div) return console.error('Desktop div not found');

  // Assign to global
  bg_video = document.createElement('video');
  bg_video.classList.add('bg-video');
  bg_video.src = video_url;
  bg_video.autoplay = true;
  bg_video.muted = true;
  bg_video.loop = true;
  bg_video.playsInline = true;

  // Create the warm overlay
  const warm_overlay = document.createElement('div');
  warm_overlay.classList.add('video-warm-overlay');

  // Insert video and overlay
  desktop_div.insertBefore(bg_video, desktop_div.firstChild);
  desktop_div.appendChild(warm_overlay);
}

/* Menu handler
 */
function taida_desktop_contextmenu_handler(target, option) {
	var filename = target.find('span').text();

	switch (option) {
		case 'Download':
			var url = '/taida/file/download/' + _taida_desktop_path + '/' + url_encode(filename);
			window.open(url, '_blank').focus();
			break;
		case 'Rename':
			taida_prompt('Rename file:', filename, function(new_filename) {
				new_filename = new_filename.trim();
				if (new_filename == '') {
					taida_alert('The new filename cannot be empty.');
				} else if (new_filename != filename) {
					taida_file_rename(_taida_desktop_path + '/' + filename, new_filename, undefined, function() {
						taida_alert('Error while renaming file or directory.', 'Error');
					});
				}
			});
			break;
		case 'Delete':
			taida_confirm('Delete ' + filename + '?', function() {
				if (target.attr('type') == 'file') {
					taida_file_remove(_taida_desktop_path + '/' + filename, undefined, function() {
						taida_alert('Error while deleting file.', 'Error');
					});
				} else {
					taida_directory_remove(_taida_desktop_path + '/' + filename, undefined, function() {
						taida_alert('Error while deleting directory.', 'Error');
					});
				}
			}); 
			break;
		case 'Play':
		case 'Pause':
			if (bg_video) {
				if (bg_video.paused) {
					bg_video.play();
				} else {
					bg_video.pause();
				}
			}
			break;
	}
}

/* Mobile device support
 */
function mobile_device_support() {
	if ($('div.desktop').attr('mobile') == 'no') {
		if (navigator.maxTouchPoints <= 2) {
			return;
		}

		if (/MacIntel/.test(navigator.platform) == false) {
			return;
		}

		$('div.desktop').attr('mobile', 'yes');
	}

	taida_load_javascript('/js/jquery.ui.touch-punch.js');
}

/* Main
 */
$(document).ready(function() {
    mobile_device_support();

    _taida_desktop_path = $('div.desktop').attr('path');
    taida_read_only = $('div.desktop').attr('read_only') == 'no';

	const desktop_div = document.querySelector('.desktop');
	if (!desktop_div) {
		console.error('Desktop div not found');
		return;
	}

	// Idle screen

	let idle_timer;
	const idle_delay = 60000; // 1 min
	const sleep_screen = document.getElementById('sleep-screen');

	function show_sleep_screen() {
		sleep_screen.classList.add('show');
	}

	function hide_sleep_screen() {
		sleep_screen.classList.remove('show');
	}

	function reset_idle_timer() {
		clearTimeout(idle_timer);
		hide_sleep_screen();
		idle_timer = setTimeout(show_sleep_screen, idle_delay);
	}

	['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(event =>
		document.addEventListener(event, reset_idle_timer)
	);

	reset_idle_timer(); // Start on page load
	/* */

	load_video_background('/images/animatedlogo.webm');

    taida_setting_get('system/color', function(color) {
        taida_window_set_color(color);
    }, function() {
        taida_alert('Error loading window color.', 'Error');
        taida_window_set_color('#808080');
    });

	window.setTimeout(taida_desktop_refresh, 100);

	if ($('#taida-contextmenu').length === 0) {
		$('body').append('<ul id="taida-contextmenu" class="context-menu"></ul>');
	}

	// Auto-hide on outside click
	$(document).on('click contextmenu', function() {
		$('#taida-contextmenu').hide();
	});
	
	/* Droppable
	 */
	if (taida_read_only == false) {
		$('div.desktop').droppable({
			accept: 'div.icon, div.detail',
			drop: function(event, ui) {
				var span = ui.helper.find('span').first();
				var source_filename = span.text();
				var source_path = span.attr('path');
				var source = source_path + '/' + source_filename;

				if (source_path == 'Desktop') {
					return;
				}

				taida_file_exists('Desktop/' + source_filename, function(exists) {
					var ctrl_pressed = taida_key_pressed(KEY_CTRL);

					var file_operation = function() {
						if (ctrl_pressed) {
							taida_file_copy(source, _taida_desktop_path, undefined, function() {
								taida_alert('Error copying file.', 'Error');
							});
						} else {
							taida_file_move(source, _taida_desktop_path, undefined, function() {
								taida_alert('Error moving file.', 'Error');
							});
						}
					};

					if (exists) {
						taida_confirm('Destination file already exists. Overwrite?', file_operation);
					} else {
						file_operation();
					}

				});
			}
		});
	}

	/* Clicks
	 */
	$('div.desktop').on('click', function() {
		taida_startmenu_close();
		taida_window_unfocus_all()
	});

	$('div.desktop').on('contextmenu', function(event) {
		taida_startmenu_close();

		let menu_entries = [];

		if (bg_video) {
			menu_entries.push({
				name: bg_video.paused ? 'Play' : 'Pause',
				icon: bg_video.paused ? 'play' : 'pause'
			});
		}

		taida_contextmenu_show($(this), event, menu_entries, taida_desktop_contextmenu_handler);
		return false;
	});


	/* Resize browser window
	 */
	var resize = 0;
	$(window).on('resize', function() {
		var current = ++resize;
		setTimeout(function() {
			if (current != resize) {
				return;
			}

			taida_desktop_rearrange();
			taida_taskbar_set_task_width();

			$('div.desktop div.windows div.window').each(function() {
				if ($(this).data('maximize') == undefined) {
					return true;
				}

				if ($(this).is(':visible') == false) {
					return true;
				}

				var settings = $(this).data('settings');
				if ((settings.resize != undefined) && (settings.resize != false)) {
					settings.resize();
				}
			});
		}, 100);
	});

	/* File changes
	 */
	taida_directory_upon_update(function(directory) {
		if (directory == _taida_desktop_path) {
			taida_desktop_refresh();
		}
	});

	/* Drop files
	 */
	if (taida_read_only == false) {
		$('div.desktop').on('dragover', function(event) {
			if ($('div.explorer').length == 0) {
				explorer_open(_taida_desktop_path);
			} else {
				$('div.explorer').each(function() {
					taida_window_raise($(this).parent().parent());
				});
			}

			event.preventDefault();
			event.stopPropagation();
		});

		$('div.desktop').on('drop', function(event) {
			event.preventDefault();
			event.stopPropagation();
		});
	}
});
