//calculator_engine.js
////////////////////////////////////////////////////////////////////////////
class Node {
    constructor(arity) {
        this.children = [];
        this.arity = arity;
        this.parent = null;
    }

    addChild(node) {
        if (!(node instanceof Node)) {
            throw new Error("Child must be a Node.");
        }

        if (this.children.length >= this.arity) {
            throw new Error("Maximum number of children reached.");
        }

        node.parent = this;
        this.children.push(node);
        return this;
    }
}

class OperatorNode extends Node {
    constructor(token, arity = 2) {
        super(arity);
        this.token = token;
    }

    get operation() {
        return this.token.value;
    }
    get type() {
        return this.token.type;
    }
}

class NumberNode extends Node {
    constructor(token) {
        super(0);
        this.token = token;
    }

    get value() {
        return this.token.value;
    }
    get type() {
        return this.token.type;
    }
}

class IdentifierNode extends Node {
    constructor(token) {
        super(0);
        this.token = token;
    }

    get name() {
        return this.token.value;
    }

    get type() {
        return this.token.type;
    }
}

class FunctionNode extends Node {
    constructor(token, arg) {
        super(1);
        this.token = token;
        this.addChild(arg);
    }
    get name() { return this.token.value; }
    get type() { return this.token.type; }
}

class Tp {
    // some adaptations were made to the chosen "dialect" is [seximal] nasin nanpa suli, tan jan Emalan found on https://sona.pona.la/wiki/Proposed_number_systems 
    constructor(tp, js, nature) {
        this.tp = tp;
        this.js = js;
        this.nature = nature;
    }
}

class TpToJs {

    phraseNns(input) {

        const tp_array = [];

        let i = 0;
        while (i < input.length) {
            if (/\s/.test(input[i])) {
                i++;
                continue;
            }

            let tpWordString = "";

            if (/[\p{L}]/u.test(input[i])) {
                let n = i
                for (n; n < input.length; n++) {
                    if (!/[\p{L}]/u.test(input[n])) {
                        break
                    }
                    tpWordString += input[n];
                }
                let concatenated_tpWord = tpWordString;

                tp_array.push(new Tp(concatenated_tpWord, null, null));
                i = n;
            }

            else {
                throw new Error("Unknown character in Toki Pona input: " + input[i]);
            }
        }
        return tp_array;
    }

