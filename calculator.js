CALC = {};
CALC.GRAMMAR = {};


function Symbol(type, value) {
	this.type = type;
	this.value = value;
	
	this.toString = function() {
		return this.type + ", " + this.value;
	}
}

function InsertionIndex(index) {
	this.index = index;
	this.func = null;
	this.params = [];
	
	if (arguments.length > 1)
		this.func = arguments[1];
	
	this.params = Array.prototype.slice.call(arguments);
	this.params.splice(0, 2);
}

function Operator(unary, value) {
	this.type = "operator";
	this.unary = unary;
	this.value = value;
	
	this.toString = function() {
		return this.type + ", " + this.value + ", " + this.unary;
	}
}

CALC.GRAMMAR.ToSymbolArray = function(str, symbols) {
	arr = [new Symbol("start", null)];
	
	for (let i = 0; i < str.length; i++) {
		for (let [key, values] of Object.entries(symbols)) {
			if (values.includes(str[i]))
				if (arr.length != i + 1)
					throw "Found a character with multiple or no symbols";
				else
					arr.push(new Symbol(key, str[i]));
		}
	}
	
	return arr;
}

CALC.GRAMMAR.Options = function(partialArray) {
	let options = [];
	
	let n = partialArray.length;
	
	for (let i = 0; i < Math.pow(2, n); i++) {
		let value = i;
		let arr = [];
		
		for (let j = n - 1; j >= 0; j--) {
			if (value >= Math.pow(2, j)) {
				value -= Math.pow(2, j);
				arr.unshift(partialArray[j].type);
			} else {
				arr.unshift(partialArray[j].value);
			}
		}
		
		options.push(arr);
	}
	
	return options;
}

CALC.GRAMMAR.IsInOptions = function(options, array) {
	for (let i = 0; i < options.length; i++) {
		if (COMPARE.Equals(options[i], array))
			return true;
	}
	
	return false;
}

CALC.GRAMMAR.CombineSymbols = function(symbols, newType) {
	let value = "";
	
	for (let i = 0; i < symbols.length; i++)
		value += symbols[i].value;
	
	return new Symbol(newType, value);
}


CALC.GRAMMAR.GetMaxSearchLength = function(grammar) {
	let maxLength = 0;
	
	for (let [key, arrayOfArrays] of Object.entries(grammar)) {
		for (let k = 0; k < arrayOfArrays.length; k++) {
			if (arrayOfArrays[k].length > maxLength)
				maxLength = arrayOfArrays[k].length;
		}
	}
	
	return maxLength;
}

CALC.GRAMMAR.CombinePass = function(array, combineGrammar) {
	let maxLength = CALC.GRAMMAR.GetMaxSearchLength(combineGrammar);
	
	let flag;
	
	for (let i = 0; i < array.length; i++) {
		flag = false;
		
		for (let j = i; j < array.length; j++) {
			if (flag)
				break;
			
			if (j - i > maxLength)
				break;
			
			let options = CALC.GRAMMAR.Options(array.slice(i,j));
			
			for (let [key, arrayOfArrays] of Object.entries(combineGrammar)) {
				if (flag)
						break;
					
				for (let k = 0; k < arrayOfArrays.length; k++) {
					if (flag)
						break;
					
					if (CALC.GRAMMAR.IsInOptions(options, arrayOfArrays[k])) {
						array.splice(i, 0, (CALC.GRAMMAR.CombineSymbols(array.splice(i, j - i), key)));
						i += i - j;
						flag = true;
					}
				}
			}
		}
	}
	
	return array;
}

CALC.GRAMMAR.Insert = function(partialArray, command) {
	let array = []
	
	for (let i = 0; i < command.length; i++) {
		if (command[i].constructor == InsertionIndex && command[i].func == null)
			array.push(partialArray[command[i].index]);
		else if (command[i].constructor == InsertionIndex) {
			if (command[i].func == Operator && command[i].index != -1)
				array.push(new Operator(command[i].params[0], partialArray[command[i].index].value));
			else
				array.push(new Operator(command[i].params[0], command[i].params[1]));
		}
		else {
			array.push(command[i])
		}
	}
	
	return array;
}

CALC.GRAMMAR.InsertionPass = function(array, insertionGrammar, insertionCommands) {
	let maxLength = CALC.GRAMMAR.GetMaxSearchLength(insertionGrammar);
	
	let flag;
	
	for (let i = 0; i < array.length; i++) {
		flag = false;
		
		for (let j = i; j < array.length; j++) {
			if (flag)
				break;
			
			if (j - i > maxLength)
				break;
			
			let options = CALC.GRAMMAR.Options(array.slice(i,j));
			
			for (let [key, arrayOfArrays] of Object.entries(insertionGrammar)) {
				if (flag)
						break;
					
				for (let k = 0; k < arrayOfArrays.length; k++) {
					if (flag)
						break;
					
					if (CALC.GRAMMAR.IsInOptions(options, arrayOfArrays[k])) {
						let x = CALC.GRAMMAR.Insert(array.splice(i, j - i), insertionCommands[key]);
						for (let l = 0; l < x.length; l++)
							array.splice(i + l, 0, x[l]);
						flag = true;
					}
				}
			}
		}
	}
	
	return array;
}

