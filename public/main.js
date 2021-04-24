// элементы, начинающиеся с "$" - DOM-элементы
// калькулятор можно перемещать, взяв его за верхнюю часть
// Infinity допустимый ответ

const $calc = document.querySelector('.calculator')
const $keyboard = $calc.querySelector('.keyboard')
const $input = $calc.querySelector('.input')
const $output = $calc.querySelector('.output')
let expression = []
let actualValue = '0'

$keyboard.addEventListener('click', ({ target }) => {
	const $button = target.closest('li')
	if (!$button) return
	const { number, code } = $button.dataset
	if (actions(code)) return
	if (number) return setNumber(number)
})

document.addEventListener('keydown', ({ key }) => {
	if (actions(key)) return
	if (setNumber(key)) return
})

function setNumber(number) {
	if (!isNumeric(+number)) return false
	if (actualValue === '' && !isOperator()) actions('clear')
	if (expression.join(' ') !== $output.innerHTML) actions('clear')
	if (actualValue === '0') actualValue = ''
	if (actualValue.length > 10) return
	actualValue += number
	$input.innerHTML = actualValue
	return true
}

function setExpres(code, ...arr) {
	if (code < 0) code = `(${code})`
	if (lastSymbol(code.split('')) === '.') code = +code.splice(0, -1)
	arr = arr.map(elem => '' + elem)
	expression.push('' + code, ...arr)
	$output.innerHTML = expression.join(' ')
}

function lastSymbol(data) {
	if (data) return data[data.length - 1]
	return expression[expression.length - 1]
}

function isNumeric(data) {
	if (typeof data === 'number' && !isNaN(data)) return true
	return false
}

function isOperator() {
	return '/*-+'.includes(lastSymbol())
}

function calculate() {
	expression = expression.map(elem => {
		if (elem.includes('sqrt'))
			return (elem = Math.sqrt(elem.slice(0, -1).slice(5)))
		if (elem.includes('sqr'))
			return (elem = Math.pow(elem.slice(0, -1).slice(4), 2))
		if (elem.includes('(-')) return elem.slice(0, -1).slice(1)
		if (elem.includes('%')) return '' + elem.slice(0, -1) / 100
		return elem
	})
	while (consider()) {}
	const result = expression[0]
	if (String(result).length < 15) return result || 0
	if (Number.isInteger(result)) return Infinity
	return rain(String(result.toFixed(10)))
}

function rain(data) {
	if (data.slice(-1) !== '0') return data
	return rain(data.slice(0, -1))
}

function consider() {
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

function actions(code) {
	switch (code) {
		case 'Escape':
		case 'Delete':
		case 'clear':
			actualValue = ''
			$input.innerHTML = actualValue
			$output.innerHTML = ''
			expression = []
			return true

		case 'Backspace':
			if (actualValue.length === 1) actualValue = ''
			if (actualValue.length > 1) actualValue = actualValue.slice(0, -1)
			$input.innerHTML = +actualValue
			break

		case 'sqr': {
			if (!expression.length || isOperator())
				setExpres(`sqr(${parseFloat(actualValue) || 0})`)
			actualValue = ''
			break
		}

		case 'sqrt':
			if (!expression.length || isOperator())
				setExpres(`sqrt(${parseFloat(actualValue) || 0})`)
			actualValue = ''
			break

		case '%':
			if (actualValue !== '' && isNumeric(+actualValue))
				setExpres(`${actualValue}%`)
			actualValue = ''
			break

		case '/':
		case '*':
		case '-':
		case '+':
			const isOp = isOperator()
			if (actualValue === '' && !expression.length) setExpres(0, code)
			else if (!expression.length) setExpres(actualValue, code)
			else if (actualValue !== '' && isOp) setExpres(actualValue, code)
			else if (actualValue === '' && isOp) {
				expression.splice(-1, 1)
				setExpres(code)
			} else setExpres(code)
			actualValue = ''
			break

		case '+/-':
			actualValue = '' + (parseFloat(actualValue) || 0) * -1
			$input.innerHTML = actualValue
			break

		case ',':
			if (actualValue.includes('.')) break
			actualValue = +actualValue + '.'
			$input.innerHTML = actualValue
			break

		case '(':
			setExpres('(')
			break

		case ')':
			const exp = $output.innerHTML.split(' ')
			let counter = 0
			exp.forEach(elem => (elem === '(' ? counter++ : null))
			if (!counter) break
			setExpres(parseFloat(actualValue), ')')
			actualValue = ''
			break
		case 'Enter':
		case '=':
			if (!expression.length) break
			setExpres(actualValue)
			actualValue = '' + calculate()
			$input.innerHTML = actualValue
			expression = []
			break
		default:
			return false
	}
	return true
}

const moving = {
	isMove: false,
}

$calc
	.querySelector('h1')
	.addEventListener('mousedown', ({ offsetX, offsetY }) => {
		moving.isMove = true
		moving.x = offsetX
		moving.y = offsetY
	})

document.addEventListener('mouseup', () => (moving.isMove = false))

document.addEventListener('mousemove', ({ pageX, pageY }) => {
	if (!moving.isMove) return
	$calc.style.left = pageX - moving.x + 'px'
	$calc.style.top = pageY - moving.y + 'px'
})
