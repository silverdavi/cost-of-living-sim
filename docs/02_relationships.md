# 02 — Relationships

How variables depend on each other. Read this top-to-bottom — each section depends on the ones above.

---

## 1. Income aggregation

```
earned_income_yearly = parent_a_gross_salary
                     + (parent_b_gross_salary if parent_b_mode == employed else 0)

unearned_income_yearly = (parent_b_ssdi_monthly * 12) if parent_b_mode == ssdi else 0
                       + (parent_b_ssi_monthly  * 12) if parent_b_mode == ssi  else 0

gross_income_yearly = earned_income_yearly + unearned_income_yearly
```

Key rules:

- **SSDI** is taxable federally if household combined income > $32k MFJ (up to 85% of SSDI taxable). Both CO and RI follow federal treatment with some state quirks.
- **SSI** is **not** taxable and not counted toward ACA MAGI.
- **SGA rule**: if `parent_b_mode == ssdi` and `parent_b_gross_salary/12 > SGA_LIMIT` ($1,620/mo 2025, non-blind), SSDI is suspended. Model this as a constraint.

## 2. MAGI (Modified Adjusted Gross Income)

```
magi = gross_income_yearly
     − parent_a_401k_pct * parent_a_gross_salary    # pre-tax retirement
     − 0                                             # no HSA assumed yet
     + (taxable portion of SSDI)                     # if applicable
```

MAGI is the single most important derived number because it gates:

- ACA premium tax credit
- Medicaid / CHIP eligibility
- SNAP net income test (partially)
- Jewish day school grant formula (proxy for "ability to pay")
- EITC

## 3. Taxes

Order of operations:

```
taxable_income_federal = AGI − standard_deduction($30,000 MFJ 2025)
federal_income_tax = apply_brackets_MFJ_2025(taxable_income_federal)
federal_income_tax -= ctc_per_kid * num_kids       # $2,000 * 2 = $4,000
federal_income_tax -= eitc_federal                  # if any

fica = 0.0765 * earned_income_yearly                # employee share only

state_income_tax:
  if location == denver_co: 0.044 * taxable_income_state_CO
  if location == providence_ri: apply_brackets_RI_2025(taxable_income_state_RI)

local_tax:
  if location == denver_co: 5.75 * 12 * num_earning_adults   # Denver OPT
  else: 0
```

Refundable credits (CTC refundable portion, EITC) can exceed tax owed → negative tax = refund.

## 4. ACA health insurance (if no employer coverage)

This is a **strong coupling** between salary and medical cost.

```
fpl_household = FPL_TABLE[household_size=4] = $32,150 (2025, 48 states & DC)
magi_pct_fpl = magi / fpl_household

# 2025 applicable percentages (IRA extension — verify for 2026):
if magi_pct_fpl <= 1.50:  applicable_pct = 0.00
elif <= 2.00:             applicable_pct = 0.00
elif <= 2.50:             applicable_pct = 0.02   # linear in reality
elif <= 3.00:             applicable_pct = 0.04
elif <= 4.00:             applicable_pct = 0.06
else:                     applicable_pct = 0.085  # IRA cap, still in force through 2025

expected_contribution_yearly = magi * applicable_pct
benchmark_silver_plan_yearly = BENCHMARK_TABLE[location, family_size, ages]
premium_tax_credit = max(0, benchmark_silver_plan_yearly − expected_contribution_yearly)

aca_net_premium_yearly = chosen_plan_premium_yearly − premium_tax_credit
```

Benchmarks vary a lot: Denver silver benchmark for family of 4 is typically lower than Providence's.

## 5. Medicaid / CHIP override

```
if magi_pct_fpl <= 1.38:  parents_on_medicaid = true
if magi_pct_fpl <= 2.60 (CO CHP+) or 2.61 (RI RIteCare):  kids_on_chip = true

# Katie Beckett / TEFRA waiver — Kid B can get Medicaid on disability alone,
# regardless of parent income. Both states offer it (CO = HCBS waiver, RI = Katie Beckett).
if kid_b_has_medicaid_waiver:  kid_b_on_medicaid = true
```

Medicaid coverage → `aca_net_premium_yearly` drops to zero for that person, and copays disappear.

## 6. Jewish day-school grant (Kid A)

There is no public formula, but day schools generally use a modified **NAIS SSS** (School and Student Services) calculation or similar:

```
expected_family_contribution (EFC) ≈ f(magi, assets, num_dependents_in_tuition)
grant_amount = max(0, sticker_tuition − EFC_per_child)
grant_pct = grant_amount / sticker_tuition
```

Heuristic bands to expose as a slider with "realistic range" for MAGI:

| MAGI                | likely grant % |
|---------------------|----------------|
| < $60k              | 60–80%         |
| $60–90k             | 40–60%         |
| $90–130k            | 20–40%         |
| $130–180k           | 0–20%          |
| > $180k             | 0%             |

Input this as `kid_a_grant_pct` with a "suggested default from MAGI" button.

## 7. SNAP

```
gross_income_monthly = gross_income_yearly / 12
gross_income_test = gross_income_monthly <= 1.30 * monthly_FPL

# deductions:
earned_income_deduction = 0.20 * earned_income_monthly
standard_deduction_4plus = $217    # 2025
shelter_deduction = max(0, (rent + utils_est) − 0.5 * (gross_income − earned_income_deduction − std_ded))
excess_shelter_cap = $712         # unless elderly/disabled
if parent_b_mode == ssdi or ssi: excess_shelter_cap = unlimited

net_income = gross_income − all_deductions
net_income_test = net_income <= monthly_FPL

benefit = max_allotment_family_of_4($975 in 2025) − 0.30 * net_income
```

**Very important**: if Parent B is on SSDI/SSI, SNAP shelter deduction becomes uncapped → often unlocks SNAP for this family even with decent earned income.

## 8. LIHEAP

Varies state-by-state but roughly: eligible if ≤200% FPL. Benefit is a one-time-per-season $300–1,000 crediting to utility bill. Providence benefit tends to be larger (colder winter).

## 9. Expenses (location-tied)

```
rent = f(location, bedrooms)                    # use HUD Fair Market Rent or Zillow median
utilities = f(location, climate_month, sq_ft)
food_base = USDA_food_plan(num_kids, ages, adults, plan_tier)
food = food_base * (kosher_multiplier if keeps_kosher else 1.0)
transport = f(location, num_cars)
```

## 10. The master equation

```
yearly_net_cash =
      gross_income_yearly
    − federal_income_tax_yearly   (can be negative → refund)
    − fica_yearly
    − state_income_tax_yearly
    − local_tax_yearly
    − rent_yearly
    − utilities_yearly
    − food_yearly
    − kid_a_net_tuition_yearly
    − kid_a_fees_extra
    − kid_a_summer_camp
    − kid_a_aftercare_yearly
    − kid_b_tuition_out_of_pocket
    − kid_b_private_therapy_yearly
    − aca_net_premium_yearly          (OR employer premium)
    − expected_out_of_pocket_medical
    − transport_yearly
    − other_recurring_yearly
    + snap_benefit_yearly
    + liheap_benefit_yearly
    + state_eitc
    + (refundable credits already netted into federal_income_tax)
```

`feasibility_flag`:

- `green` if `yearly_net_cash >= 2 * monthly_expenses` (2-month cushion built)
- `yellow` if `0 <= yearly_net_cash < 2 * monthly_expenses`
- `red` if `yearly_net_cash < 0`

## 11. Cliff / marginal-rate analyzer

One of the most valuable outputs: the **effective marginal tax rate on the next dollar of Parent B's earned income**, including loss of SNAP, loss of CHIP, loss of ACA subsidy, loss of day-school grant, loss of SSDI (SGA cliff). This is often **> 100%** in certain income bands, which is the whole reason "can we afford to have Parent B work?" is a real question.

Compute by running the whole pipeline at `magi` and `magi + $1,000` and taking the difference.

---

## Dependency categories (cheat sheet)

- **Location-only** → rent, utilities (heating split), state tax, car insurance, transit, kosher multiplier.
- **Income-only** → federal tax, FICA, ACA subsidy, Medicaid/CHIP eligibility, SNAP, grant %.
- **Income × location** → state tax (different brackets), state EITC, CHIP thresholds (different).
- **Disability status** → Medicare after 24mo, SGA limit, SNAP shelter cap removal, Katie Beckett path for Kid B independent of parent income.
- **School choice** → huge direct cost (Kid A tuition), and indirect (Kid B therapy if public school doesn't provide enough).
