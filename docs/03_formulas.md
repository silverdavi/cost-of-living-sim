# 03 — Formulas & Reference Tables

Concrete numbers, for tax year **2025** (needs re-verification for 2026). Every number has a `SOURCE:` pointer so we can re-check.

---

## 1. Federal Poverty Level (48 contiguous states) — 2025

Source: HHS Poverty Guidelines, January 2025.

| Household size | Annual FPL | Monthly FPL |
|---|---|---|
| 1 | $15,650 | $1,304 |
| 2 | $21,150 | $1,762 |
| 3 | $26,650 | $2,221 |
| 4 | $32,150 | $2,679 |
| 5 | $37,650 | $3,137 |
| +1 | +$5,500 | +$458 |

Program thresholds:

| Program | Limit (% FPL) | For family of 4 |
|---|---|---|
| Medicaid adults (CO & RI expanded) | 138% | $44,367 |
| CHIP CO (CHP+) | 260% | $83,590 |
| CHIP RI (RIteCare) | 261% | $83,912 |
| SNAP gross | 130% | $41,795 |
| SNAP net | 100% | $32,150 |
| LIHEAP (typical) | 200% | $64,300 |
| ACA premium tax credit "cliff" (pre-IRA) | 400% | $128,600 |

## 2. Federal income tax — MFJ 2025

Standard deduction: **$30,000** (MFJ).

| Bracket | Rate |
|---|---|
| $0 – $23,850 | 10% |
| $23,851 – $96,950 | 12% |
| $96,951 – $206,700 | 22% |
| $206,701 – $394,600 | 24% |
| $394,601 – $501,050 | 32% |
| $501,051 – $751,600 | 35% |
| $751,601+ | 37% |

Applied to `taxable_income = AGI − $30,000` (MFJ, no itemizing assumed — renters).

Credits:

- **Child Tax Credit**: $2,000/qualifying-child under 17, up to **$1,700 refundable** per child (2025). Phaseout starts MFJ $400k — not relevant here.
- **EITC** MFJ with 2 kids 2025: max $7,152, fully phased out by ~$62,688.

## 3. FICA

- Social Security: 6.2% of wages up to $176,100 (2025).
- Medicare: 1.45%.
- Total employee FICA: **7.65%** of earned wages.
- **Not** applied to SSDI, SSI, interest/dividends.

## 4. Colorado state tax — 2025

- **Flat 4.40%** of federal taxable income (with CO-specific modifications).
- **Colorado EITC**: 50% of federal EITC (2025).
- **Colorado CTC**: up to $1,200/kid under 17 for low-/moderate-income (income-tiered; for household under ~$75k AGI).
- **TABOR refund**: ~$800/taxpayer in recent years — small bonus.

Denver local:

- **Occupational Privilege Tax ("head tax")**: **$5.75/month** per employee earning ≥ $500/mo in Denver.
- No Denver city income tax.

## 5. Rhode Island state tax — 2025

Progressive brackets (MFJ):

| Bracket | Rate |
|---|---|
| $0 – $79,900 | 3.75% |
| $79,901 – $181,650 | 4.75% |
| $181,651+ | 5.99% |

Standard deduction MFJ: ~$20,050 (2025, indexed).
Personal exemption: ~$5,050/person — so family of 4 ≈ $20,200.

- **RI EITC**: 16% of federal EITC, refundable.
- No local/city income tax.

## 6. ACA Premium Tax Credit — 2025

Under the Inflation Reduction Act (in effect through tax year 2025; **status for 2026 is uncertain — open question**):

Expected household contribution as % of MAGI:

| MAGI (% FPL) | Applicable % (max of band) |
|---|---|
| ≤ 150% | 0.00% |
| 150–200% | 0 → 2% |
| 200–250% | 2 → 4% |
| 250–300% | 4 → 6% |
| 300–400% | 6 → 8.5% |
| > 400% | 8.5% (cap, instead of pre-IRA cliff) |

