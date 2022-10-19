const form = document.getElementById("form")
const output = document.getElementById("output")

function renderScalar(label, value) {
    const item = document.createElement("li")
    const heading = document.createElement("h4")
    const span = document.createElement("span")
    
    heading.innerText = label
    span.innerText = value.toFixed(3)

    item.appendChild(heading)
    item.appendChild(span)

    output.appendChild(item)
}

function renderVector(label, values) {
    const item = document.createElement("li")
    const heading = document.createElement("h4")
    const span = document.createElement("span")
    
    heading.innerText = label
    span.innerText = values.map(v => v.toFixed(3)).join('\n')

    item.appendChild(heading)
    item.appendChild(span)

    output.appendChild(item)
}

function render(state) {
    Object.entries(state.output)
    .forEach(([key, value]) => {
        if (Array.isArray(value)) {
            renderVector(key, value)
        } else {
            renderScalar(key, value)
        }
    })
    // output.innerText = Object.entries(state.output).join("\n")
}

function app() {
    const state = {
        output: {},
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const { price_unit, cost_unit, output_nat_year, varCost_part } = parseForm(form)

        const cost_year = Cost_year(cost_unit, output_nat_year);
        const fixedCost_year = FixedCost_year(cost_year, varCost_part);
        const varCost_unit = VarCost_unit(cost_unit, varCost_part);
        const output_val_year = Output_val_year(price_unit, output_nat_year);
        const profit_year = Profit_year(output_val_year, cost_year);
        const outputCrit_nat_year = OutputCrit_nat_year(fixedCost_year, price_unit, varCost_unit);
        const profitMarg = ProfitMarg(fixedCost_year, profit_year);
        const coverRatio = CoverRatio(profitMarg, output_val_year);
        const outputCrit_val_year = OutputCrit_val_year(outputCrit_nat_year, price_unit);
        const fsStock_nat = FSStock_nat(output_nat_year, outputCrit_nat_year);
        const fsStock_val = FSStock_val(output_val_year, outputCrit_val_year);
        const fsStock_prcntg = FSStock_prcntg(output_nat_year, outputCrit_nat_year);
        const opleverRatio = OpLeverRatio(profitMarg, profit_year);

        state.output = {
            step3: cost_year / 1e9,
            step4: fixedCost_year / 1e9,
            step5: varCost_unit,
            step6: output_val_year / 1e9,
            step7: profit_year / 1e9,
            step8: outputCrit_nat_year / 1e3,
            step9: [
                profitMarg / 1e9,
                coverRatio,
                outputCrit_val_year / 1e9,
                fsStock_nat / 1e3,
                fsStock_val / 1e9,
                fsStock_prcntg * 100,
                opleverRatio,
                opleverRatio * 0.1 * 100,
            ],
            step10: (() => {
                const a = Output_val_year(price_unit, 6e5);
                const b = Cost_year(cost_year, varCost_part, output_nat_year, 6e5);
                return [
                    a / 1e9,
                    b / 1e9,
                    Profit_year(a, b) / 1e9
                ];
            })(),
            step11: [
                FSStock_nat(6e5, outputCrit_nat_year) / 1e3,
                FSStock_val(Output_val_year(price_unit, 6e5), outputCrit_val_year) / 1e9,
                FSStock_prcntg(6e5, outputCrit_nat_year) * 100
            ],
            step12: (() => {
                const a = Cost_year(cost_year, varCost_part, output_nat_year, 6e5)
                const b = a + profit_year
                return [
                    b / 1e9,
                    Price_unit(b, 6e5),
                    ProfitabilityOfProduction(profit_year, a) * 100
                ]
            })(),
            step13: (() => {
                const a = output_nat_year * 0.75;
                const b = ProfitabilityOfSales(profit_year, output_val_year);
                const c = Cost_year(cost_year, varCost_part, output_nat_year, a);
                const d = c / (1.0 - b);
                return [
                    a / 1e3,
                    b * 100,
                    c / 1e9,
                    d / 1e9,
                    Price_unit(d, a)
                ];
            })(),
            step14: (() => {
                const a = Cost_year(cost_year, varCost_part, output_nat_year, 6e5);
                const b = 0.25 * a;
                const c = a + b;
                return [
                    a / 1e9,
                    b / 1e9,
                    c / 1e9,
                    Price_unit(c, 6e5)
                ];
            })(),
        }

        render(state)
    })
}

function parseForm(form) {
    const input = [...new FormData(form)]
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    const { price, cost, volume, share } = input
    return {
        price_unit: parseFloat(price),
        cost_unit: parseFloat(cost),
        output_nat_year: parseFloat(volume) * 1000,
        varCost_part: parseFloat(share) / 100
    }
}

function Cost_year(c_y, vC_p, o_n_y, o_n_y_new) {
    if (typeof o_n_y == 'undefined') {
        const c_u = c_y
        o_n_y = vC_p
        return c_u * o_n_y;
    }
    return c_y * ((1.0 - vC_p) + ((vC_p * o_n_y_new) / o_n_y));
}

function FixedCost_year(c_y, vC_p) {
    return c_y * (1.0 - vC_p);
}

function VarCost_unit(c_u, vC_p) {
    return c_u * vC_p;
}

function Output_val_year(p_u, o_n_y) {
    return p_u * o_n_y;
}

function Profit_year(o_v_y, c_y) {
    return o_v_y - c_y;
}

function OutputCrit_nat_year(fC_y, p_u, vC_u) {
    return fC_y / (p_u - vC_u);
}

function ProfitMarg(fC_y, p_y) {
    return fC_y + p_y;
}

function CoverRatio(pM, o_v_y) {
    return pM / o_v_y;
}

function OutputCrit_val_year(oC_n_y, p_u) {
    return oC_n_y * p_u;
}

function FSStock_nat(o_n_y, oC_n_y) {
    return o_n_y - oC_n_y;
}

function FSStock_val(o_v_y, oC_v_y) {
    return o_v_y - oC_v_y;
}

function FSStock_prcntg(o_n_y, oC_n_y) {
    return (o_n_y - oC_n_y) / o_n_y;
}

function OpLeverRatio(pM, p_y) {
    return pM / p_y;
}

function Price_unit(o_v_y, o_n_y) {
    return o_v_y / o_n_y;
}

function ProfitabilityOfProduction(p_y, c_y) {
    return p_y / c_y;
}

function ProfitabilityOfSales(p_y, o_v_y) {
    return p_y / o_v_y;
}

app()