    composeNns(tp_array) {
        const definitions = [
            { tp: "ala", js: 0, nature: "number" },
            { tp: "wan", js: 1, nature: "number" },
            { tp: "tu", js: 2, nature: "number" },
            { tp: "san", js: 3, nature: "number" },
            { tp: "po", js: 4, nature: "number" },
            { tp: "luka", js: 5, nature: "number" },
            { tp: "kulu", js: 6, nature: "number" },
            { tp: "lili", js: ".", nature: "number" },
            { tp: "li", js: "=", nature: "other" },
            { tp: "en", js: "+", nature: "other" },
            { tp: "weka", js: "-", nature: "other" },
            { tp: "mute", js: "*", nature: "other" },
            { tp: "kipisi", js: "/", nature: "other" },
            { tp: "sewi", js: "^", nature: "other" },
            { tp: "te", js: "(", nature: "other" },
            { tp: "to", js: ")", nature: "other" },
            { tp: "anpa", js: "§", nature: "other" }
        ];

        tp_array.forEach(object => {
            const match = definitions.find((def) => def.tp === object.tp);
            if (match) {
                object.js = match.js;
                object.nature = match.nature;
            }
            else {
                object.js = object.tp;
                object.nature = "other";
            }
        });

        let jsString = "";
        let i = 0;
        while (i < tp_array.length) {
            if (tp_array[i].nature === "other") {
                jsString += tp_array[i].js;
                i++;
                continue;
            }

            let composedNumber = "";
            let seenDecimal = false;
            const tpToken = String(tp_array[i].js);
            if (/[0-9.]/.test(tpToken)) {
                let n = i
                for (n; n < tp_array.length; n++) {
                    const currentTp = String(tp_array[n].js);
                    if (!/[0-9.]/.test(currentTp)) {
                        break
                    }
                    if (tp_array[n].js === '.' && seenDecimal) {
                        n++;
                        throw new Error(`Invalid number format: multiple decimal points in number at position ${n}`);
                    }
                    if (tp_array[n].js === '.') {
                        seenDecimal = true
                    }
                    composedNumber += tp_array[n].js;
                }
                if (composedNumber[0] === '6') {
                    composedNumber = '1' + composedNumber;
                }
                if (composedNumber.includes('6') && composedNumber.length > 1) {
                    composedNumber = composedNumber.replaceAll('6', '0')
                }
                let sexToDecimal = String(composedNumber);

                const [integer, fraction = ""] = sexToDecimal.split(".");
                let integerPart = integer === "" ? 0 : parseInt(integer, 6);
                let floatingPart = 0
                if (fraction.length > 0) {
                    floatingPart = parseInt(fraction, 6) / Math.pow(6, fraction.length);

                }
                let decimalNumber = integerPart + floatingPart;
                jsString += decimalNumber;
                i = n;
            }
        }
        return jsString;
    }
}

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Tokenizer {

    tokenize(input) {
        const token_array = [];

        let i = 0;
        while (i < input.length) {
            if (/\s/.test(input[i])) {
                i++;
                continue;
            }

            let numberString = "";
            let identifierString = "";

            if (/[0-9.]/.test(input[i])) {
                let n = i
                let seenDecimal = false;
                for (n; n < input.length; n++) {
                    if (!/[0-9.]/.test(input[n])) {
                        break
                    }
                    if (input[n] === '.' && seenDecimal) {
                        n++;
                        throw new Error(`Invalid number format: multiple decimal points in number at position ${n}`);
                    }
                    if (input[n] === '.') {
                        seenDecimal = true

                    }
                    numberString += input[n];
                }
                if (numberString[0] === '.' && numberString.length > 1) {
                    numberString = '0' + numberString;
                }
                if (numberString === '.') {
                    numberString = '0';
                }
                let concatenated_number = parseFloat(numberString)
                token_array.push(new Token("NUMBER", concatenated_number))
                i = n;
            }

            else if (/[\p{L}]/u.test(input[i])) {
                let n = i
                for (n; n < input.length; n++) {
                    if (!/[\p{L}]/u.test(input[n])) {
                        break
                    }
                    identifierString += input[n];
                }
                let concatenated_identifier = identifierString;
                token_array.push(new Token("IDENTIFIER", concatenated_identifier))
                i = n;
            }

            else {
                switch (input[i]) {
                    case "+":
                        token_array.push(new Token("PLUS", input[i]))
                        break;
                    case "-":
                        token_array.push(new Token("MINUS", input[i]))
                        break;
                    case "*":
                        token_array.push(new Token("MULTIPLY", input[i]))
                        break;
                    case "/":
                        token_array.push(new Token("DIVIDE", input[i]))
                        break;
                    case "^":
                        token_array.push(new Token("EXP", input[i]))
                        break;
                    case "(":
                        token_array.push(new Token("LPAREN", input[i]))
                        break;
                    case ")":
                        token_array.push(new Token("RPAREN", input[i]))
                        break;
                    case ",":
                        token_array.push(new Token("COMMA", input[i]))
                        break;
                    case "§":
                        token_array.push(new Token("LOG", input[i]))
                        break;
                    case "=":
                        token_array.push(new Token("EQUALS", input[i]))
                        break;
                    default:
                        throw new Error(
                            `Unknown character '${input[i]}' (code ${input.charCodeAt(i)}) at position ${i}`
                        );
                }
                i++;
            }
        }
        return token_array;
    }
}