```
expected_contribution = magi * applicable_pct
PTC = benchmark_silver_plan − expected_contribution    # floored at 0
```

Benchmark SLCSP (Second-Lowest-Cost Silver Plan) for family of 4 in 2025 (rough):

- Denver (zip 80203): ~$1,450/mo family of 4
- Providence (zip 02906): ~$1,900/mo family of 4

(Both vary hugely by age; need exact quotes via healthcare.gov window-shopping tool.)

## 7. SNAP formula (FY2025, Oct 2024 – Sep 2025)

Max monthly allotment (48 states):

| Household | Max |
|---|---|
| 3 | $768 |
| 4 | $975 |
| 5 | $1,158 |

Deductions (48 states):

- Standard deduction family of 4+: $217/mo.
- Earned income deduction: 20% of earned income.
- Excess shelter deduction: shelter costs − 50% of adjusted income, **capped at $712/mo** — **UNCAPPED if elderly or disabled** (SSDI/SSI in household).
- Dependent care deduction: actual costs for childcare that enables work.

```
adjusted_income = gross − 0.20*earned − $217 − dependent_care_ded
excess_shelter  = max(0, (rent+utilities) − 0.5*adjusted_income)
shelter_ded     = min(excess_shelter, $712) unless disabled
net_income      = adjusted_income − shelter_ded
eligible        = net_income ≤ 100% FPL (monthly) AND gross ≤ 130% FPL
benefit         = max(0, max_allotment − 0.30 * net_income)
```

## 8. SSDI & SSI quick facts — 2025

- Average SSDI benefit: ~$1,580/mo (varies widely).
- Max SSDI benefit: ~$4,018/mo (high earner, retires early).
- **SGA (Substantial Gainful Activity)**: $1,620/mo non-blind, $2,700/mo blind.
- Medicare eligibility: 24 months after SSDI start (not months on disability).
- SSI federal max: $967/mo single, $1,450/mo couple (2025).
- SSDI taxation: up to 85% taxable if combined income > $32k MFJ.

## 9. Housing — ballpark 2025

Source: HUD FMR + Zillow median.

| Metric | Denver, CO | Providence, RI |
|---|---|---|
| 2BR rent median | $2,150 | $1,900 |
| 3BR rent median | $2,750 | $2,400 |
| HUD FMR 3BR | $2,651 | $2,310 |
| Rent burden at this family's MAGI | 30–45% | 28–40% |

Utilities (family of 4, 3BR apartment, yearly):

| | Denver | Providence |
|---|---|---|
| Electric | $900 | $1,400 |
| Gas (heat) | $900 | $1,800 |
| Water/sewer | $600 | $700 |
| Internet | $900 | $840 |

## 10. Jewish day school tuition — ballpark 2025–26

| School | City | Grade K sticker | Grade 5 sticker |
|---|---|---|---|
| Denver Jewish Day School (DJDS) | Denver | ~$22,500 | ~$28,000 |
| Herzl / RMHA (Rocky Mountain Hebrew Academy) | Denver | ~$18,000 | ~$22,000 |
| JCDSRI (Jewish Community Day School of RI) | Providence | ~$17,500 | ~$22,000 |
| Providence Hebrew Day School | Providence | ~$15,500 | ~$18,500 |

**Financial aid** is available at all of these — most serve families where >50% receive aid. No public formula; use MAGI heuristic from `02_relationships.md §6`.

## 11. Kosher grocery premium

- Generic: meat ~2–3× conventional; dairy ~1.3×; pantry parity.
- Family-of-4 USDA moderate plan: ~$1,300/mo base → with full kosher: $1,700–2,000/mo.
- Denver: 1 major kosher butcher (East Side Kosher Deli); limited selection.
- Providence: proximity to Boston (Butcherie, Trader Joe's kosher) helps a lot.

## 12. Car insurance — bracing number

RI consistently in US top 5 most expensive. Family-of-4, 2 cars, clean record:

- Denver: $1,800 – $2,400/yr
- Providence: $2,800 – $3,800/yr
