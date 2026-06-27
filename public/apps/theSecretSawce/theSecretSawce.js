var theSecretSawce_sections = {
	calculator: {
		title: 'Calculator',
		body: [
			'README.md / tiny desk tool energy',
			'- Keep arithmetic close to the desktop.',
			'- Buttons first, decoration second.',
			'- Inspiration notes: classic pocket calculators, early web widgets, and utilitarian OS accessories.'
		]
	},
	explorer: {
		title: 'File Explorer',
		body: [
			'README.md / filesystem app',
			'- Show the virtual filesystem without exposing storage internals.',
			'- Double click directories to move deeper; double click files to open with their handler.',
			'- Inspiration notes: web desktop file managers, Windows Explorer basics, and Taida\'s own desktop icons.'
		]
	},
	notepad: {
		title: 'Notepad',
		body: [
			'README.md / plain text scratchpad',
			'- Open, edit, save, done.',
			'- Text files should feel like data, not a whole product suite.',
			'- Inspiration notes: Notepad, README editing, simple changelog drafting.'
		]
	},
	theSecretSawce: {
		title: 'theSecretSawce',
		body: [
			'README.md / 2000s blog / inspiration ledger',
			'- Every app gets a place where its influences can be named.',
			'- This is intentionally half blogroll, half dev notebook.',
			'- Inspiration notes: old personal sites, GitHub READMEs, changelogs, credits pages.'
		]
	}
};

function theSecretSawce_open(section) {
	section = section || 'theSecretSawce';
	var view = $('<div class="secret-sawce"></div>');

	view.append('<h1>theSecretSawce</h1>');
	view.append('<p class="secret-sawce-subtitle">inspiration log / README-ish blog / credits drawer</p>');

	Object.keys(theSecretSawce_sections).forEach(function(key) {
		var entry = theSecretSawce_sections[key];
		var article = $('<article id="sawce-' + key + '"></article>');
		article.append('<h2>' + entry.title + '</h2>');
		article.append('<pre>' + $('<div></div>').text(entry.body.join('\n')).html() + '</pre>');
		view.append(article);
	});

	view.taida_window({
		header: 'theSecretSawce',
		icon: '/images/application.png',
		width: 620,
		height: 480,
		minWidth: 360,
		help: 'theSecretSawce'
	});
	view.open();

	window.setTimeout(function() {
		var target = view.find('#sawce-' + section);
		if (target.length > 0) {
			view.scrollTop(target.position().top + view.scrollTop() - 10);
			target.addClass('selected');
		}
	}, 50);
}

$(document).ready(function() {
	taida_startmenu_add('theSecretSawce', '/images/application.png', function() {
		theSecretSawce_open('theSecretSawce');
	});
});