class TokenStream {

    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }

    peek() {
        return this.tokens[this.index];
    }

    lookAhead(n = 1) {
        const target = this.index + n;
        if (target >= this.tokens.length) {
            throw new Error("Looking too far.");
        }
        else {
            return this.tokens[target];
        }
    }

    consume() {
        if (!this.isAtEnd()) {
            let currentToken = this.tokens[this.index];
            this.index++;
            return currentToken;
        }
        else {
            throw new Error("No more tokens to consume.");
        }
    }

    isAtEnd() {
        return this.index >= this.tokens.length;
    }

    match(type) {
        if (this.isAtEnd()) return false;
        return this.tokens[this.index].type === type;
    }
}

class Parser {
    constructor(tokenStream) {
        this.tokenStream = tokenStream;
    }

    // 0. Equality (Lowest precedence — binds loosest)
    parseEquals() {
        let leftNode = this.parseAdd();

        while (this.tokenStream.match("EQUALS")) {
            let operator = this.tokenStream.consume();
            let rightNode = this.parseAdd();
            let operationNode = new OperatorNode(operator);
            operationNode.addChild(leftNode).addChild(rightNode);
            leftNode = operationNode;
        }
        return leftNode;
    }

    // 1. Addition / Subtraction
    parseAdd() {
        let leftNode = this.parseMultiply();

        while (this.tokenStream.match("PLUS") || this.tokenStream.match("MINUS")) {
            let operator = this.tokenStream.consume();
            let rightNode = this.parseMultiply();
            let operationNode = new OperatorNode(operator);
            operationNode.addChild(leftNode).addChild(rightNode);
            leftNode = operationNode;
        }
        return leftNode;
    }

    // 2. Multiplication / Division
    parseMultiply() {
        let leftNode = this.parsePower();

        while (this.tokenStream.match("MULTIPLY") || this.tokenStream.match("DIVIDE")) {
            let operator = this.tokenStream.consume();
            let rightNode = this.parsePower();
            let operationNode = new OperatorNode(operator);
            operationNode.addChild(leftNode).addChild(rightNode);
            leftNode = operationNode;
        }
        return leftNode;
    }

    // 3. Exponentiation (Right-Associative)
    parsePower() {
        let leftNode = this.parseLog();

        if (this.tokenStream.match("EXP")) {
            let operator = this.tokenStream.consume();
            let rightNode = this.parsePower();
            let operationNode = new OperatorNode(operator);
            operationNode.addChild(leftNode).addChild(rightNode);
            leftNode = operationNode;
        }
        return leftNode;
    }

    // 4. LOG Operator (High Precedence)
    parseLog() {
        let leftNode = this.parseUnary();

        if (this.tokenStream.match("LOG")) {
            let operator = this.tokenStream.consume();
            let rightNode = this.parseUnary();
            let operationNode = new OperatorNode(operator);
            operationNode.addChild(leftNode).addChild(rightNode);
            leftNode = operationNode;
        }
        return leftNode;
    }

    // 5. Unary Operators
    parseUnary() {
        if (this.tokenStream.match("MINUS")) {
            const operatorToken = this.tokenStream.consume();
            let operand = this.parseUnary();
            return new OperatorNode(operatorToken, 1).addChild(operand);
        }
        if (this.tokenStream.match("PLUS")) {
            const operatorToken = this.tokenStream.consume();
            let operand = this.parseUnary();
            return new OperatorNode(operatorToken, 1).addChild(operand);
        }
        return this.parseBase();
    }

    // 6. Base (Numbers, Identifiers, Parentheses)
    parseBase() {
        if (this.tokenStream.isAtEnd()) {
            throw new Error("End of input.");
        }

        if (this.tokenStream.match("NUMBER")) {
            return new NumberNode(this.tokenStream.consume());
        }

        if (this.tokenStream.match("IDENTIFIER")) {
            let identifierToken = this.tokenStream.consume();
            if (this.tokenStream.match("LPAREN")) {
                this.tokenStream.consume();
                let arg = this.parseAdd();
                if (!this.tokenStream.match("RPAREN")) {
                    throw new Error("Expected closing parenthesis.");
                }
                this.tokenStream.consume();
                return new FunctionNode(identifierToken, arg);
            }
            return new IdentifierNode(identifierToken);
        }

        if (this.tokenStream.match("LPAREN")) {
            this.tokenStream.consume();
            let expr = this.parseEquals();
            if (!this.tokenStream.match("RPAREN")) {
                throw new Error("Expected closing parenthesis.");
            }
            this.tokenStream.consume();
            return expr;
        }

        throw new Error(`Unexpected token: ${this.tokenStream.peek().type}`);
    }

