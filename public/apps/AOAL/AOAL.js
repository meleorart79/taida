/*
 * Achievements Of A Lifetime — v2
 *
 * The application is a "wall" twice the width of the window, holding
 * two viewports side by side: a home viewport (title + navigation)
 * and a content viewport (the selected page). Selecting a menu item
 * slides the wall so the content viewport comes into view — nothing
 * is swapped in place, the whole scene slides.
 *
 * A single piece of state drives a small rendering engine:
 *
 *     render()
 *       -> renderViewport('home', ...)      each viewport gets its
 *       -> renderViewport('content', ...)   own background layer
 *       -> renderModal()
 *
 * Persistence goes through Taida's settings API, matching the pattern
 * used by every other Taida application (see public/js/taida.js).
 *
 * No frameworks. No external UI libraries. Vanilla JS + CSS only.
 */

(function () {
	'use strict';

	/* ============================================================
	 * Constants
	 * ============================================================ */

	var AOAL_STORAGE_KEY = 'apps/aoal/data';
	var AOAL_SAVE_DELAY = 400; // ms, debounce writes to the settings file

	var AOAL_PAGES = [
		{ id: 'achievements', label: 'Achievements' },
		{ id: 'statistics', label: 'Statistics' },
		{ id: 'collections', label: 'Collections' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'goals', label: 'Goals', arrow: true },
		{ id: 'settings', label: 'Settings' }
	];

	var AOAL_ICONS = {
		close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
		plus: '<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
		edit: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/></svg>',
		trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
	};

	/*
	 * Placeholder hook for the looping day/night background videos
	 * mentioned in the brief. Each viewport variant can carry a `day`
	 * and a `night` clip URL. Until they're populated here, every
	 * viewport falls back to the animated CSS starfield/moon/fog —
	 * see aoal_apply_background_video() below.
	 */
	var AOAL_BACKGROUND_SOURCES = {
		home: { day: null, night: null },
		content: { day: null, night: null }
	};

	/* ============================================================
	 * Small helpers
	 * ============================================================ */

	function aoal_uid() {
		return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
	}

	function aoal_escape(value) {
		return $('<div></div>').text(value == null ? '' : String(value)).html();
	}

	function aoal_clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	function aoal_format_date(iso) {
		if (!iso) {
			return '';
		}
		var parts = iso.split('-');
		if (parts.length !== 3) {
			return iso;
		}
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var month = months[parseInt(parts[1], 10) - 1] || '';
		return month + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
	}

	function aoal_today_iso() {
		var now = new Date();
		var month = String(now.getMonth() + 1).padStart(2, '0');
		var day = String(now.getDate()).padStart(2, '0');
		return now.getFullYear() + '-' + month + '-' + day;
	}

	function aoal_page_index(pageId) {
		for (var i = 0; i < AOAL_PAGES.length; i++) {
			if (AOAL_PAGES[i].id === pageId) {
				return i;
			}
		}
		return -1;
	}

	/* ============================================================
	 * Default data (used only the first time the app runs)
	 * ============================================================ */

	function aoal_default_store() {
		return {
			achievements: [
				{ id: aoal_uid(), title: 'First Light', description: 'Took the first step.', date: '2026-06-01', category: 'Milestone', done: true },
				{ id: aoal_uid(), title: 'Summit of Stars', description: 'Reached a long-held goal.', date: '2026-05-12', category: 'Milestone', done: true },
				{ id: aoal_uid(), title: 'Quiet Discipline', description: 'Thirty days without missing a single one.', date: '2026-04-02', category: 'Habit', done: true }
			],
			goals: [
				{ id: aoal_uid(), title: 'Learn a new language', description: 'Reach conversational fluency.', progress: 40 },
				{ id: aoal_uid(), title: 'Run a marathon', description: 'Complete 42.2 kilometers.', progress: 65 },
				{ id: aoal_uid(), title: 'Publish something', description: 'Finish and release a personal project.', progress: 15 }
			],
			collections: [
				{ id: aoal_uid(), name: 'Places Visited', items: ['Kyoto', 'Reykjavik', 'Marrakesh'] },
				{ id: aoal_uid(), name: 'Books Finished', items: ['Dune', 'Shogun', 'The Left Hand of Darkness'] }
			]
		};
	}

	function aoal_default_settings() {
		return {
			reducedMotion: false,
			particles: true
		};
	}

	/* ============================================================
	 * Application factory — one independent instance per window
	 * ============================================================ */

	function aoal_open() {
		var state = {
			page: 'achievements', // the page shown in the content viewport
			atHome: true,         // true = wall at rest, showing the home viewport
			modal: null,
			settings: aoal_default_settings(),
			store: aoal_default_store(),
			menuIndex: 0
		};

		var view = $('<div class="aoal"></div>');
		var container = view[0];
		var saveHandle = null;

		/* ---------- persistence ---------- */

		function persist() {
			window.clearTimeout(saveHandle);
			saveHandle = window.setTimeout(function () {
				var payload = JSON.stringify({
					settings: state.settings,
					store: state.store
				});
				taida_setting_set(AOAL_STORAGE_KEY, payload);
			}, AOAL_SAVE_DELAY);
		}

		function load(callback) {
			taida_setting_get(AOAL_STORAGE_KEY, function (raw) {
				if (raw) {
					try {
						var parsed = JSON.parse(raw);
						if (parsed && parsed.store) {
							state.store = parsed.store;
						}
						if (parsed && parsed.settings) {
							state.settings = $.extend(aoal_default_settings(), parsed.settings);
						}
					} catch (error) {
						/* Corrupt or empty settings file; keep defaults. */
					}
				}
				callback();
			}, function () {
				callback();
			});
		}

		/* ---------- state mutation ---------- */

		function setState(patch) {
			$.extend(state, patch);
			render();
		}

		function mutateStore(mutator) {
			mutator(state.store);
			persist();
			render();
		}

		function openModal(modal) {
			setState({ modal: modal });
		}

		function closeModal() {
			setState({ modal: null });
		}

		// Used by both the home navigation list and the content tabs —
		// either way the wall ends up showing the content viewport.
		function selectPage(pageId) {
			var index = aoal_page_index(pageId);
			setState({
				page: pageId,
				menuIndex: index === -1 ? state.menuIndex : index,
				atHome: false
			});
		}

		// Slides the wall back to the home viewport. The previously
		// selected page is left untouched so the content viewport
		// resumes exactly where it was if the visitor slides back in.
		function goHome() {
			setState({ atHome: true });
		}

		/* ============================================================
		 * Rendering engine
		 * ============================================================ */

		function render() {
			container.innerHTML =
				'<div class="aoal-wall">' +
				renderViewport('home', renderHomeContent()) +
				renderViewport('content', renderContentShell()) +
				'</div>' +
				renderModal();

			container.className = 'aoal' +
				(state.settings.reducedMotion ? ' is-reduced-motion' : '') +
				(state.atHome ? '' : ' is-content-active');

			bindEvents();
			applyBackgroundVideos();
			focusModalField();
		}

		function renderViewport(variant, innerHtml) {
			return (
				'<section class="aoal-viewport aoal-viewport--' + variant + '">' +
				renderViewportBackground(variant) +
				'<div class="aoal-vignette"></div>' +
				innerHtml +
				'</section>'
			);
		}

		function renderViewportBackground(variant) {
			var particles = '';
			if (state.settings.particles) {
				var count = variant === 'home' ? 24 : 14;
				for (var i = 0; i < count; i++) {
					var left = (Math.random() * 100).toFixed(2);
					var delay = (Math.random() * 20).toFixed(2);
					var duration = (14 + Math.random() * 12).toFixed(2);
					particles += '<span class="aoal-particle" style="left:' + left + '%;animation-delay:-' + delay + 's;animation-duration:' + duration + 's;"></span>';
				}
			}

			return (
				'<div class="aoal-viewport-bg" data-variant="' + variant + '">' +
				// Empty until AOAL_BACKGROUND_SOURCES carries a clip for
				// this variant — see applyBackgroundVideos().
				'<video class="aoal-bg-video" muted loop playsinline></video>' +
				'<div class="aoal-bg-fallback">' +
				'<div class="aoal-moon"></div>' +
				'<div class="aoal-stars"></div>' +
				'<div class="aoal-fog aoal-fog--far"></div>' +
				'<div class="aoal-fog"></div>' +
				'<div class="aoal-particles">' + particles + '</div>' +
				'</div>' +
				'</div>'
			);
		}

		// Assigns a video source to a viewport if one has been configured
		// in AOAL_BACKGROUND_SOURCES. With no sources set (the current
		// default) this is a no-op and the CSS starfield fallback shows.
		function applyBackgroundVideos() {
			['home', 'content'].forEach(function (variant) {
				var sources = AOAL_BACKGROUND_SOURCES[variant];
				var video = container.querySelector('.aoal-viewport-bg[data-variant="' + variant + '"] .aoal-bg-video');
				if (!sources || !video) {
					return;
				}

				// Day/night selection isn't wired up yet — default to the
				// night clip since the current fallback art is nocturnal.
				var url = sources.night || sources.day;

				if (!url) {
					video.classList.remove('is-active');
					return;
				}

				if (video.getAttribute('src') !== url) {
					video.setAttribute('src', url);
				}
				video.classList.add('is-active');
				video.play().catch(function () { /* autoplay may be blocked; fallback stays visible */ });
			});
		}

		function renderHomeContent() {
			var items = AOAL_PAGES.map(function (page) {
				var active = page.id === state.page;
				return (
					'<button type="button" class="aoal-nav-item' + (active ? ' is-active' : '') + '" data-page="' + page.id + '">' +
					'<span class="aoal-nav-cursor">&#9656;</span>' +
					'<span>' + page.label + '</span>' +
					(page.arrow ? '<span class="aoal-nav-arrow">&rarr;</span>' : '') +
					'</button>'
				);
			}).join('');

			return (
				'<div class="aoal-home">' +
				'<div class="aoal-home-title">Achievements<br />of a Lifetime</div>' +
				'<div class="aoal-home-rule"></div>' +
				'<div class="aoal-home-nav-wrap">' +
				'<nav class="aoal-home-nav">' + items + '</nav>' +
				'</div>' +
				'</div>' +
				'<div class="aoal-home-footer">' + aoal_footer_text() + '</div>'
			);
		}

		function aoal_footer_text() {
			var count = state.store.achievements.filter(function (item) { return item.done; }).length;
			return count + ' Achievement' + (count === 1 ? '' : 's') + ' Earned';
		}

		function renderContentShell() {
			var tabs = AOAL_PAGES.map(function (page) {
				var active = page.id === state.page;
				return (
					'<button type="button" class="aoal-nav-item' + (active ? ' is-active' : '') + '" data-page="' + page.id + '">' +
					'<span class="aoal-nav-cursor">&#9656;</span>' +
					'<span>' + page.label + '</span>' +
					'</button>'
				);
			}).join('');

			var builder = AOAL_VIEWS[state.page] || AOAL_VIEWS.achievements;

			return (
				'<div class="aoal-content-shell">' +
				'<nav class="aoal-tabs">' +
				'<button type="button" class="aoal-back-link" data-action="go-home">&larr; Menu</button>' +
				tabs +
				'</nav>' +
				'<div class="aoal-content-body">' + builder(state) + '</div>' +
				'</div>'
			);
		}

		function renderModal() {
			if (!state.modal) {
				return '';
			}
			var builder = AOAL_MODALS[state.modal.type];
			if (!builder) {
				return '';
			}
			return (
				'<div class="aoal-modal-layer" data-role="modal-layer">' +
				'<div class="aoal-modal" data-role="modal">' +
				'<button type="button" class="aoal-modal-close" data-action="close-modal">' + AOAL_ICONS.close + '</button>' +
				builder(state.modal.payload || {}) +
				'</div>' +
				'</div>'
			);
		}

		function focusModalField() {
			var field = container.querySelector('[data-role="modal"] input, [data-role="modal"] textarea');
			if (field) {
				window.setTimeout(function () { field.focus(); }, 10);
			}
		}

		/* ============================================================
		 * Page views — pure functions of state, rendered inside the
		 * content viewport's body
		 * ============================================================ */

		var AOAL_VIEWS = {

			achievements: function (currentState) {
				var achievements = currentState.store.achievements;
				var rows = achievements.length === 0
					? '<div class="aoal-empty">No achievements recorded yet.</div>'
					: achievements.map(renderAchievementRow).join('');

				return (
					'<div class="aoal-page">' +
					'<div class="aoal-page-title">Achievements</div>' +
					'<div class="aoal-page-subtitle">A record of what has been done</div>' +
					rows +
					'<div class="aoal-add-row">' +
					'<button type="button" class="aoal-link-button" data-action="add-achievement">' + AOAL_ICONS.plus + ' New Achievement</button>' +
					'</div>' +
					'</div>'
				);
			},

			statistics: function (currentState) {
				var store = currentState.store;
				var total = store.achievements.length;
				var done = store.achievements.filter(function (item) { return item.done; }).length;
				var percent = total === 0 ? 0 : Math.round((done / total) * 100);
				var collectionItems = store.collections.reduce(function (sum, collection) { return sum + collection.items.length; }, 0);

				var stats = [
					{ value: total, label: 'Achievements' },
					{ value: percent + '%', label: 'Completed' },
					{ value: store.collections.length, label: 'Collections' },
					{ value: collectionItems, label: 'Items Collected' },
					{ value: store.goals.length, label: 'Active Goals' },
					{ value: aoal_average_progress(store.goals) + '%', label: 'Average Progress' }
				];

				return (
					'<div class="aoal-page">' +
					'<div class="aoal-page-title">Statistics</div>' +
					'<div class="aoal-page-subtitle">A quiet accounting of everything</div>' +
					'<div class="aoal-stat-grid">' +
					stats.map(function (stat) {
						return (
							'<div class="aoal-stat">' +
							'<div class="aoal-stat-value">' + stat.value + '</div>' +
							'<div class="aoal-stat-label">' + stat.label + '</div>' +
							'</div>'
						);
					}).join('') +
					'</div>' +
					'</div>'
				);
			},

			collections: function (currentState) {
				var collections = currentState.store.collections;
				var body = collections.length === 0
					? '<div class="aoal-empty">No collections yet.</div>'
					: collections.map(renderCollection).join('');

				return (
					'<div class="aoal-page">' +
					'<div class="aoal-page-title">Collections</div>' +
					'<div class="aoal-page-subtitle">Things gathered along the way</div>' +
					body +
					'<div class="aoal-add-row">' +
					'<button type="button" class="aoal-link-button" data-action="add-collection">' + AOAL_ICONS.plus + ' New Collection</button>' +
					'</div>' +
					'</div>'
				);
			},

			timeline: function (currentState) {
				var entries = currentState.store.achievements
					.filter(function (item) { return item.date; })
					.slice()
					.sort(function (a, b) { return a.date < b.date ? 1 : -1; });

				var body = entries.length === 0
					? '<div class="aoal-empty">Nothing to show yet.</div>'
					: '<div class="aoal-timeline">' + entries.map(function (entry) {
						return (
							'<div class="aoal-timeline-entry">' +
							'<div class="aoal-timeline-date">' + aoal_format_date(entry.date) + '</div>' +
							'<div class="aoal-timeline-title">' + aoal_escape(entry.title) + '</div>' +
							'</div>'
						);
					}).join('') + '</div>';

				return (
					'<div class="aoal-page">' +
					'<div class="aoal-page-title">Timeline</div>' +
					'<div class="aoal-page-subtitle">The order in which it happened</div>' +
					body +
					'</div>'
				);
			},

			goals: function (currentState) {
				var goals = currentState.store.goals;
				var rows = goals.length === 0
					? '<div class="aoal-empty">No goals set.</div>'
					: goals.map(renderGoalRow).join('');

				return (
					'<div class="aoal-page">' +
					'<div class="aoal-page-title">Goals</div>' +
					'<div class="aoal-page-subtitle">Quests still in progress</div>' +
					rows +
					'<div class="aoal-add-row">' +
					'<button type="button" class="aoal-link-button" data-action="add-goal">' + AOAL_ICONS.plus + ' New Goal</button>' +
					'</div>' +
					'</div>'
				);
			},

			settings: function (currentState) {
				var settings = currentState.settings;
				return (
					'<div class="aoal-page">' +
					'<div class="aoal-page-title">Settings</div>' +
					'<div class="aoal-page-subtitle">Adjust the atmosphere</div>' +

					'<div class="aoal-settings-row">' +
					'<div>' +
					'<div class="aoal-settings-label">Ambient Particles</div>' +
					'<div class="aoal-settings-desc">Drifting light across the background.</div>' +
					'</div>' +
					renderToggle('particles', settings.particles) +
					'</div>' +

					'<div class="aoal-settings-row">' +
					'<div>' +
					'<div class="aoal-settings-label">Reduced Motion</div>' +
					'<div class="aoal-settings-desc">Disable slow ambient animation.</div>' +
					'</div>' +
					renderToggle('reducedMotion', settings.reducedMotion) +
					'</div>' +

					'<div class="aoal-settings-row">' +
					'<div>' +
					'<div class="aoal-settings-label aoal-settings-danger">Reset All Data</div>' +
					'<div class="aoal-settings-desc">Clears achievements, goals and collections.</div>' +
					'</div>' +
					'<button type="button" class="aoal-link-button" data-action="reset-data">' + AOAL_ICONS.trash + ' Reset</button>' +
					'</div>' +
					'</div>'
				);
			}
		};

		function aoal_average_progress(goals) {
			if (goals.length === 0) {
				return 0;
			}
			var sum = goals.reduce(function (total, goal) { return total + aoal_clamp(goal.progress, 0, 100); }, 0);
			return Math.round(sum / goals.length);
		}

		function renderToggle(key, isOn) {
			return '<button type="button" class="aoal-toggle' + (isOn ? ' is-on' : '') + '" data-action="toggle-setting" data-key="' + key + '"></button>';
		}

		function renderAchievementRow(achievement) {
			return (
				'<div class="aoal-achievement-row' + (achievement.done ? ' is-done' : '') + '" data-id="' + achievement.id + '">' +
				'<div class="aoal-achievement-mark"></div>' +
				'<div class="aoal-achievement-body">' +
				'<div class="aoal-achievement-title">' + aoal_escape(achievement.title) + '</div>' +
				(achievement.description ? '<div class="aoal-achievement-desc">' + aoal_escape(achievement.description) + '</div>' : '') +
				'<div class="aoal-achievement-meta">' + aoal_escape(achievement.category || 'Milestone') + (achievement.date ? ' &middot; ' + aoal_format_date(achievement.date) : '') + '</div>' +
				'</div>' +
				'<div class="aoal-row-actions">' +
				'<button type="button" class="aoal-icon-button" data-action="edit-achievement" data-id="' + achievement.id + '">' + AOAL_ICONS.edit + '</button>' +
				'<button type="button" class="aoal-icon-button" data-action="delete-achievement" data-id="' + achievement.id + '">' + AOAL_ICONS.trash + '</button>' +
				'</div>' +
				'</div>'
			);
		}

		function renderGoalRow(goal) {
			var progress = aoal_clamp(goal.progress, 0, 100);
			return (
				'<div class="aoal-goal-row" data-id="' + goal.id + '">' +
				'<div class="aoal-goal-head">' +
				'<div>' +
				'<div class="aoal-goal-title">' + aoal_escape(goal.title) + '</div>' +
				(goal.description ? '<div class="aoal-goal-desc">' + aoal_escape(goal.description) + '</div>' : '') +
				'</div>' +
				'<div class="aoal-row-actions">' +
				'<button type="button" class="aoal-icon-button" data-action="edit-goal" data-id="' + goal.id + '">' + AOAL_ICONS.edit + '</button>' +
				'<button type="button" class="aoal-icon-button" data-action="delete-goal" data-id="' + goal.id + '">' + AOAL_ICONS.trash + '</button>' +
				'</div>' +
				'</div>' +
				'<div class="aoal-goal-bar-track">' +
				'<div class="aoal-goal-bar-fill" style="width:' + progress + '%"></div>' +
				'</div>' +
				'<div class="aoal-goal-percent">' + progress + '% Complete</div>' +
				'</div>'
			);
		}

		function renderCollection(collection) {
			var items = collection.items.length === 0
				? '<div class="aoal-empty">Empty.</div>'
				: collection.items.map(function (item, index) {
					return (
						'<div class="aoal-collection-item">' +
						'<span>' + aoal_escape(item) + '</span>' +
						'<div class="aoal-row-actions">' +
						'<button type="button" class="aoal-icon-button" data-action="delete-collection-item" data-id="' + collection.id + '" data-index="' + index + '">' + AOAL_ICONS.trash + '</button>' +
						'</div>' +
						'</div>'
					);
				}).join('');

			return (
				'<div class="aoal-collection" data-id="' + collection.id + '">' +
				'<div class="aoal-collection-name">' +
				'<span>' + aoal_escape(collection.name) + '</span>' +
				'<span class="aoal-collection-count">' + collection.items.length + ' items</span>' +
				'<div class="aoal-row-actions">' +
				'<button type="button" class="aoal-icon-button" data-action="add-collection-item" data-id="' + collection.id + '">' + AOAL_ICONS.plus + '</button>' +
				'<button type="button" class="aoal-icon-button" data-action="delete-collection" data-id="' + collection.id + '">' + AOAL_ICONS.trash + '</button>' +
				'</div>' +
				'</div>' +
				items +
				'</div>'
			);
		}

		/* ============================================================
		 * Modal views
		 * ============================================================ */

		var AOAL_MODALS = {

			'achievement-form': function (payload) {
				var isEdit = !!payload.id;
				return (
					'<div class="aoal-modal-title">' + (isEdit ? 'Edit Achievement' : 'New Achievement') + '</div>' +
					'<form data-role="achievement-form" data-id="' + (payload.id || '') + '">' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Title</label>' +
					'<input type="text" name="title" value="' + aoal_escape(payload.title || '') + '" required />' +
					'</div>' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Description</label>' +
					'<textarea name="description" rows="2">' + aoal_escape(payload.description || '') + '</textarea>' +
					'</div>' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Category</label>' +
					'<input type="text" name="category" value="' + aoal_escape(payload.category || 'Milestone') + '" />' +
					'</div>' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Date</label>' +
					'<input type="date" name="date" value="' + aoal_escape(payload.date || aoal_today_iso()) + '" />' +
					'</div>' +
					'<div class="aoal-modal-actions">' +
					'<button type="button" class="aoal-link-button" data-action="close-modal">Cancel</button>' +
					'<button type="submit" class="aoal-link-button">Save</button>' +
					'</div>' +
					'</form>'
				);
			},

			'goal-form': function (payload) {
				var isEdit = !!payload.id;
				return (
					'<div class="aoal-modal-title">' + (isEdit ? 'Edit Goal' : 'New Goal') + '</div>' +
					'<form data-role="goal-form" data-id="' + (payload.id || '') + '">' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Title</label>' +
					'<input type="text" name="title" value="' + aoal_escape(payload.title || '') + '" required />' +
					'</div>' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Description</label>' +
					'<textarea name="description" rows="2">' + aoal_escape(payload.description || '') + '</textarea>' +
					'</div>' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Progress (%)</label>' +
					'<input type="number" name="progress" min="0" max="100" value="' + aoal_escape(payload.progress != null ? payload.progress : 0) + '" />' +
					'</div>' +
					'<div class="aoal-modal-actions">' +
					'<button type="button" class="aoal-link-button" data-action="close-modal">Cancel</button>' +
					'<button type="submit" class="aoal-link-button">Save</button>' +
					'</div>' +
					'</form>'
				);
			},

			'collection-form': function () {
				return (
					'<div class="aoal-modal-title">New Collection</div>' +
					'<form data-role="collection-form">' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Name</label>' +
					'<input type="text" name="name" required />' +
					'</div>' +
					'<div class="aoal-modal-actions">' +
					'<button type="button" class="aoal-link-button" data-action="close-modal">Cancel</button>' +
					'<button type="submit" class="aoal-link-button">Save</button>' +
					'</div>' +
					'</form>'
				);
			},

			'collection-item-form': function (payload) {
				return (
					'<div class="aoal-modal-title">New Item</div>' +
					'<form data-role="collection-item-form" data-collection-id="' + (payload.collectionId || '') + '">' +
					'<div class="aoal-field">' +
					'<label class="aoal-field-label">Item</label>' +
					'<input type="text" name="item" required />' +
					'</div>' +
					'<div class="aoal-modal-actions">' +
					'<button type="button" class="aoal-link-button" data-action="close-modal">Cancel</button>' +
					'<button type="submit" class="aoal-link-button">Add</button>' +
					'</div>' +
					'</form>'
				);
			},

			'confirm': function (payload) {
				return (
					'<div class="aoal-modal-title">' + aoal_escape(payload.title || 'Are you sure?') + '</div>' +
					'<div class="aoal-settings-desc" style="margin-bottom: 30px;">' + aoal_escape(payload.message || '') + '</div>' +
					'<div class="aoal-modal-actions">' +
					'<button type="button" class="aoal-link-button" data-action="close-modal">Cancel</button>' +
					'<button type="button" class="aoal-link-button aoal-settings-danger" data-action="confirm-accept">Confirm</button>' +
					'</div>'
				);
			}
		};

		/* ============================================================
		 * Event handling (delegated — the DOM is rebuilt on every render)
		 * ============================================================ */

		function bindEvents() {
			var root = $(container);

			// Shared by both the home nav list and the content tabs.
			root.find('[data-page]').off('click').on('click', function () {
				selectPage($(this).data('page'));
			});

			root.find('[data-action="go-home"]').off('click').on('click', goHome);

			root.find('[data-action="close-modal"]').off('click').on('click', closeModal);

			root.find('[data-role="modal-layer"]').off('mousedown').on('mousedown', function (event) {
				if (event.target === this) {
					closeModal();
				}
			});

			root.find('[data-action="add-achievement"]').off('click').on('click', function () {
				openModal({ type: 'achievement-form', payload: {} });
			});

			root.find('[data-action="edit-achievement"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				var achievement = aoal_find(state.store.achievements, id);
				if (achievement) {
					openModal({ type: 'achievement-form', payload: achievement });
				}
			});

			root.find('[data-action="delete-achievement"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				openModal({
					type: 'confirm',
					payload: {
						title: 'Delete Achievement',
						message: 'This achievement will be removed permanently.',
						onConfirm: function () {
							mutateStore(function (store) {
								store.achievements = store.achievements.filter(function (item) { return item.id !== id; });
							});
						}
					}
				});
			});

			root.find('[data-action="add-goal"]').off('click').on('click', function () {
				openModal({ type: 'goal-form', payload: {} });
			});

			root.find('[data-action="edit-goal"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				var goal = aoal_find(state.store.goals, id);
				if (goal) {
					openModal({ type: 'goal-form', payload: goal });
				}
			});

			root.find('[data-action="delete-goal"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				openModal({
					type: 'confirm',
					payload: {
						title: 'Delete Goal',
						message: 'This goal will be removed permanently.',
						onConfirm: function () {
							mutateStore(function (store) {
								store.goals = store.goals.filter(function (item) { return item.id !== id; });
							});
						}
					}
				});
			});

			root.find('[data-action="add-collection"]').off('click').on('click', function () {
				openModal({ type: 'collection-form', payload: {} });
			});

			root.find('[data-action="add-collection-item"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				openModal({ type: 'collection-item-form', payload: { collectionId: id } });
			});

			root.find('[data-action="delete-collection"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				openModal({
					type: 'confirm',
					payload: {
						title: 'Delete Collection',
						message: 'This collection and all of its items will be removed.',
						onConfirm: function () {
							mutateStore(function (store) {
								store.collections = store.collections.filter(function (item) { return item.id !== id; });
							});
						}
					}
				});
			});

			root.find('[data-action="delete-collection-item"]').off('click').on('click', function (event) {
				event.stopPropagation();
				var id = $(this).data('id');
				var index = $(this).data('index');
				mutateStore(function (store) {
					var collection = aoal_find(store.collections, id);
					if (collection) {
						collection.items.splice(index, 1);
					}
				});
			});

			root.find('[data-action="toggle-setting"]').off('click').on('click', function () {
				var key = $(this).data('key');
				var patch = {};
				patch[key] = !state.settings[key];
				$.extend(state.settings, patch);
				persist();
				render();
			});

			root.find('[data-action="reset-data"]').off('click').on('click', function () {
				openModal({
					type: 'confirm',
					payload: {
						title: 'Reset All Data',
						message: 'Every achievement, goal and collection will be permanently erased.',
						onConfirm: function () {
							mutateStore(function () {
								state.store = aoal_default_store();
							});
						}
					}
				});
			});

			root.find('[data-action="confirm-accept"]').off('click').on('click', function () {
				var callback = state.modal && state.modal.payload && state.modal.payload.onConfirm;
				closeModal();
				if (callback) {
					callback();
				}
			});

			root.find('[data-role="achievement-form"]').off('submit').on('submit', function (event) {
				event.preventDefault();
				var form = $(this);
				var id = form.data('id');
				var values = aoal_form_values(form);
				mutateStore(function (store) {
					if (id) {
						var achievement = aoal_find(store.achievements, id);
						$.extend(achievement, values);
					} else {
						store.achievements.unshift($.extend({ id: aoal_uid(), done: true }, values));
					}
				});
				closeModal();
			});

			root.find('[data-role="goal-form"]').off('submit').on('submit', function (event) {
				event.preventDefault();
				var form = $(this);
				var id = form.data('id');
				var values = aoal_form_values(form);
				values.progress = aoal_clamp(parseInt(values.progress, 10) || 0, 0, 100);
				mutateStore(function (store) {
					if (id) {
						var goal = aoal_find(store.goals, id);
						$.extend(goal, values);
					} else {
						store.goals.push($.extend({ id: aoal_uid() }, values));
					}
				});
				closeModal();
			});

			root.find('[data-role="collection-form"]').off('submit').on('submit', function (event) {
				event.preventDefault();
				var values = aoal_form_values($(this));
				mutateStore(function (store) {
					store.collections.push({ id: aoal_uid(), name: values.name, items: [] });
				});
				closeModal();
			});

			root.find('[data-role="collection-item-form"]').off('submit').on('submit', function (event) {
				event.preventDefault();
				var form = $(this);
				var collectionId = form.data('collection-id');
				var values = aoal_form_values(form);
				mutateStore(function (store) {
					var collection = aoal_find(store.collections, collectionId);
					if (collection && values.item) {
						collection.items.push(values.item);
					}
				});
				closeModal();
			});
		}

		function aoal_find(list, id) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].id === id) {
					return list[i];
				}
			}
			return null;
		}

		function aoal_form_values(form) {
			var values = {};
			form.serializeArray().forEach(function (field) {
				values[field.name] = field.value;
			});
			return values;
		}

		/* ============================================================
		 * Keyboard shortcuts
		 *
		 *   At home:      Up/Down move the highlighted item, Enter
		 *                 slides the wall in to that page.
		 *   In content:   Left/Right cycle between pages in place
		 *                 (no slide — the tabs handle that), Escape
		 *                 slides the wall back out to the home view.
		 *   Modal open:   Escape closes it; all other shortcuts are
		 *                 suspended so typing in a field is never
		 *                 hijacked.
		 * ============================================================ */

		function getWindowFrame() {
			// .taida_window() returns the original content div (see
			// public/js/windows.js: `$.fn[plugin_name] = function () {
			// return this.each(...); }`), not the wrapping div.window
			// that actually receives the "focus" class. Look that up
			// by the id the plugin stored on the content div.
			return $('#windowframe' + view.data('windowframe_id'));
		}

		function cyclePage(delta) {
			var nextIndex = (state.menuIndex + delta + AOAL_PAGES.length) % AOAL_PAGES.length;
			setState({ menuIndex: nextIndex, page: AOAL_PAGES[nextIndex].id });
		}

		function onKeyDown(event) {
			if (!getWindowFrame().hasClass('focus')) {
				return;
			}

			if (state.modal) {
				if (event.which === 27) {
					closeModal();
				}
				return;
			}

			if (state.atHome) {
				if (event.which === 38 || event.which === 40) {
					event.preventDefault();
					cyclePage(event.which === 38 ? -1 : 1);
				} else if (event.which === 13) {
					setState({ atHome: false });
				}
				return;
			}

			if (event.which === 27) {
				event.preventDefault();
				goHome();
			} else if (event.which === 37 || event.which === 39) {
				event.preventDefault();
				cyclePage(event.which === 37 ? -1 : 1);
			}
		}

		/* ============================================================
		 * Boot
		 * ============================================================ */

		load(function () {
			render();

			view.taida_window({
				header: 'Achievements Of A Lifetime',
				icon: '/images/application.png',
				width: 960,
				height: 580,
				minWidth: 700,
				close: function () {
					$(document).off('keydown', onKeyDown);
					window.clearTimeout(saveHandle);
				}
			});

			$(document).on('keydown', onKeyDown);

			view.open();
		});
	}

	/* ============================================================
	 * Taida registration
	 * ============================================================ */

	$(document).ready(function () {
		taida_startmenu_add('Achievements', '/images/application.png', aoal_open);
	});
})();