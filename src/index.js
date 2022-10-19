import solve from './solve.js'

const form = document.getElementById("form")
const solution = document.getElementById("solution")

function formatNumber(num) {
  if (Number.isInteger(num)) return num.toString()
  return num.toFixed(3)
}

function isValid(num) {
  return typeof num === 'number' && Number.isFinite(num)
}

function isInvalid(num) {
  return !isValid(num)
}

function render(state) {
  solution.replaceChildren()

  if (!state.valid) {
    solution.innerText = "Заполните все поля формы"
    return
  }

  if (Object.values(state.solution).some((v) => Array.isArray(v) ? v.some(isInvalid) : isInvalid(v))) {
    solution.innerText = "Введены некорректные данные"
    return
  }

  Object.entries(state.solution)
    .forEach(([key, value]) => {
      const item = document.createElement("li")
      const heading = document.createElement("h4")
      const span = document.createElement("span")

      heading.innerText = key.replace("step", "Шаг ")
      span.innerText = Array.isArray(value) ? value.map(formatNumber).join('\n') : formatNumber(value)

      item.appendChild(heading)
      item.appendChild(span)

      solution.appendChild(item)
    })
}

function app() {
  const state = {
    valid: false,
    solution: {},
  }

  const handleInput = () => {
    const input = parseForm(form)
    const valid = form.checkValidity() && input
    state.valid = valid
    if (valid) {
      state.solution = solve(input)
    }
    render(state)
  }

  form.addEventListener("input", handleInput)

  handleInput()
}

function parseForm(form) {
  const input = [...new FormData(form)]
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  const { price, cost, volume, share } = input
  if (!price || !cost || !volume || !share) {
    return undefined
  }
  return {
    price_unit: parseFloat(price),
    cost_unit: parseFloat(cost),
    output_nat_year: parseFloat(volume) * 1000,
    varCost_part: parseFloat(share) / 100
  }
}

app()
