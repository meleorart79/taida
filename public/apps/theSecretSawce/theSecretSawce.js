var theSecretSawce_sections = {
	aoal: {
		title: 'AOAL',
		body: [
			'personal trophy chamber / life archive',
			'- Inspired by the atmosphere of Final Fantasy XV menus and the feeling of opening a personal journey record.',
			'- The idea started when I reached 1000 Elo in chess. It was the first achievement that made me want a dedicated space to preserve my successes.',
			'- A digital chamber of trophies: a place to remember milestones, goals, and moments worth keeping.'
		]
	},
	calculator: {
		title: 'Calculator',
		body: [
			'toki pona calculator / experimental parser',
			'- Arithmetic is written entirely in toki pona rather than Arabic numerals.',
			'- The engine first translates toki pona words into an internal mathematical expression, then tokenizes, parses and evaluates the result through its own expression tree.',
			'- Numbers follow a seximal (base-6) adaptation of nasin nanpa suli. Operators and punctuation are represented by toki pona words before being converted into standard mathematical symbols.',
			'',
			'Glossary',
			'- ala   = 0',
			'- wan   = 1',
			'- tu    = 2',
			'- san   = 3',
			'- po    = 4',
			'- luka  = 5',
			'- kulu  = 6 (used as the next digit in base-6)',
			'- lili  = decimal point',
			'- en    = addition (+)',
			'- weka  = subtraction (-)',
			'- mute  = multiplication (*)',
			'- kipisi = division (/)',
			'- sewi  = exponentiation (^)',
			'- anpa  = logarithm',
			'- li    = equality (=)',
			'- te / to = parentheses',
			'',
			'Special thanks',
			'- This project exists because my dear friend jan Tokun introduced me to toki pona.',
			'- Without that introduction, this calculator—and probably the idea of expressing mathematics through toki pona—would never have existed.',
			'- Some adaptations were made to the chosen "dialect" nasin nanpa suli, tan jan Emalan found on https://sona.pona.la/wiki/Proposed_number_systems'
		]
	},
	explorer: {
		title: 'File Explorer',
		body: [
			'filesystem app',
			'- Show the virtual filesystem without exposing storage internals.',
			'- Double click directories to move deeper; double click files to open with their handler.',
			'- Inspiration notes: web desktop file managers, Windows Explorer basics, and Taida\'s own desktop icons.'
		]
	},
	notepad: {
		title: 'Notepad',
		body: [
			'plain text scratchpad',
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
