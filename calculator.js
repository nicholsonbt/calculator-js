var calculator;

function addChar(displayChar, valueChar) {
	document.getElementById("display").innerHTML += displayChar;
	x += valueChar;
}

function clearDisplay() {
	console.log("Clear");
	document.getElementById("display").innerHTML = "";
	x = "";
}

function solve() {
	calculator.Solve("2");
	calculator.Solve("-98.6*67 (-3/(2-4)+-1)/3/4+7- sin(5%2)");
	calculator.Solve("56.sin(X)>=2");
}



window.addEventListener('load', function(e) {
	// Secondary tokens: operator, number, string_lower, variable.
	// String tokens: function, constants.
	// Main tokens: functions (functions and operators), arguments (numbers, variables, constants).
	
	let x = new CalculatorSettings();

	x.AddValdCharacters("left_parenthesis", '(');
	x.AddValdCharacters("right_parenthesis", ')');
	x.AddValdCharacters("operator", ['!', '%', '*', '+', '-', '/', '^']);
	x.AddValdCharacters("comma", ',');
	x.AddValdCharacters("period", '.');
	x.AddValdCharacters("number", ['0','1','2','3','4','5','6','7','8','9']);
	x.AddValdCharacters("equality", ['<', '=', '>']);
	x.AddValdCharacters("variable", ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']);
	x.AddValdCharacters("string", ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);
	x.AddValdCharacters("whitespace", String.fromCharCode(9, 10, 11, 12, 13, 32, 133, 160, 5760, 6158, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8203, 8204, 8205, 8232, 8233, 8239, 8287, 8288, 12288, 65279).split(''));

	x.AddJoin(0, "number", "number", "number", (a, b) => a + b);
	x.AddJoin(0, "string", "string", "string", (a, b) => a + b);
	x.AddJoin(0, "number", "period", "number", (a, b) => a + b);
	x.AddJoin(0, "period", "number", "number", (a, b) => a + b);
	x.AddJoin(0, "equality", "equality", "equality", (a, b) => a + b);
	
	x.AddRemove(0, "whitespace");
	
	// Remove whitespace first:
	x.AddInsert(1, "number", "left_parenthesis", "operator", '*');
	x.AddInsert(1, "number", "string", "operator", '*');
	x.AddInsert(1, "number", "variable", "operator", '*');
	x.AddInsert(1, "right_parenthesis", "left_parenthesis", "operator", '*');
	x.AddInsert(1, "right_parenthesis", "string", "operator", '*');
	x.AddInsert(1, "right_parenthesis", "variable", "operator", '*');
	x.AddInsert(1, "variable", "variable", "operator", '*');
	
	calculator = new Calculator(x);
});




function CalculatorSettings() {
	this.Tokens = [];
	this.CharTokenTable = {};
	this.JoinTokenTable = [];
	this.InsertTokenTable = [];
	this.RemoveTokenTable = [];
}

/**
 * Adds all values to CharTokenTable and assigns them the given type.
 *
 * @param {string} type The type to assign to all values.
 * @param {Array<char>} values An array of characters to be added as properties to CharTokenTable.
 */
CalculatorSettings.prototype.AddValdCharacters = function(type, values) {
	let n = values.length;
	
	// For each value in each key, add the <key, value> pair where <key> = charTokenValue and <value> = charTokenType.
	// This means each token value will map to its token type, instead of each token type mapping to an array of token values.
	// This should speed up the assignment of character tokens.
	for (let i = 0; i < n; i++) {
		// If the token value hasn't already been added to the dictionary, add it.
		if (!this.CharTokenTable.hasOwnProperty(values[i])) {
			this.CharTokenTable[values[i]] = type;
		}
		// If the token value has already been added to the dictionary, and the type it has been assigned is different to the
		// current type to be assigned, throw an error because a character token can only ever have one type assigned to it.
		else if (this.CharTokenTable[values[i]] != type) {
			console.warn("ERROR: Overriding the token associated with value " + values[i] + " from " + this.CharTokenTable[values[i]] + " to " + type + ".");
			this.CharTokenTable[values[i]] = type;
		}
		// If the token value has already been added to the dictionary, but it was assigned the same type as is currently being
		// assigned, give a warning that a character value is repeated in the token list and then continue, as it causes no problems.
		else {
			console.warn("WARNING: Value " + values[i] + " was found twice in the character token list: " + type + ".");
		}
	}
	
	if (!this.Tokens.includes(type))
		this.Tokens.push(type);
}

CalculatorSettings.prototype.AddJoin = function(iteration, leftToken, rightToken, newToken, valueFunction) {
	if (!this.Tokens.includes(leftToken))
		console.error("ERROR: Token: " + leftToken + " hasn't been added to the tokens table.");
	
	if (!this.Tokens.includes(rightToken))
		console.error("ERROR: Token: " + rightToken + " hasn't been added to the tokens table.");
	
	if (!this.Tokens.includes(newToken))
		console.error("ERROR: Token: " + newToken + " hasn't been added to the tokens table.");
	
	while (this.JoinTokenTable.length <= iteration) {
		this.JoinTokenTable.push({});
	}
	
	if (!this.JoinTokenTable[iteration].hasOwnProperty(leftToken))
		this.JoinTokenTable[iteration][leftToken] = {};
	
	if (!this.JoinTokenTable[iteration][leftToken].hasOwnProperty(rightToken)) {
		this.JoinTokenTable[iteration][leftToken][rightToken] = { joinToken: newToken, func: valueFunction };
	} else {
		let join = this.JoinTokenTable[iteration][leftToken][rightToken];
		
		if (join.joinToken == newToken) {
			console.warn("WARNING: Overriding the function for a join between a " + leftToken + " token and " + rightToken + " token on iteration " + iteration + " (resulting in a " + newToken + ").");
			join.func = valueFunction;
		}
		else {
			console.warn("WARNING: Overriding the function and result for a join between a " + leftToken + " token and " + rightToken + " token on iteration " + iteration + " (previously resulting in a " + join.joinToken + ", now a " + newToken + ").");
			join.joinToken = newToken;
			join.func = valueFunction;
		}
	}
}

CalculatorSettings.prototype.AddInsert = function(iteration, leftToken, rightToken, newToken, tokenValue) {
	if (!this.Tokens.includes(leftToken))
		console.error("ERROR: Token: " + leftToken + " hasn't been added to the tokens table.");
	
	if (!this.Tokens.includes(rightToken))
		console.error("ERROR: Token: " + rightToken + " hasn't been added to the tokens table.");
	
	if (!this.Tokens.includes(newToken))
		console.error("ERROR: Token: " + newToken + " hasn't been added to the tokens table.");
	
	while (this.InsertTokenTable.length <= iteration) {
		this.InsertTokenTable.push({});
	}
	
	if (!this.InsertTokenTable[iteration].hasOwnProperty(leftToken))
		this.InsertTokenTable[iteration][leftToken] = {};
	
	if (!this.InsertTokenTable[iteration][leftToken].hasOwnProperty(rightToken)) {
		this.InsertTokenTable[iteration][leftToken][rightToken] = { insertToken: newToken, value: tokenValue };
	} else {
		let insert = this.InsertTokenTable[iteration][leftToken][rightToken];
		
		if (insert.joinToken == newToken) {
			console.warn("WARNING: Overriding the function for an insert between a " + leftToken + " token and " + rightToken + " token on iteration " + iteration + " (resulting in a " + newToken + ").");
			insert.value = valueFunction;
		}
		else {
			console.warn("WARNING: Overriding the function and result for an insert between a " + leftToken + " token and " + rightToken + " token on iteration " + iteration + " (previously resulting in a " + insert.insertToken + ", now a " + newToken + ").");
			insert.insertToken = newToken;
			insert.value = valueFunction;
		}
	}
}

CalculatorSettings.prototype.AddRemove = function(iteration, token) {
	if (!this.Tokens.includes(token))
		console.error("ERROR: Token: " + token + " hasn't been added to the tokens table.");
	
	while (this.RemoveTokenTable.length <= iteration) {
		this.RemoveTokenTable.push([]);
	}
	
	if (!this.RemoveTokenTable[iteration].includes(token))
		this.RemoveTokenTable[iteration].push(token);
}




function Calculator(calculatorSettings) {
	this.settings = calculatorSettings;
}

Calculator.prototype.Solve = function(calculation) {
	let lexicalAnalysis = this.Scan(calculation);
	console.log(lexicalAnalysis);
}

Calculator.prototype.Token = function(type, value) {
	this.type = type;
	this.value = value;
}

Calculator.prototype.Tokenize = function(arr) {
	let n = arr.length;
	let array = [];
		
	// Foreach character in the calculation, get it's token type and create a token.
	for (let i = 0; i < n; i++) {
		let value = arr[i];
		array.push(new this.Token(this.settings.CharTokenTable[value], value));
	}
		
	return array;
}

Calculator.prototype.ScanCombine = function(arr, iteration) {
	function GetJoin(joinTable, prev, next) {
		try {
			return joinTable[iteration][prev][next];
		} catch (err) {
			return null;
		}
	}
	
	let type;
	let prevType = null;
	let k = -1;
	let n = arr.length;
	let array = [];
	
	// Foreach token in the array, if the token can be joined with others of the same type, do so.
	for (let i = 0; i < n; i++) {
		type = arr[i].type;
		
		let x = GetJoin(this.settings.JoinTokenTable, prevType, type);
		
		if (x == null) {
			array.push(arr[i]);
			prevType = type;
		}
		else {
			let newValue = x.func(array[array.length - 1].value, arr[i].value);
			array[array.length - 1] = new this.Token(x.joinToken, newValue);
			prevType = x.joinToken;
		}
	}
	
	return array;
}

Calculator.prototype.ScanInsert = function(arr, iteration) {
	function GetInsert(insertTable, prev, next) {
		try {
			return insertTable[iteration][prev][next];
		} catch (err) {
			return null;
		}
	}
	
	
	let type;
	let prevType = null;
	let n = arr.length;
	let array = []
	
	// Foreach token in the array, if the token can be joined with others of the same type, do so.
	for (let i = 0; i < n; i++) {
		type = arr[i].type;
		
		let x = GetInsert(this.settings.InsertTokenTable, prevType, type);
		
		if (x == null) {
			array.push(arr[i])
		}
		else {
			array.push(new this.Token(x.insertToken, x.value));
			array.push(arr[i])
		}
		prevType = type;
	}
	
	return array;
}

Calculator.prototype.ScanRemove = function(arr, iteration) {
	function GetRemove(removeTable, type) {
		try {
			return removeTable[iteration].includes(type)
		} catch (err) {
			return false;
		}
	}
	
	let type;
	let n = arr.length;
	let array = []
	
	// Foreach token in the array, if the token can be joined with others of the same type, do so.
	for (let i = 0; i < n; i++) {
		type = arr[i].type;
		
		if (!GetRemove(this.settings.RemoveTokenTable, type)) {
			array.push(arr[i])
		}
	}
	
	return array;
}

Calculator.prototype.Scan = function(calculation) {
	let arr = calculation.split('');
	let iterations = Math.max(this.settings.JoinTokenTable.length, this.settings.InsertTokenTable.length);
	
	array = this.Tokenize(arr);
	
	for (let i = 0; i < iterations; i++) {
		array = this.ScanCombine(array, i);
		array = this.ScanInsert(array, i);
		array = this.ScanRemove(array, i);
	}
	
	return array;
}

