// элементы, начинающиеся с "$" - DOM-элементы
// калькулятор можно перемещать, взяв его за верхнюю часть
// ошибок много, я о них знаю ))

const $calc = document.querySelector('.calculator')
const $keyboard = $calc.querySelector('.keyboard')
const $input = $calc.querySelector('#input')
const $output = $calc.querySelector('#output')
let expression = []
let actualValue = 0

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
	if (!Number.isInteger(+number)) return false
	if (actualValue == null) actions('clear')
	if (lastSymbol($output.innerHTML) === ')') actions('clear')
	if (actualValue == 0) actualValue = ''
	if (actualValue.length > 10) return
	actualValue += number
	$input.innerHTML = actualValue
	return true
}

function setExpres(code, ...arr) {
	if (code < 0) code = `(${code})`
	expression.push(code, ...arr)
	const str = expression.join(' ')
	$output.innerHTML = str
}

function lastSymbol(str, delimiter = ' ') {
	const arr = str.split(delimiter)
	return arr[arr.length - 1]
}

function setOperators(o) {
	const last = lastSymbol($output.innerHTML)
	if (['/', '*', '-', '+'].includes(last)) setExpres(0, o)
	else setExpres(o)
}

function calculate(exp) {
	try {
		const arr = exp.split(' ').map(elem => {
			if (elem.includes('sqrt'))
				return (elem = Math.sqrt(elem.slice(0, -1).slice(5)))
			if (elem.includes('sqr'))
				return (elem = Math.pow(elem.slice(0, -1).slice(4), 2))
			if (elem.includes('(-')) return elem.slice(0, -1).slice(1)
			return elem
		})
		const result = eval(arr.join(' '))
		return (result ^ 0) === result ? result : result.toFixed(3)
	} catch {
		return 0
	}
}

function actions(code) {
	switch (code) {
		case 'Escape':
		case 'clear':
			actualValue = 0
			$input.innerHTML = actualValue
			$output.innerHTML = ''
			expression = []
			return true

		case 'Backspace':
			actualValue = String(actualValue)
			if (actualValue.length === 1) actualValue = 0
			if (actualValue.length > 1) actualValue = actualValue.slice(0, -1)
			$input.innerHTML = actualValue
			break

		case 'sqr': {
			setExpres(`sqr(${parseFloat(actualValue)})`)
			actualValue = 0
			break
		}

		case 'sqrt':
			setExpres(`sqrt(${parseFloat(actualValue)})`)
			actualValue = 0
			break

		case '%':
			setExpres(parseFloat(actualValue) / 100)
			actualValue = 0
			break

		case '/':
		case '*':
		case '-':
		case '+':
			if (actualValue !== 0) setExpres(parseFloat(actualValue))
			setOperators(code)
			actualValue = 0
			break

		case '+/-':
			actualValue = parseFloat(actualValue) * -1
			$input.innerHTML = actualValue
			break

		case ',':
			if (actualValue.split('').includes('.')) break
			$input.innerHTML = parseFloat(actualValue) + '.'
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
			actualValue = 0
			break
		case 'Enter':
		case '=':
			if (actualValue !== 0) setExpres(parseFloat(actualValue))
			$input.innerHTML = calculate($output.innerHTML)
			actualValue = null
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
	$calc.style.top = pageY - moving.y + 'px'
	$calc.style.left = pageX - moving.x + 'px'
})