    parse() {
        const tree = this.parseEquals();
        if (!this.tokenStream.isAtEnd()) {
            throw new Error("Unexpected tokens remaining after parsing.");
        }
        return tree;
    }

    printTree(node, indent = "") {
        if (node instanceof NumberNode) {
            console.log(indent + node.type + ": " + node.value);
        } else if (node instanceof OperatorNode) {
            console.log(indent + node.type + ": " + node.operation);
        } else if (node instanceof FunctionNode) {
            console.log(indent + node.type + ": " + node.name);
        }

        if (node.children) {
            for (const child of node.children) {
                this.printTree(child, indent + "  ");
            }
        }
    }
}

class Evaluator {
    constructor(variables = {}) {
        this.variables = variables;
    }

    setVariable(name, value) {
        this.variables[name] = value;
    }

    evaluate(node) {

        if (node instanceof NumberNode) {
            return node.value;
        }

        if (node instanceof IdentifierNode) {
            if (!(node.name in this.variables)) {
                throw new Error(`Unknown variable: ${node.name}`);
            }
            return this.variables[node.name];
        }

        //if (node instanceof FunctionNode) {
            //...
        //}

        if (node instanceof OperatorNode) {
            const left = this.evaluate(node.children[0]);

            if (node.arity === 1) {
                switch (node.operation) {
                    case "+":
                        return +left;
                    case "-":
                        return -left;
                }
            }

            const right = this.evaluate(node.children[1]);

            switch (node.operation) {
                case "+":
                    return left + right;
                case "-":
                    return left - right;
                case "*":
                    return left * right;
                case "/":
                    return left / right;
                case "^":
                    return Math.pow(left, right);
                case "§":
                    return Math.log(left) / Math.log(right);
                case "=":
                    return left === right ? 1 : 0;
                default:
                    throw new Error(`Unknown operator: ${node.operation}`);

            }
        }
        else {
            throw new Error(`Unknown node type: ${node.constructor.name}`);
        }
    }
}

class CalculatorEngine {

    constructor(variables = {}) {
        this.tokenizer = new Tokenizer();
        this.evaluator = new Evaluator(variables);
    }

    calculate(expression) {
        const tokens = this.tokenizer.tokenize(expression);
        const stream = new TokenStream(tokens);
        const parser = new Parser(stream);

        const tree = parser.parse();
        return this.evaluator.evaluate(tree);
    }

    processTpExpression(tpExpression) {
        const tpToJs = new TpToJs();
        const jsExpression = tpToJs.composeNns(tpToJs.phraseNns(tpExpression));
        return this.calculate(jsExpression);
    }

    regressionTestExpr(cases) {
        cases.forEach(({ input, expect, throws, vars }) => {
            try {
                if (vars) {
                    for (const [name, value] of Object.entries(vars)) {
                        this.evaluator.setVariable(name, value);
                    }
                }
                const result = this.calculate(input);
                if (throws) {
                    console.error(`Expected error for input: ${input}`);
                } else if (result !== expect) {
                    console.error(`Expected ${expect}, got ${result} for input: ${input}`);
                } else {
                    console.log(`Test passed for input: ${input}, expected: ${expect}, got: ${result}`);
                }
            } catch (error) {
                if (throws) {
                    console.log(`Test passed for input: ${input} (expected error)`);
                } else {
                    console.error(`Unexpected error for input: ${input}`, error);
                }
            }
        });
    }

