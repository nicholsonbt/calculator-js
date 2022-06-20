var calculator;

function addChar(displayChar, valueChar) {
}

function clearDisplay() {
}

function solve() {
	calculator.Solve("1+2*3");
	calculator.Solve("-98.6*67 (-3/(2-4)+-1)/3/4+7- sin(5%2)");
	calculator.Solve("56.sin(X)>=2");
	calculator.Solve("piX*-Ycos(X%14)");
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
	x.AddInsert(1, "variable", "string", "operator", '*');
	
	calculator = new Calculator(x);
});


