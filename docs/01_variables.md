# 01 — Variables

Three kinds:

- **INPUT** — user sets it (slider / dropdown / checkbox).
- **DERIVED** — computed from inputs + reference tables.
- **OUTPUT** — headline numbers the user cares about.

Each variable has a stable `id` we'll reuse in code.

---

## A. Household & location (INPUT)

| id | type | options / range | notes |
|---|---|---|---|
| `location` | enum | `denver_co` \| `providence_ri` | drives tax, rent, utilities, schools |
| `num_adults` | int | 2 | fixed for this scenario |
| `num_kids` | int | 2 | fixed |
| `kid_a_age` | int | 5–10 | older child |
| `kid_b_age` | int | 5–10 | younger child |
| `filing_status` | enum | `married_filing_jointly` | fixed |
| `keeps_kosher` | bool | true/false | affects grocery cost |
| `religious_observance` | enum | `shomer_shabbat` \| `traditional` \| `secular` | affects camp, transport-on-shabbat, etc. |

## B. Parent A — earned income (INPUT)

| id | type | range | notes |
|---|---|---|---|
| `parent_a_employed` | bool | true | assumed employed |
| `parent_a_job_type` | enum | `local_newspaper` \| `nonprofit_communications` \| `community_org` \| `freelance_journalism` | affects salary band & benefits |
| `parent_a_gross_salary` | int ($) | 30k–85k | yearly pre-tax W-2 |
| `parent_a_has_employer_health` | bool | true/false | if false → ACA marketplace |
| `parent_a_employer_health_premium_employee` | int ($/yr) | 0–4k | employee share only |
| `parent_a_401k_pct` | float | 0–0.15 | pre-tax retirement contribution |

## C. Parent B — income OR disability (INPUT, mutually exclusive modes)

| id | type | options | notes |
|---|---|---|---|
| `parent_b_mode` | enum | `employed` \| `ssdi` \| `ssi` \| `not_working_no_aid` | drives the rest |
| `parent_b_gross_salary` | int ($) | 0–60k | if `employed` |
| `parent_b_ssdi_monthly` | int ($/mo) | 0–2,500 | if `ssdi`; based on past work credits |
| `parent_b_ssi_monthly` | int ($/mo) | 0–967 | if `ssi`; 2025 federal max $967 single |
| `parent_b_on_medicare` | bool | derived | true if on SSDI ≥24 months |
| `parent_b_sga_compliant` | bool | derived | earned income must be < SGA ($1,620/mo non-blind, 2025) to keep SSDI |

## D. Housing (INPUT with location-dependent defaults)

| id | type | range | notes |
|---|---|---|---|
| `bedrooms` | int | 2–3 | 3BR likely needed |
| `monthly_rent` | int ($) | 1,800–3,500 | default = median 3BR in city |
| `renters_insurance_yearly` | int ($) | 150–300 | |
| `has_section8_voucher` | bool | false | usually long waitlist; model as option |
| `utilities_electric_monthly` | int ($) | 60–200 | climate-dependent |
| `utilities_gas_heat_monthly` | int ($) | 40–300 | Providence winter much higher |
| `utilities_water_sewer_monthly` | int ($) | 30–100 | |
| `internet_monthly` | int ($) | 50–100 | |

## E. Kid A — Jewish day school (INPUT)

| id | type | range | notes |
|---|---|---|---|
| `kid_a_school_type` | enum | `jewish_day_school` | fixed for this scenario |
| `kid_a_sticker_tuition` | int ($) | 18k–30k | depends on city/school |
| `kid_a_grant_pct` | float | 0–0.8 | financial-aid % off; **depends on AGI & assets** |
| `kid_a_net_tuition` | int ($) | derived | `sticker * (1 - grant_pct)` |
| `kid_a_fees_extra` | int ($) | 500–2,500 | registration, books, building fund, lunch |
| `kid_a_aftercare_monthly` | int ($) | 0–600 | |
| `kid_a_summer_camp` | int ($) | 0–8,000 | often needed — day schools let out early summer |

## F. Kid B — special-needs schooling (INPUT)

| id | type | options | notes |
|---|---|---|---|
| `kid_b_placement` | enum | `public_with_iep` \| `public_special_ed_program` \| `private_special_ed_district_funded` \| `private_special_ed_self_pay` \| `jewish_day_school_with_support` | |
| `kid_b_tuition_out_of_pocket` | int ($) | 0–60k | 0 if public or district-funded; else high |
| `kid_b_private_therapy_monthly` | int ($) | 0–2,000 | OT/ST/ABA/counseling not covered by school |
| `kid_b_has_iep` | bool | true/false | ensures school services |
| `kid_b_has_medicaid_waiver` | bool | true/false | Katie Beckett / TEFRA (CO & RI both offer) — decouples Medicaid from parent income |

