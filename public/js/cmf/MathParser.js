(function(_$) {
	var halt = false,
		look_ahead = "",
		original = "",
		arg = 0,
		stack = [],
		words = [];

	_$.MathParser = function(str) {
		function Abort(str) {
			arg = NaN;
			halt = true;
		}

		function Expected(str) {
			Abort("Expected " + str + "<br>Found \'" + original + "\'");
		}

		function Match(str) {
			if (look_ahead == str) GetNext();
			else Expected("\'" + str + "\'");
		}

		function IsAlpha(str) {
			return (typeof str === "string");
		}

		function IsDigit(num) {
			if (isNaN(num)) return false;
			return (typeof num === "number");
		}

		function IsAddop(str) {
			return (
				str == '+' ||
				str == '-');
		}

		function IsWhitespace(str) {
			return (
				str == "" ||
				str == ' ' ||
				str == '\t' ||
				str == '\n' ||
				str == '\r');
		}

		function GetNext() {
			if (words.length == 0)
				halt = true;

			look_ahead = words.shift();
			if (IsWhitespace(look_ahead))
				GetNext();
		}

		function GetName() {
			if (!IsAlpha(look_ahead)) Expected("Name");
			var str = look_ahead;
			GetNext();
			return str;
		}

		function GetNum() {
			var num = parseInt(look_ahead);
			if (!IsDigit(num)) Expected("Number");
			GetNext();
			return num;
		}

		function Term() {
			Factor();

			while (!halt && (look_ahead == '*' || look_ahead == '/')) {
				stack.unshift(arg);
				switch (look_ahead) {
					case '*':
						Multiply();
						break;
					case '/':
						Divide();
						break;
					default:
						Expected("Mulop");
						break;
				}
			}
		}

		function Factor() {
			if (look_ahead == '(') {
				Match('(');
				Expression();
				Match(')');
			} else if (IsAddop(look_ahead)) {
				Expression();
			} else {
				arg = GetNum();
			}
		}

		function Init(str) {
			halt = false;
			look_ahead = "";
			original = str;
			arg = 0;
			stack = [];
			words = str.split(/(\+|\-|\*|\/|\(|\)|\d+|[A-Za-z_][\w]*)/);
			
			GetNext();
			Expression();

			return arg;
		}

		function Expression() {
			if (IsAddop(look_ahead)) arg = 0;
			else Term();

			while (!halt && IsAddop(look_ahead)) {
				stack.unshift(arg);
				switch (look_ahead) {
					case '+':
						Add();
						break;
					case '-':
						Subtract();
						break;
					default:
						Expected("Addop");
						break;
				}
			}
		}

		function Add() {
			Match("+");
			Term();
			arg = (stack.shift() + arg);
		}

		function Subtract() {
			Match("-");
			Term();
			arg = (stack.shift() - arg);
		}

		function Multiply() {
			Match("*");
			Factor();
			arg = (stack.shift() * arg);
		}

		function Divide() {
			Match("/");
			Factor();
			arg = (stack.shift() / arg);
		}

		return Init(str);
	}
}(cmf));