    regressionTestTpExpr(tpCases) {
        tpCases.forEach(({ input, expect, throws, vars }) => {
            try {
                if (vars) {
                    for (const [name, value] of Object.entries(vars)) {
                        this.evaluator.setVariable(name, value);
                    }
                }
                const result = this.processTpExpression(input);
                if (throws) {
                    console.error(`Expected error for input: ${input}`);
                } else if (result !== expect) {
                    console.error(`Expected ${expect}, got ${result} for input: ${input}`);
                } else {
                    console.log(`Test passed for input: ${input}, expected: ${expect}, got: ${result}`);
                }
            } catch (error) {
                if (throws) {
                    console.log(`Test passed for input: ${input} (expected error)`);
                } else {
                    console.error(`Unexpected error for input: ${input}`, error);
                }
            }
        });
    }
}

////////////////////////////////////////////////////////////////////////////
// calculator.js

const SITELEN_GLYPHS = {
    ala: '../../images/calc_svg/ala.svg',
    wan: '../../images/calc_svg/wan.svg',
    tu: '../../images/calc_svg/tu.svg',
    san: '../../images/calc_svg/san.svg',
    po: '../../images/calc_svg/po.svg',
    luka: '../../images/calc_svg/luka.svg',
    en: '../../images/calc_svg/en.svg',
    weka: '../../images/calc_svg/weka.svg',
    mute: '../../images/calc_svg/mute.svg',
    kipisi: '../../images/calc_svg/kipisi.svg',
    sewi: '../../images/calc_svg/sewi.svg',
    anpa: '../../images/calc_svg/anpa.svg',
    te: '../../images/calc_svg/te.svg',
    to: '../../images/calc_svg/to.svg',
    lili: '../../images/calc_svg/lili.svg',
    li: '../../images/calc_svg/li.svg',
    kulu: '../../images/calc_svg/kulupu.svg',
};