## G. Health insurance (INPUT + DERIVED)

| id | type | notes |
|---|---|---|
| `health_coverage_strategy` | enum: `employer_family` \| `employer_single_plus_marketplace_kids` \| `marketplace_full_family` \| `medicaid_chip_full` \| `mixed` | |
| `aca_subsidy_eligible` | bool (derived) | true if MAGI 100–400% FPL (or any if IRA premium cap extension still in force) |
| `aca_premium_after_subsidy_monthly` | $ (derived) | capped as % of MAGI per ACA 2025 rules |
| `chip_eligible_kids` | bool (derived) | CO CHP+ ≤260% FPL, RI RIteCare ≤261% FPL |
| `medicaid_eligible_parents` | bool (derived) | ≤138% FPL (both states expanded) |
| `out_of_pocket_max_yearly` | $ | per plan, usually $9,200 single / $18,400 family 2025 cap |
| `expected_medical_usage` | enum: `low` \| `typical_family` \| `high_with_special_needs` | drives copays & deductible spend |

## H. Food (DERIVED, with kosher multiplier)

| id | type | notes |
|---|---|---|
| `food_cost_monthly_base` | $ (derived) | USDA "moderate-cost" food plan by family size & ages |
| `kosher_multiplier` | float | ~1.2 (Providence, near Boston) – 1.4 (Denver) |
| `dining_out_monthly` | $ (input) | |

## I. Transportation (INPUT, location-sensitive)

| id | type | notes |
|---|---|---|
| `num_cars` | int | 1 or 2 |
| `car_payment_monthly` | $ | 0 if owned outright |
| `car_insurance_yearly` | $ | **RI much higher than CO** (RI among top 5 US) |
| `gas_monthly` | $ | Denver usually more driving |
| `car_maintenance_yearly` | $ | |
| `transit_pass_monthly` | $ | RTD (Denver) vs RIPTA (Providence) |

## J. Other recurring

| id | type | notes |
|---|---|---|
| `childcare_backup_monthly` | $ | snow days, sick kid, Jewish holidays |
| `synagogue_membership_yearly` | $ | 1,200–3,500; usually sliding-scale |
| `clothing_yearly` | $ | |
| `phone_monthly` | $ | |
| `streaming_subscriptions_monthly` | $ | |
| `kids_activities_monthly` | $ | lessons, sports |
| `travel_yearly` | $ | visiting family, Pesach etc. |

## K. Taxes (DERIVED)

| id | notes |
|---|---|
| `federal_income_tax_yearly` | MFJ brackets 2025, standard deduction $30,000, CTC $2,000/kid (phase-out > $400k MFJ — not relevant here) |
| `fica_yearly` | 7.65% on **earned** wages (not SSDI/SSI) |
| `state_income_tax_yearly` | CO flat 4.4%; RI progressive 3.75/4.75/5.99% |
| `local_tax_yearly` | Denver OPT $5.75/mo/employee; RI none |
| `eitc_federal` | income- & kids-dependent, usually 0 at these salary bands but check |
| `eitc_state` | CO 50% of federal (2025); RI 16% of federal |
| `ctc_federal` | $2,000/kid, up to $1,700 refundable (2025) |

## L. Federal/state assistance (DERIVED — eligibility gates)

| id | notes |
|---|---|
| `fpl_household` | HHS 2025 table, household of 4 = $32,150 |
| `household_magi` | modified AGI used for most programs |
| `household_magi_pct_fpl` | `magi / fpl_household` |
| `snap_eligible` | gross income ≤130% FPL (~$41,795 for 4) AND net ≤100% AND assets limit |
| `snap_benefit_monthly` | max $975 for 4 (2025); phases out |
| `liheap_eligible` | varies; usually ≤150% or 200% FPL; CO & RI both run |
| `wic_eligible` | only if kid under 5 — probably not this family |
| `tanf_eligible` | very low income only |
| `child_care_subsidy` | CCAP in CO / CCAP in RI; ≤185% SMI typically |

## M. OUTPUTS (the headline numbers)

| id | description |
|---|---|
| `gross_income_yearly` | salaries + SSDI/SSI |
| `net_income_after_tax_yearly` | gross − taxes + refundable credits |
| `total_yearly_expenses` | rent + utils + food + school + medical + transport + other |
| `assistance_value_yearly` | $ value of SNAP, ACA subsidy, Medicaid-vs-market premium, tuition grant, LIHEAP |
| `net_surplus_or_deficit_yearly` | net income − expenses (+ assistance already netted into relevant lines) |
| `monthly_cashflow` | surplus / 12 |
| `feasibility_flag` | `green` (surplus > 2 mo reserve) / `yellow` (0–2 mo) / `red` (deficit) |
| `effective_marginal_tax_rate` | next $1 of earned income → how much is lost to tax + benefit phase-out (the "cliff" metric) |
