export function isNumeric(data) {
	if (typeof data === 'number' && !isNaN(data)) return true
	return false
}

export function lastSymbol(data) {
	return data[data.length - 1]
}

export function isOperator(data) {
	return '/*-+'.includes(lastSymbol(data))
}

export function isBrackets(expression) {
	let counter = 0
	expression.forEach(elem => {
		if (elem === '(') counter++
		else if (elem === ')') counter--
	})
	return counter
}

function isExpression(expression) {
	let s = null
	let f = null
	for (let i = 0, len = expression.length; i < len; i++) {
		const elem = expression[i]
		if (elem === '(') s = i
		else if (elem === ')') {
			f = i
			return [s, f - s + 1]
		}
	}
	return null
}

export function calculate(expression) {
	expression = expression.map(elem => {
		if (elem.includes('sqrt'))
			return (elem = Math.sqrt(elem.slice(0, -1).slice(5)))
		if (elem.includes('sqr'))
			return (elem = Math.pow(elem.slice(0, -1).slice(4), 2))
		if (elem.includes('(-')) return elem.slice(0, -1).slice(1)
		if (elem.includes('%')) return '' + elem.slice(0, -1) / 100
		return elem
	})
	let sf = isExpression(expression)
	while (sf) {
		let exp = expression.splice(...sf)
		exp = exp.slice(0, -1).slice(1)
		while (consider(exp)) {}
		expression.splice(sf[0], 0, ...exp)
		sf = isExpression(expression)
	}
	while (consider(expression)) {}
	const result = expression[0]
	if (String(result).length < 15) return result || 0
	if (Number.isInteger(result)) return Infinity
	return rain(String(result.toFixed(10)))
}

function rain(data) {
	if (data.slice(-1) !== '0') return data
	return rain(data.slice(0, -1))
}

function consider(expression) {
	for (let i = 0, len = expression.length; i < len; i++) {
		const elem = expression[i]
		if (Number.isInteger(elem)) continue
		if (elem === '/') {
			const res = expression[i - 1] / expression[i + 1]
			expression.splice(i - 1, 3, res)
			return true
		}
		if (elem === '*') {
			const res = expression[i - 1] * expression[i + 1]
			expression.splice(i - 1, 3, res)
			return true
		}
	}
	for (let i = 0, len = expression.length; i < len; i++) {
		const elem = expression[i]
		if (elem === '+') {
			const res = +expression[i - 1] + +expression[i + 1]
			expression.splice(i - 1, 3, res)
			return true
		}
		if (elem === '-') {
			const res = expression[i - 1] - expression[i + 1]
			expression.splice(i - 1, 3, res)
			return true
		}
	}
	return false
}
