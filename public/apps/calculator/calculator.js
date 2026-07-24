// Requires calculator-engine.js (Tokenizer, TokenStream, Parser, Evaluator,
// TpToJs, CalculatorEngine). Loaded here via taida_load_javascript so this
// file is self-contained — adjust the path below if calculator-engine.js
// lives somewhere else in your project.
taida_load_javascript('calculator-engine.js');
//
// Public app = three windows: input bar, history, sitelen pona keyboard.
// Raw math mode (digit grid, bare `engine.calculate()`) is intentionally
// NOT exposed here — it was a dev-only harness. This app always runs
// input through `engine.processTpExpression()`.

// Under-ConScript Unicode Registry (UCSUR) codepoints for Sitelen Pona,
// Supplementary Private Use Area-A (Plane 15). Requires a Sitelen Pona
// webfont to actually render as glyphs — otherwise these show as tofu.
const SITELEN_CODEPOINTS = {
	ala: 0xF1902,
	wan: 0xF1973,
	tu: 0xF196E,
	luka: 0xF192D,
	lili: 0xF1928,
	en: 0xF190A,
	weka: 0xF1976,
	mute: 0xF193C,
	kipisi: 0xF197B,
	sewi: 0xF195A,
	poka: 0xF1952,
	anpa: 0xF1905,
	te: 0xF19B4,
	to: 0xF19B5,
	san: 0xF19B2,
	kulu: 0xF191F
};

// `po` has no UCSUR codepoint (deprecated/obscure per linku's word data —
// coined by jan Sonja in "ku lili", 2001), but it does have a canonical
// glyph. Inlined directly as SVG; fill="currentColor" makes it follow the
// same color/hover behavior as the codepoint-based glyphs.
const SITELEN_SVG_GLYPHS = {
	po: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="47 62 521 658"><path fill="currentColor" d="M340 541q0 -10 -1.5 -17t-3 -9.5t-3 -4t-1.5 -2.5q0 -2 5.5 -9t5.5 -12t-4 -9q-5 -6 -55.5 -8.5t-107.5 -3.5t-70 -4q-16 -4 -25 -16q-9 -11 -5 -25t12.5 -24.5t17.5 -21.5t9 -17q0 -10 4 -10t19 -20.5t15 -26.5q0 -8 20 -36.5t25 -28.5q4 0 7.5 -6.5t12 -19t21.5 -23.5 q18 -15 37 -40.5t33 -40t30 -14.5q14 0 20 4t6 9t4 11.5t13 10.5q19 8 19 25q0 3 -2.5 9.5t-4.5 25.5t-2 52t6.5 99.5t18.5 66.5q3 0 26 -3.5t36 -3.5q31 0 48.5 11.5t17.5 31.5q0 22 -13 27.5t-47 5.5l-38 -1q-37 0 -40 5q-3 4 -3 25q0 38 6.5 90t6.5 61q0 12 -1.5 18 t-9 12t-22.5 6q-32 0 -37.5 -22t-5.5 -127zM213 325q0 7 -7 12t-7 8t-15 22l-14 18l11 6q8 5 65 7t71 6q18 5 21 4q6 -4 6 -65q0 -11 -5.5 -42.5t-6.5 -56.5q-1 -21 -3 -31t-4 -12.5t-6 -2.5q-6 0 -23 18t-24 32q-5 9 -32 39.5t-27 37.5z"/></svg>'
};

// Order buttons appear in the keyboard window.
const KEYBOARD_WORDS = [
	'wan', 'tu', 'san', 'po', 'luka', 'kulu', 'ala',
	'en', 'weka', 'mute', 'kipisi', 'sewi', 'anpa',
	'te', 'to', 'lili', 'poka'
];

// Styling lives in calculator.css — include it the same way explorer.css
// is included for the explorer app (no dynamic loading needed; explorer.js
// doesn't call taida_load_stylesheet either, so this project clearly wires
// CSS up some other way, e.g. a shared template or manifest).

