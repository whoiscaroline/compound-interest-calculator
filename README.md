# ↗ Return Lab

### Give time a number.

A lightweight investment scenario playground: explore compound growth, recurring contributions, and inflation without opening a spreadsheet.

**Browser demo · Python CLI · Zero runtime dependencies · No accounts or analytics**

## Try it

Download the project and open **index.html** in a browser. For scenario links and the best clipboard support, serve it locally:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. You can also host the static files with GitHub Pages.

## What you can explore

- Adjust your starting balance, monthly contributions, time horizon, return, and inflation.
- Compare your scenario with returns two percentage points above and below it.
- Toggle between future dollars and today's purchasing power.
- Start with student, steady-builder, and early-start presets.
- Export yearly balances and assumptions as CSV.
- Share a scenario through its URL parameters.
- Switch between dark and light themes; use it on mobile or desktop.

## Python version

Requires Python 3. No package installation needed.

```sh
python3 calculator.py --initial 1000 --monthly 300 --years 20 --rate 7 --inflation 2.5
python3 calculator.py --monthly 500 --csv projection.csv
```

Import it into a notebook:

```python
from calculator import project
rows = project(initial=1000, monthly=300, years=20, rate=7, inflation=2.5)
print(rows[-1])
```

## The math

Annual return is an **effective annual rate**, converted to monthly:

```text
monthly_rate = (1 + annual_return / 100)^(1/12) - 1
balance_next_month = balance * (1 + monthly_rate) + monthly_contribution
real_balance = nominal_balance / (1 + inflation / 100)^years
```

Contributions arrive at month-end and stay fixed in nominal dollars. Under today's-dollar mode, the chart also discounts cumulative contributions to the selected year's purchasing-power basis.

The outer curves are **sensitivity scenarios, not confidence intervals**. Returns and inflation are constant; taxes, fees, withdrawals, and market volatility are excluded. This is an educational calculator, not personalized investment advice.

## Check the model

```sh
python3 -m unittest test_calculator.py
node test_model.js
```

Checks cover the annuity closed form, zero returns, inflation, negative returns, and invalid inputs. Python and JavaScript implement the same monthly recurrence.

## Project map

| File | Purpose |
|---|---|
| `index.html` | Accessible interface and explanatory copy |
| `style.css` | Responsive themes |
| `app.js` | Chart, controls, CSV, and scenario links |
| `model.js` | Browser and Node calculation engine |
| `calculator.py` | Matching Python engine and CLI |

All calculations happen in the browser. Google Fonts is the only external resource; system fonts are used if it is unavailable. Scenario links encode the amounts you choose, so share only illustrative values you are comfortable making public.

## Ideas for contributions

Useful next improvements: optional annual contribution increases, fees, accessible point-by-point chart inspection, or comparisons with a delayed starting date. Include a worked example and a math check when proposing calculation changes.

Found a bug? Open an issue with the inputs, expected result, and actual result. If you find the project useful, a star helps other people discover it.
