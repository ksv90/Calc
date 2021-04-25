import calc from './calc/index.js'

const open = document.getElementById('open')
const root = document.querySelector('.root')

open.addEventListener('click', () => calc.open(root))
