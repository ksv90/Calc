import html from './html.js'
import dad from './dragAndDrop.js'
import {
	calculate,
	lastSymbol,
	isNumeric,
	isOperator,
	isBrackets,
} from './utils.js'

const calc = {
	open(root) {
		const id = Date.now()
		const [calc, remove] = createCalc(id, openCalc.length)
		root.append(calc)
		openCalc.push({ id, remove })
	},
	close(idEl) {
		openCalc = openCalc.filter(({ id, remove }) => idEl !== id || remove())
	},
}
export default calc
let openCalc = []
let activeCalc = null

function createCalc(id, count) {
	const $calc = document.createElement('div')
	$calc.classList.add('calculator')
	$calc.dataset.id = id
	$calc.innerHTML = html
	$calc.style.left = count * 50 + 300 + 'px'
	$calc.style.top = count * 50 + 50 + 'px'

	const close = dad($calc)
	focus()

	const $keyboard = $calc.querySelector('.calculator__keyboard')
	const $input = $calc.querySelector('.calculator__entry-field_input')
	const $output = $calc.querySelector('.calculator__entry-field_output')
	const $close = $calc.querySelector('.calculator__head_close')
	let expression = []
	let actualValue = ''

	$calc.addEventListener('mousedown', focus)
	$keyboard.addEventListener('click', clickHandler)
	document.addEventListener('keydown', keyHendler)

	function focus() {
		if (activeCalc) activeCalc.classList.remove('calculator_active')
		activeCalc = $calc
		activeCalc.classList.add('calculator_active')
	}

	function clickHandler({ target }) {
		const $button = target.closest('li')
		if (!$button) return
		const { number, code } = $button.dataset
		if (actions(code)) return
		if (number) return setNumber(number)
	}

	function keyHendler({ key }) {
		if (activeCalc !== $calc) return
		if (actions(key)) return
		if (setNumber(key)) return
	}

	function setNumber(number) {
		if (!isNumeric(+number)) return false
		if (
			actualValue === '' &&
			!isOperator(expression) &&
			lastSymbol(expression) !== '('
		)
			actions('clear')
		if (expression.join(' ') !== $output.innerHTML) actions('clear')
		if (actualValue === '0') actualValue = ''
		if (actualValue.length > 10) return
		actualValue += number
		$input.innerHTML = actualValue
		return true
	}

	function setExpres(code, ...arr) {
		if (+code < 0) code = `(${code})`
		if (code === '') code = '0'
		if (lastSymbol(code.split('')) === '.') code = +code.splice(0, -1)
		arr = arr.map(elem => '' + elem)
		expression.push('' + code, ...arr)
		$output.innerHTML = expression.join(' ')
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
				if (!expression.length || isOperator(expression))
					setExpres(`sqr(${+actualValue || 0})`)
				actualValue = ''
				break
			}

			case 'sqrt':
				if (!expression.length || isOperator(expression))
					setExpres(`sqrt(${+actualValue || 0})`)
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
				const isOp = isOperator(expression)
				if (actualValue === '' && !expression.length) setExpres('', code)
				else if (lastSymbol(expression) === '(') setExpres(actualValue, code)
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
				if (!expression.length || isOperator(expression)) setExpres('(')
				break

			case ')':
				if (!isBrackets(expression)) break
				setExpres(actualValue || '0', ')')
				actualValue = ''
				break
			case 'Enter':
			case '=':
				if (!expression.length) break
				let brackets = isBrackets(expression)
				setExpres(actualValue)
				if (brackets) while (brackets--) setExpres(')')
				actualValue = '' + calculate(expression)
				$input.innerHTML = actualValue
				expression = []
				break
			default:
				return false
		}
		return true
	}
	$close.addEventListener(
		'click',
		({ target }) => {
			const $calc = target.closest('.calculator')
			if (!$calc) return
			calc.close(+$calc.dataset.id)
		},
		{ once: true }
	)
	return [
		$calc,
		() => {
			$calc.removeEventListener('mousedown', focus)
			$keyboard.removeEventListener('click', clickHandler)
			document.removeEventListener('keydown', keyHendler)
			$calc.remove()
			close()
		},
	]
}

document.addEventListener('keydown', event =>
	event.key === 'Enter' ? event.preventDefault() : null
)
