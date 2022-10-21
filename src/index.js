import solve from './solve.js'

const form = document.getElementById("form")
const solution = document.getElementById("solution")
const questions = document.getElementById("questions")
const search = document.getElementById("search")

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
  renderSearch(state)

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
    querry: ""
  }

  const handleInput = () => {
    const input = parseForm(form)
    const valid = form.checkValidity() && input
    state.valid = valid
    if (valid) {
      state.solution = solve(input)
    }
    state.querry = parseSearchForm(search)

    render(state)
  }

  form.addEventListener("input", handleInput)
  search.addEventListener("input", handleInput)

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

function parseSearchForm(sf) {
  return [...new FormData(sf)][0][1]
}

function levenshteinDistanceFuzzy(s1, s2) {
  const l1 = s1.length
  const l2 = s2.length
  if (l1 == 0) return l2;
  if (l2 == 0) return l1;
  let res = Math.max(l1, l2)
  let dp = []
  let i = 1
  while (i <= l1) {
    dp.push(i)
    ++i
  }
  let b1 = 0
  let b2 = 0
  for (let y = 0; y < l2; ++y, ++b2) {
    let it = b1;
    let updateValues2 = (v1, v2) => {
      return (s1[it] == s2[b2] ? [v2, v1] : [v2, 1 + Math.min(v1, v2)])
      // return (s1[it] == s2[b2] ? [v2, Math.min(v1, v2)] : [v2, Math.max(v1, v2)])
    };
    let updateValues3 = (v1, v2, v3) => {
      return (s1[it] == s2[b2] ? [v2, v1] : [v2, 1 + Math.min(v1, v2, v3)])
      // return (s1[it] == s2[b2] ? [v2, Math.min(v1, v2, v3)] : [v2, Math.max(v1, v2, v3)])
    };
    // let temp = y;
    let temp = 0;
    [temp, dp[0]] = updateValues2(temp, dp[0]);
    ++it
    for (let x = 1; x < l1; ++x, ++it) {
      [temp, dp[x]] = updateValues3(temp, dp[x], dp[x - 1]);
    }
    res = Math.min(res, dp[dp.length - 1])
  }
  return res
  // return dp[dp.length - 1];
}

function renderSearch(state) {
  let arr = [[ 
      "1. Для снижения значения точки безубыточности необходимо:",
      "1. **снизить годовые условно-постоянные расходы**",
      "2. снизить цену продукции",
      "3. увеличить удельные переменные расходы"
    ], [ 
      "2. Для снижения значения точки безубыточности необходимо: ",
      "1. повысить условно-постоянные расходы",
      "2. **увеличить цену продукции**",
      "3. увеличить удельные переменные расходы"
    ], [ 
      "3. Для снижения значения точки безубыточности необходимо:  ",
      "1. повысить условно-постоянные расходы",
      "2. снизить цену продукции",
      "3. **снизить удельные переменные расходы**"
    ], [ 
      "4. С ростом цены угол наклона линии выручки относительно оси абсцисс:",
      "1. **увеличится**",
      "2. уменьшится",
      "3. не изменится"
    ], [ 
      "5. С ростом годовой суммы условно-постоянных расходов:",
      "1. угол наклона линии себестоимости относительно оси абсцисс увеличится",
      "2. **линия себестоимости сдвинется вверх относительно оси абсцисс**",
      "3. линия себестоимости сдвинется вниз относительно оси абсцисс"
    ], [ 
      "6. Коэффициент операционного рычага показывает:",
      "1. на сколько процентов увеличится прибыль при снижении выручки на один процент",
      "2. на сколько процентов увеличится выручка при увеличении прибыли на один процент",
      "3. **на сколько процентов увеличится прибыль при увеличении выручки на один процент**"
    ], [ 
      "7. Порог рентабельности определяется как:",
      "1. отношение критического объема реализации в натуральном выражении к цене реализации продукции",
      "2. **произведение критического объема реализации в натуральном выражении на цену реализации продукции**",
      "3. сумма маржинальной прибыли и условно-постоянных расходов"
    ], [ 
      "8. Точка критического объема производства - это точка, в которой:",
      "1. **выручка от реализации продукции равна полной себестоимости**",
      "2. минимизируется полная себестоимость",
      "3. максимизируется прибыль"
    ], [ 
      "9. Порог рентабельности продукции (в натуральных единицах) ",
      "1. **постоянных затрат к маржинальному доходу на единицу продукции**",
      "2. выручки от реализации продукции к постоянным затратам",
      "3. фактического объема продаж к маржинальному доходу"
    ], [ 
      "10. Прямые удельные затраты в себестоимости единицы продукции при росте объема производства:",
      "1. увеличиваются",
      "2. **не изменяются**",
      "3. снижаются"
    ]
  ]  

  questions.replaceChildren()

  arr.sort((a, b) => {
    return levenshteinDistanceFuzzy(state.querry, a[0]) - levenshteinDistanceFuzzy(state.querry, b[0])
  }).forEach((value) => {
      const item = document.createElement("li")
      const question = document.createElement("h4")
      const answers = document.createElement("ul")
      const a1 = document.createElement("li")
      const a2 = document.createElement("li")
      const a3 = document.createElement("li")

      question.innerText = value[0]
      a1.innerText = value[1]
      a2.innerText = value[2]
      a3.innerText = value[3]

      const dist = document.createElement("li")
      dist.innerText = levenshteinDistanceFuzzy(state.querry, value[0])

      answers.appendChild(a1)
      answers.appendChild(a2)
      answers.appendChild(a3)
      answers.appendChild(dist)

      item.appendChild(question)
      item.appendChild(answers)

      questions.appendChild(item)
    })
}

app()