let CALC = {};

function Fraction(a, b) {
	this.numerator = null;
	this.denominator = null
	
	// Dividing by 0 results in infinity.
	if (b == 0)
		return Infinity;
	
	// Dividing by infinity results in 0.
	if (b == Infinity)
		return 0;

	let div = CALC.Gcd(a, b);
	
	this.numerator = a / div;
	this.denominator = b / div;
}

CALC.Gcd = function() {
	let params;
	
	function euclid(a, b) {
		if (b == 0)
			return a;
			
		return euclid(b, a % b);
	}
	
	// If there are no arguments, throw an error.
	if (arguments.length == 0)
		throw "No arguments passed";
	
	// If the only argument is an array, assign to params.
	else if (arguments.length == 1 && typeof arguments[0] == 'object' && arguments[0].constructor == Array)
		params = arguments[0];
	
	// If the only argument is an integer, return its absolute (positive) value. (Needs to be an integer!) <-------------------------------
	else if (arguments.length == 1 && typeof arguments[0] == 'number')
		return Math.abs(arguments[0]);
	
	// If there are only two integer arguments, return their GCD. (Needs to be an integer!) <-------------------------------
	else if (arguments.length == 2 && typeof arguments[0] == 'number' && typeof arguments[1] == 'number')
		return euclid(Math.abs(arguments[0]), Math.abs(arguments[1]));
	
	// If the only argument is neither an array nor an integer OR
	// If there are only two arguments, but at least one isn't an integer, throw an error
	else if (arguments.length == 1 || arguments.length == 2)
		throw "Only integer arguments are valid";
	
	
	// If more than two arguments, assign them to an array.
	else
		params = Array.prototype.slice.call(arguments);
	
	
	// Using the array (params).
	
	
	// If params is empty, throw an error.
	if (params.length == 0)
		throw "No arguments passed";
	
	// If params holds only one integer, return that value.
	else if (params.length == 1 && typeof params[0] == 'number')
		return Math.abs(params[0]);
	
	// If params holds only two integer elements, return the GCD of them.
	else if (params.length == 2 && typeof params[0] == 'number' && typeof params[1] == 'number')
		return euclid(Math.abs(params[0]), Math.abs(params[1]));
	
	// If the only element isn't an integer OR
	// If there are only two elements, but at least one isn't an integer, throw an error
	else if (params.length == 1 || params.length == 2)
		throw "Only integer arguments are valid";
	
	// 'params' holds at least 3 elements (which may or may not be integers).
	
	// Remove the first element from params.
	let left = params.shift();
	
	// If the first element isn't an integer, throw an error.
	if (typeof left != 'number')
		throw "Only integer arguments are valid";
	
	// Return the GCD of a and b where:
	//  a = the first element of params.
	//	b = the GCD of the remaining elements of params.
	
	return euclid(Math.abs(left), CALC.Gcd(params));
}