CALC.ShuntingYard = function(array, operChars) {
	let opStack = [];
	let postfix = [];
	
	for (let i = 0; i < array.length; i++) {
		if (array[i].type == "operand") {
			postfix.push(array[i]);
		}
		
		else if (array[i].type == "open_parenthesis") {
			opStack.push(array[i]);
		}
		
		else if (array[i].type == "close_parenthesis") {
			let symbol = opStack.pop();
			
			while (symbol.type != "open_parenthesis") {
				postfix.push(symbol);
				symbol = opStack.pop();
			}
		}
		
		else if (array[i].type == "operator" && (opStack.length == 0 || opStack[opStack.length - 1].type == "open_parenthesis")) {
			opStack.push(array[i]);
		}
		
		// IF operator AND EITHER(higher (smaller) precedence OR BOTH(same precedence AND right associativity))
		else if (array[i].type == "operator" &&
				(CALC.GetPrecedence(array[i], operChars) < CALC.GetPrecedence(opStack[opStack.length - 1], operChars) ||
				(CALC.GetPrecedence(array[i], operChars) == CALC.GetPrecedence(opStack[opStack.length - 1], operChars) &&
				CALC.GetAssociativity(array[i], operChars) == -1))) {
			opStack.push(array[i]);
		}
		
		else {
			let symbol = opStack.pop();
			
			// WHILE EITHER(lower (larger) precedence OR BOTH(same precedence AND left associativity))
			while (opStack.length > 0 &&
					((CALC.GetPrecedence(array[i], operChars) > CALC.GetPrecedence(opStack[opStack.length - 1], operChars) ||
					(CALC.GetPrecedence(array[i], operChars) == CALC.GetPrecedence(opStack[opStack.length - 1], operChars) &&
					CALC.GetAssociativity(array[i], operChars) == 1)))) {
				postfix.push(symbol);
				symbol = opStack.pop();
			}
			
			postfix.push(symbol);
			opStack.push(array[i]);
		}
	}
	
	while (opStack.length > 0)
		postfix.push(opStack.pop());
	
	return postfix;
}

CALC.Parse = function(str) {
	let baseSymbols = { "operand" : ["0","1","2","3","4","5","6","7","8","9"], "operator" : ["*","/","+","-"], "open_parenthesis" : ["("], "close_parenthesis": [")"] };
	
	let combineGrammar = { "operand" : [["operand", "operand"]] };
	
	let insertionCommands = {
		"mult_insert" : [new InsertionIndex(0), new InsertionIndex(-1, Operator, false, "*"), new InsertionIndex(1)],
		"unary" : [new InsertionIndex(0, Operator, false), new InsertionIndex(1, Operator, true)],
		"binary" : [new InsertionIndex(0), new InsertionIndex(1, Operator, false), new InsertionIndex(2)]
	};
	
	let insertionGrammar = {
		"mult_insert" : [["close_parenthesis", "open_parenthesis"], ["operand", "open_parenthesis"]],
		"unary" : [["start", "operator"], ["operator", "operator"]],
		"binary" : [["operand", "operator", "operand"], ["close_parenthesis", "operator", "operand"], ["close_parenthesis", "operator", "open_parenthesis"], ["operand", "operator", "open_parenthesis"]]
	};

	
	let operatorCharacteristics = [
		{ operator : new Operator(true,  "-"), precedence : 1, associativity:  1, func : (a)    => -a    },
		{ operator : new Operator(false, "*"), precedence : 2, associativity: -1, func : (a, b) => a * b },
		{ operator : new Operator(false, "/"), precedence : 2, associativity: -1, func : (a, b) => a / b },
		{ operator : new Operator(false, "+"), precedence : 3, associativity: -1, func : (a, b) => a + b },
		{ operator : new Operator(false, "-"), precedence : 3, associativity: -1, func : (a, b) => a - b }
	];
	
	let array = CALC.GRAMMAR.ToSymbolArray(str, baseSymbols);
	let oldArray = [];
	
	while (!COMPARE.Equals(array, oldArray)) {
		oldArray = array;
		array = CALC.GRAMMAR.CombinePass(oldArray, combineGrammar);
		array = CALC.GRAMMAR.InsertionPass(array, insertionGrammar, insertionCommands);
	}
	
	// Remove the start symbol used in the case of the first symbol being unary.
	array.shift();
	
	//console.log(array);

	let postfix = CALC.ShuntingYard(array, operatorCharacteristics);
	
	return CALC.Solve(postfix, operatorCharacteristics);
}

CALC.GetPrecedence = function(operator, operChars) {
	let characteristics = CALC.GetCharacteristics(operator, operChars);
	if (characteristics == null)
		return null;
	
	return characteristics.precedence;
}

CALC.GetAssociativity = function(operator, operChars) {
	let characteristics = CALC.GetCharacteristics(operator, operChars);
	if (characteristics == null)
		return null;
	
	return characteristics.associativity;
}

CALC.GetCharacteristics = function(operator, operChars) {
	for (let i = 0; i < operChars.length; i++) {
		if (operChars[i].operator.unary == operator.unary && operChars[i].operator.value == operator.value)
			return operChars[i];
	}
	
	return null;
}

CALC.Solve = function(array, operChars) {
	let stack = [];
	
	let n = array.length;
	
	for (let i = 0; i < n; i++) {
		let symbol = array[i];
		
		if (symbol.type == "operand") {
			stack.push(Number(symbol.value));
		}
		else if (symbol.type == "operator" && symbol.unary == true) {
			let value = stack.pop();
			value = CALC.GetCharacteristics(symbol, operChars).func(value);
			stack.push(value);
		}
		else {
			let valueA = stack.pop();
			let valueB = stack.pop();
			value = CALC.GetCharacteristics(symbol, operChars).func(valueB, valueA);
			stack.push(value);
		}
	}
	
	return stack.pop();
}



