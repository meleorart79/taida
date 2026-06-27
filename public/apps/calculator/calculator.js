function calculator_open() {
	var view = $(
		'<div class="calculator-app">' +
			'<input class="calculator-display" value="0" readonly />' +
			'<div class="calculator-grid"></div>' +
		'</div>'
	);
	var display = view.find('.calculator-display');
	var buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', 'C', '+', '(', ')', 'Back', '='];

	buttons.forEach(function(label) {
		view.find('.calculator-grid').append('<button type="button">' + label + '</button>');
	});

	view.find('button').on('click', function() {
		var label = $(this).text();
		var value = display.val();

		if (label == 'C') {
			display.val('0');
			return;
		}

		if (label == 'Back') {
			display.val(value.length > 1 ? value.slice(0, -1) : '0');
			return;
		}

		if (label == '=') {
			if (/^[0-9+\-*/().\s]+$/.test(value) == false) {
				display.val('Error');
				return;
			}

			try {
				display.val(String(Function('"use strict"; return (' + value + ')')()));
			} catch (error) {
				display.val('Error');
			}
			return;
		}

		display.val(value == '0' || value == 'Error' ? label : value + label);
	});

	view.taida_window({
		header: 'Calculator',
		icon: '/images/application.png',
		width: 260,
		height: 330,
		minWidth: 240,
		help: 'calculator',
		resize: false
	});
	view.open();
}

$(document).ready(function() {
	taida_startmenu_add('Calculator', '/images/application.png', calculator_open);
});