var calculator_engine = new CalculatorEngine();
var calculator_history = [];
function calculator_open() {

    var engine = calculator_engine;
    var history = calculator_history;

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

            row.on('click', function () {
                inputEl.val(entry.input);
                inputEl.trigger('focus');
            });

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
    // Single combined grid — word buttons and action buttons (pakala,
    // pini, pana, lni, rni) share one coordinate space now, per the
    // requested layout, instead of two separate grids/rows.
    var keyboardView = $(
        '<div class="calculator-keyboard-app">' +
        '<div class="calculator-keyboard"></div>' +
        '</div>'
    );
    var keyboardGrid = keyboardView.find('.calculator-keyboard');

    // (col, row) are 0-indexed; converted to 1-indexed CSS grid lines below.
    const KEYBOARD_LAYOUT = [
        // row 0 — delete / clear / confirm / "and" operator
        { type: 'action', action: 'backspace', icon: '../../images/calc_svg/pakala.svg', title: 'pakala (delete)', col: 0, row: 0 },
        { type: 'action', action: 'clear', icon: '../../images/calc_svg/pini.svg', title: 'pini (clear)', col: 1, row: 0 },
        { type: 'action', action: 'enter', icon: '../../images/calc_svg/pana.svg', title: 'pana (confirm)', col: 2, row: 0 },
        { type: 'word', word: 'en', col: 3, row: 0 },

        // row 1
        { type: 'word', word: 'wan', col: 0, row: 1 },
        { type: 'word', word: 'tu', col: 1, row: 1 },
        { type: 'word', word: 'san', col: 2, row: 1 },
        { type: 'word', word: 'weka', col: 3, row: 1 },

        // row 2
        { type: 'word', word: 'po', col: 0, row: 2 },
        { type: 'word', word: 'luka', col: 1, row: 2 },
        { type: 'word', word: 'kulu', col: 2, row: 2 },
        { type: 'word', word: 'mute', col: 3, row: 2 },

        // row 3
        { type: 'word', word: 'ala', col: 1, row: 3 },
        { type: 'word', word: 'kipisi', col: 3, row: 3 },

        // row 4
        { type: 'word', word: 'te', col: 0, row: 4 },
        { type: 'word', word: 'to', col: 1, row: 4 },
        { type: 'word', word: 'lili', col: 2, row: 4 },
        { type: 'dual', words: ['sewi', 'anpa'], col: 3, row: 4 },

        // row 5 — cursor movement, equality
        { type: 'action', action: 'left', icon: '../../images/calc_svg/ni.svg', title: 'leftwards ni (move cursor left)', cssClass: 'ni-left', col: 0, row: 5 },
        { type: 'action', action: 'right', icon: '../../images/calc_svg/ni.svg', title: 'rightwards ni (move cursor right)', cssClass: 'ni-right', col: 1, row: 5 },
        { type: 'word', word: 'li', col: 3, row: 5 }
    ];

    KEYBOARD_LAYOUT.forEach(function (item) {
        var button = $('<button type="button"></button>')
            .addClass('sitelen-key')
            .css({
                gridColumn: item.col + 1,
                gridRow: item.row + 1
            });

        if (item.type === "dual") {
            if (!Array.isArray(item.words)) {
                throw new Error("Dual key requires a 'words' array.");
            }
            button = $('<div class="dual-key"></div>')
                .css({
                    gridColumn: item.col + 1,
                    gridRow: item.row + 1
                });

            item.words.forEach(function (word) {

                var half = $('<button type="button"></button>')
                    .addClass('sitelen-key-half')
                    .attr('data-word', word)
                    .attr('title', word);

                half.append(
                    $('<img>')
                        .attr('src', SITELEN_GLYPHS[word])
                        .attr('alt', word)
                );

                button.append(half);
            });

            keyboardGrid.append(button);
            return;
        }

        if (item.type === 'word') {
            button.attr('data-word', item.word);

            if (SITELEN_GLYPHS.hasOwnProperty(item.word)) {
                button.attr('title', item.word);
                button.append($('<img>').attr('src', SITELEN_GLYPHS[item.word]).attr('alt', item.word));
            } else {
                button.addClass('sitelen-key-fallback')
                    .attr('title', item.word + ' (no glyph found)')
                    .text(item.word);
            }
        } else {
            button.attr('data-action', item.action).attr('title', item.title);

            var img = $('<img>').attr('src', item.icon).attr('alt', item.action);
            if (item.cssClass) {
                img.addClass(item.cssClass);
            }
            button.append(img);
        }

        keyboardGrid.append(button);
    });

    keyboardGrid.on('click', 'button[data-word]', function () {
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

    keyboardGrid.on('click', 'button[data-action]', function () {
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
    const CALC_WINDOW_LAYOUT = {
        input: { left: 40, top: 40 },
        history: { left: 40, top: 200 },
        keyboard: { left: 310, top: 40 }
    };

    function positionCalculatorWindow(view, pos) {
        var id = view.data('windowframe_id');
        $('div.windows div#windowframe' + id).css({
            left: pos.left + 'px',
            top: pos.top + 'px'
        });
    }

    inputView.taida_window({
        header: 'Calculator',
        icon: '/images/application.png',
        width: 260,
        height: 80,
        minWidth: 200,
        help: 'calculator',
        resize: false,
        open: function () {
            inputEl.trigger('focus');
        }
    });
    inputView.open();
    positionCalculatorWindow(inputView, CALC_WINDOW_LAYOUT.input);

    historyView.taida_window({
        header: 'History',
        icon: '/images/application.png',
        width: 260,
        height: 80,
        minWidth: 200,
        help: 'calculator',
        resize: true
    });
    historyView.open();
    positionCalculatorWindow(historyView, CALC_WINDOW_LAYOUT.history);
    renderHistory();

    keyboardView.taida_window({
        header: 'nasin sitelen',
        icon: '/images/application.png',
        width: 340,
        height: 260,
        minWidth: 260,
        help: 'calculator',
        resize: true
    });
    keyboardView.open();

}

$(document).ready(function () {
    taida_startmenu_add('Calculator', '/images/application.png', calculator_open);
});