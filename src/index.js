import solve from './solve.js'

const solutionEl = document.getElementById("solution")
const questionsEl = document.getElementById("questions")
const searchEl = document.getElementById("search")
const searchForm = document.getElementById("search-form")
const formEl = document.getElementById("form")
const themeToggle = document.getElementById("theme-toggle")

const showMore = document.createElement('button')
showMore.classList.add('show-more')
showMore.textContent = 'Показать ещё'

const initQuestions = []

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

function hasUpperCase(str) {
  return str.split('').some(ch => /^[a-zA-Zа-яА-Я]$/.test(ch) && ch === ch.toUpperCase())
}

function renderQuestion({ question, answers }, state) {
  const item = document.createElement("li")
  item.classList.add("question")

  const header = document.createElement("h4")
  header.textContent = question

  const list = document.createElement("ul")
  list.classList.add("answers")

  const items = answers.map(({ answer, correct }) => {
    const li = document.createElement("li")
    li.textContent = answer
    li.classList.add('answer')
    if (correct) li.classList.add('correct')
    return li
  })

  list.append(...items)

  // const dist = document.createElement('li')
  // dist.textContent = dldf(state.query.trim(), state.uppercase ? question : question.toLowerCase())

  // list.appendChild(dist)

  item.appendChild(header)
  item.appendChild(list)

  questionsEl.appendChild(item)
}

function render(state) {
  console.log(state)

  questionsEl.replaceChildren()

  const questions = state.limit === 0 ? state.questions : state.questions.slice(0, state.limit)

  questions
    .forEach((q) => renderQuestion(q, state))

  if (state.limit !== 0) {
    questionsEl.appendChild(showMore)
  }

  solutionEl.replaceChildren()

  if (!state.valid) {
    const placeholder = document.createElement('span')
    placeholder.classList.add('placeholder')
    placeholder.textContent = "Заполните все поля формы"
    solutionEl.appendChild(placeholder)
    return
  }

  if (Object.values(state.solution).some((v) => Array.isArray(v) ? v.some(isInvalid) : isInvalid(v))) {
    const placeholder = document.createElement('span')
    placeholder.classList.add('placeholder')
    placeholder.textContent = "Введены некорректные данные"
    solutionEl.appendChild(placeholder)
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

      solutionEl.appendChild(item)
    })
}

function app() {
  const state = {
    query: "",
    uppercase: false,
    questions: [],
    valid: false,
    solution: {},
    limit: 0,
  }

  const handleFormInput = () => {
    const input = parseForm(formEl)
    const valid = form.checkValidity() && !!input
    state.valid = valid
    if (valid) {
      state.solution = solve(input)
    }
    render(state)
  }

  formEl.addEventListener("input", handleFormInput)

  const handleSearchInput = () => {
    const { value } = searchEl
    state.query = value
    state.uppercase = hasUpperCase(value)
    if (value === '') {
      state.limit = 0
      state.questions = initQuestions.slice()
    } else {
      state.limit = 3
      state.questions
        .sort((a, b) =>
          dldf(state.query.trim(), state.uppercase ? a.question : a.question.toLowerCase())
          - dldf(state.query.trim(), state.uppercase ? b.question : b.question.toLowerCase()))
    }
    render(state)
  }

  searchEl.addEventListener("input", handleSearchInput)

  const handleReset = () => {
    console.log('reset')
    state.questions = initQuestions.slice()
    state.query = ''
    state.limit = 0
    state.uppercase = false
    render(state)
  }

  searchForm.addEventListener('reset', handleReset)

  const handleShowMore = () => {
    state.limit = 0
    render(state)
  }

  showMore.addEventListener('click', handleShowMore)

  const toggleTheme = () => {
    document.body.classList.toggle('night')
  }

  themeToggle.addEventListener('click', toggleTheme)

  fetch("./questions.json")
    .then(res => res.json())
    .then(data => {
      initQuestions.push(...data)
      state.questions = data.slice()
    }).then(() => {
      handleFormInput()
      handleSearchInput()
    })
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

/**
 * Levenshtein distance (fuzzy)
 *  @param {string} s1 source string
 *  @param {string} s2 target string
 *  @return {number} distance between strings
 */
function ldf(s1, s2) {
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
    const updateValues = (v1, v2, ...rest) => (s1[it] == s2[b2]
      ? [v2, v1]
      : [v2, 1 + Math.min(v1, v2, ...rest)])
    let temp = 0;
    [temp, dp[0]] = updateValues(temp, dp[0]);
    ++it
    for (let x = 1; x < l1; ++x, ++it) {
      [temp, dp[x]] = updateValues(temp, dp[x], dp[x - 1]);
    }
    res = Math.min(res, dp[dp.length - 1])
  }
  return res
}

/**
 * Damerau-Levenshtein distance (fuzzy)
 *  @param {string} query query string
 *  @param {string} text  text string
 *  @return {number} distance between strings
 */
function dldf(query, text) {
  let dp = []
  for (let i = 0; i <= text.length; ++i) {
    let row = []
    for (let j = 0; j <= query.length; ++j) {
      row.push(0)
    }
    dp.push(row)
  }
  let res = Math.max(text.length, query.length)
  for (let i = 0; i <= text.length; ++i) {
    for (let j = 0; j <= query.length; ++j) {
      if (Math.min(i, j) == 0) {
        dp[i][j] = (j == 0 ? 0 : j)
      } else {
        let c = 1
        if (text[i - 1] === query[j - 1]) {
          c = 0
        }
        if (
          i > 1 && j > 1 &&
          text[i - 1] == query[j - 2] &&
          text[i - 2] == query[j - 1]
        ) {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + c,
            dp[i - 2][j - 2] + 1
          )
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + c
          )
        }
      }
    }
    res = Math.min(res, dp[i][query.length])
  }
  return res
}

app()