function calculator_open() {
	// calculator-engine.js loads asynchronously (see taida_load_javascript
	// call above). In practice it'll be long done by the time a person
	// actually clicks the calculator icon, but this guards against the
	// edge case where it isn't, instead of throwing "CalculatorEngine is
	// not defined".
	if (typeof CalculatorEngine === 'undefined') {
		setTimeout(calculator_open, 20);
		return;
	}

	var engine = new CalculatorEngine();
	var history = [];

	// ---- Window 1: input bar ----
	var inputView = $(
		'<div class="calculator-input-bar">' +
		'<input type="text" value="" placeholder="..." />' +
		'</div>'
	);
	var inputEl = inputView.find('input');

	// ---- Window 2: history ----
	var historyView = $('<div class="calculator-history"></div>');

	function renderHistory() {
		historyView.empty();
		history.forEach(function (entry) {
			var row = $('<div class="entry"></div>');
			if (entry.error) {
				row.addClass('error');
				row.append($('<div class="input"></div>').text(entry.input));
				row.append($('<div class="result"></div>').text(entry.error));
			} else {
				row.append($('<div class="input"></div>').text(entry.input));
				row.append($('<div class="result"></div>').text('= ' + entry.result));
			}
			historyView.append(row);
		});
		historyView.scrollTop(historyView[0].scrollHeight);
	}

	function evaluate() {
		var value = inputEl.val().trim();
		if (value === '') return;

		try {
			var result = engine.processTpExpression(value);
			history.push({ input: value, result: result });
		} catch (error) {
			history.push({ input: value, error: error.message || String(error) });
		}

		renderHistory();
		inputEl.val('');
	}

	inputEl.on('keydown', function (event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			evaluate();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			inputEl.val('');
		}
	});

	// ---- Window 3: sitelen pona keyboard ----
	var keyboardView = $(
		'<div class="calculator-keyboard-app">' +
		'<div class="calculator-keyboard"></div>' +
		'<div class="calculator-controls">' +
		'<button type="button" class="sitelen-key" data-action="left" title="leftwards ni (move cursor left)">' + String.fromCodePoint(0xF1989) + '</button>' +
		'<button type="button" class="sitelen-key" data-action="right" title="rightwards ni (move cursor right)">' + String.fromCodePoint(0xF198B) + '</button>' +
		'<button type="button" class="sitelen-key" data-action="backspace" title="pakala (delete)">' + String.fromCodePoint(0xF1948) + '</button>' +
		'<button type="button" class="sitelen-key" data-action="clear" title="pini (clear)">' + String.fromCodePoint(0xF1950) + '</button>' +
		'<button type="button" class="sitelen-key" data-action="enter" title="pana (confirm)">' + String.fromCodePoint(0xF194C) + '</button>' +
		'</div>' +
		'</div>'
	);
	var keyboardGrid = keyboardView.find('.calculator-keyboard');

	KEYBOARD_WORDS.forEach(function (word) {
		var button = $('<button type="button"></button>')
			.attr('data-word', word)
			.addClass('sitelen-key');

		if (SITELEN_CODEPOINTS.hasOwnProperty(word)) {
			button.attr('title', word);
			button.text(String.fromCodePoint(SITELEN_CODEPOINTS[word]));
		} else if (SITELEN_SVG_GLYPHS.hasOwnProperty(word)) {
			button.attr('title', word + ' (no UCSUR codepoint — inlined SVG)');
			button.html(SITELEN_SVG_GLYPHS[word]);
		} else {
			button.addClass('sitelen-key-fallback')
				.attr('title', word + ' (no glyph found)')
				.text(word);
		}

		keyboardGrid.append(button);
	});

	keyboardGrid.find('button').on('click', function () {
		var word = $(this).attr('data-word');
		var current = inputEl.val();
		inputEl.val(current === '' ? word : current + ' ' + word);
	});

	function moveCursor(delta) {
		var el = inputEl[0];
		var pos = el.selectionStart == null ? el.value.length : el.selectionStart;
		pos = Math.max(0, Math.min(el.value.length, pos + delta));
		el.setSelectionRange(pos, pos);
		el.focus();
	}

	keyboardView.find('.calculator-controls button').on('click', function () {
		var action = $(this).attr('data-action');
		var current = inputEl.val();

		if (action === 'clear') {
			inputEl.val('');
		} else if (action === 'backspace') {
			var words = current.trim().split(/\s+/).filter(Boolean);
			words.pop();
			inputEl.val(words.join(' '));
		} else if (action === 'enter') {
			evaluate();
		} else if (action === 'left') {
			moveCursor(-1);
		} else if (action === 'right') {
			moveCursor(1);
		}
	});

	// ---- Open all three as separate floating windows ----
	inputView.taida_window({
		header: 'Calculator',
		icon: '/images/application.png',
		width: 260,
		height: 60,
		minWidth: 200,
		help: 'calculator',
		resize: false,
		open: function () {
			inputEl.trigger('focus');
		}
	});
	inputView.open();

	historyView.taida_window({
		header: 'History',
		icon: '/images/application.png',
		width: 260,
		height: 200,
		minWidth: 200,
		help: 'calculator',
		resize: true
	});
	historyView.open();

	keyboardView.taida_window({
		header: 'nasin sitelen',
		icon: '/images/application.png',
		width: 300,
		height: 220,
		minWidth: 260,
		help: 'calculator',
		resize: false
	});
	keyboardView.open();
}

$(document).ready(function () {
	taida_startmenu_add('Calculator', '/images/application.png', calculator_open);
});