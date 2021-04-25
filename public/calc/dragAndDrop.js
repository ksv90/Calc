export default function ($calc) {
	const moving = {
		isMove: false,
	}
	const head = $calc.querySelector('h1')
	head.addEventListener('mousedown', down)
	document.addEventListener('mouseup', up)
	document.addEventListener('mousemove', move)

	function down({ offsetX, offsetY }) {
		moving.isMove = true
		moving.x = offsetX
		moving.y = offsetY
	}

	function up() {
		moving.isMove = false
	}

	function move({ pageX, pageY }) {
		if (!moving.isMove) return
		$calc.style.left = pageX - moving.x + 'px'
		$calc.style.top = pageY - moving.y + 'px'
	}

	return () => {
		head.removeEventListener('mousedown', down)
		document.removeEventListener('mouseup', up)
		document.removeEventListener('mousemove', move)
	}
}
