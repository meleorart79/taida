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
           // { tp: "li", js: "=", nature: "other" },
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
            if (tp_array[i].nature === "other" ) {
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

    // 1. Addition / Subtraction (Lowest)
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
            let expr = this.parseAdd();
            if (!this.tokenStream.match("RPAREN")) {
                throw new Error("Expected closing parenthesis.");
            }
            this.tokenStream.consume();
            return expr;
        }

        throw new Error(`Unexpected token: ${this.tokenStream.peek().type}`);
    }

    parse() {
        const tree = this.parseAdd();
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

        class FunctionNode extends Node {
            constructor(token, arg) {
                super(1);
                this.token = token;
                this.addChild(arg);
            }
            get name() { return this.token.value; }
            get type() { return this.token.type; }
        }

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
                default:
                    throw new Error(`Unknown operator: ${node.operation}`);

            }
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

//Example usage (supposed to represent the expression 3 + (4 * 5)):

//const three = new NumberNode(3);
//const four = new NumberNode(4);
//const five = new NumberNode(5);

//const plus = new OperatorNode('+');
//const times = new OperatorNode('*');

//times
//    .addChild(four)
//    .addChild(five);
//plus
//    .addChild(three)
//    .addChild(times);

//const tokenizer = new Tokenizer();          // create an instance
//console.log("Tokens for \"3 * (4 + 5)\":", tokenizer.tokenize("3 + (4 * 5)"));  // call the method on it
//console.log("Tokens for \"(12 + 8) / 5\":", tokenizer.tokenize("(12 + 8) / 5"));
//console.log("Tokens for \"((2))\":", tokenizer.tokenize("((2))"));

//const tokenizer = new Tokenizer();
//const tokens = tokenizer.tokenize("42");
//const stream = new TokenStream(tokens);
//const parser = new Parser(stream);

//console.log(parser.parseBase());

//const parser = new Parser();
//parser.test("--5");
//parser.test("3^4+-6*2^-3");

//const engine = new CalculatorEngine({
//    x: 4,
//    pi: Math.PI,
//    e: Math.E
//});

//console.log(engine.calculate("2*x"));
//console.log(engine.calculate("pi^2"));
//console.log(engine.calculate("3 + (4 * 5)"));      // 23
//console.log(engine.calculate("2^-3"));               // 0.125
//console.log(engine.calculate(".")); #                // 0

const cases = [
    // Long mixed arithmetic (precedence, unary, exponentiation, decimals, parentheses)
    { input: "3+(4-1)*2^3/4+(-2)^2", expect: 13 },
    { input: "-2^2+(-2)^2+5*(3-1)", expect: 10 },
    { input: "2^-3+(6-2)*5-3^2", expect: 11.125 },
    { input: "(3.5+2.5)*2-(1.5/.5)", expect: 9 },
    { input: "--(2+3)^2-4/(1+1)", expect: 23 },

    // Variables mixed with everything
    { input: "(x+y)^2-z*2+4/2", expect: 23, vars: { x: 2, y: 3, z: 2 } },
    { input: "-x^2+(-x)^2+y*(3+1)", expect: 12, vars: { x: 3, y: 3 } },
    { input: "((a+b)/c)^2", expect: 9, vars: { a: 8, b: 1, c: 3 } },

    // Nested exponentiation
    { input: "2^(1+2)^2", expect: 512 },
    { input: "2^3^2-2^4", expect: 496 },

    // Decimals
    { input: ".5*8+4./2-1.25", expect: 4.75 },
    { input: "((.25+1.75)*3)-4.", expect: 2 },

    // Error handling
    { input: "3.4.5", throws: true },
    { input: "2++*", throws: true },
    { input: "((2)", throws: true },
    { input: ")", throws: true },
    { input: "unknown", throws: true },
    { input: "2^^3", throws: true },
    { input: "3+()", throws: true },
];

const tpCases = [
    // Long arithmetic
    { input: "san en po mute tu", expect: 11 },
    { input: "te san en po to mute tu", expect: 14 },
    { input: "luka weka wan en tu mute san", expect: 10 },
    { input: "te wan en tu to sewi san", expect: 27 },

    // Base-6 fractions
    { input: "wan lili san en lili tu", expect: 1.5 + (2 / 6) },
    { input: "tu lili luka mute san", expect: (2 + 5 / 6) * 3 },

    // kulu
    { input: "kulu", expect: 6 },
    { input: "kulu wan", expect: 37 },
    { input: "kulu kulu", expect: 36 },
    { input: "tu kulu", expect: 12 },
    { input: "wan tu kulu", expect: 48 },

    // Mixed precedence
    { input: "wan en tu mute san sewi tu", expect: 19 },
    { input: "te wan en tu to mute san sewi tu", expect: 27 },

    // anpa (when implemented)
    { input: "tu anpa tu", expect: 1 },
    { input: "te wan en wan to anpa tu", expect: 1 },
    { input: "tu anpa tu sewi luka", expect: 1 },
];

//const engine = new CalculatorEngine();
//engine.regressionTestExpr(cases);
//engine.regressionTestTpExpr(tpCases);