# 04 — Data Sources

Where to fetch, verify, and (ideally) scrape each number. Prefer primary sources.

## Federal

| Data | Source | URL | Update cadence |
|---|---|---|---|
| FPL | HHS ASPE | aspe.hhs.gov/poverty-guidelines | Jan each year |
| Federal tax brackets / std deduction | IRS Rev. Proc. annual | irs.gov | Nov for next year |
| CTC / EITC | IRS pubs 972, 596 | irs.gov | annual |
| FICA / SS wage base | SSA fact sheet | ssa.gov | Oct each year |
| SSDI/SSI amounts | SSA COLA fact sheet | ssa.gov/cola | Oct |
| SGA limit | SSA | ssa.gov | Oct |
| SNAP max allotment | USDA FNS | fns.usda.gov/snap/allotment/COLA | Oct |
| SNAP deductions | USDA FNS | fns.usda.gov | Oct |
| ACA FPL / applicable % | IRS Rev. Proc. 2024-35 (2025 tax year) | irs.gov | annual |
| ACA benchmark plans (SLCSP) | healthcare.gov window-shopping | healthcare.gov/see-plans/ | open enrollment |

## Colorado

| Data | Source |
|---|---|
| CO income tax rate & forms | tax.colorado.gov |
| CO EITC / CTC | cdphe.colorado.gov + leg.colorado.gov |
| Denver OPT | denvergov.org → Treasury Division |
| CO Medicaid (Health First) | healthfirstcolorado.com |
| CO CHIP (CHP+) | chpluscolorado.com |
| CO LIHEAP | cdhs.colorado.gov/LEAP |
| CO Child Care Assistance (CCCAP) | cdhs.colorado.gov |

## Rhode Island

| Data | Source |
|---|---|
| RI income tax brackets | tax.ri.gov |
| RI EITC (16%) | tax.ri.gov publications |
| RI Medicaid / RIteCare | healthsourceri.com + eohhs.ri.gov |
| RI LIHEAP | dhs.ri.gov |
| RI CCAP | dhs.ri.gov |
| RI insurance rates | ohic.ri.gov |

## Housing

| Data | Source |
|---|---|
| HUD Fair Market Rent by ZIP / metro | huduser.gov/portal/datasets/fmr.html |
| Zillow ZORI (rent index) | zillow.com/research/data/ |
| Apartments.com / Zumper medians | scrape allowed for research |
| Utilities average costs | eia.gov + local utility (Xcel Denver, RI Energy) |

## Jewish day schools

| School | Financial aid contact / sticker tuition page |
|---|---|
| Denver Jewish Day School | denverjds.org/admissions/tuition |
| Herzl / Rocky Mountain Hebrew Academy | hebrewacademy.org |
| JCDSRI | jcdsri.com/admissions |
| Providence Hebrew Day School | phdsri.org |

Financial aid forms most use: **TADS** or **Clarity** or **SSS by NAIS**. Historical grant bands can be estimated from 990s (non-profit aid expenditure / enrolled students).

## Food

| Data | Source |
|---|---|
| USDA Food Plans (thrifty/low/moderate/liberal) | fns.usda.gov/cnpp/usda-food-plans-cost-food-reports |
| BLS CPI food-at-home regional | bls.gov/cpi |

## Transportation / insurance

| Data | Source |
|---|---|
| Bankrate car-insurance by state report | bankrate.com (annual) |
| AAA driving cost reports | aaa.com |
| RTD Denver fares | rtd-denver.com |
| RIPTA fares | ripta.com |

## Special-needs services

| Data | Source |
|---|---|
| IDEA / IEP rights federal | sites.ed.gov/idea |
| CO Katie Beckett / HCBS CES waiver | hcpf.colorado.gov |
| RI Katie Beckett | eohhs.ri.gov/consumer/familieswithspecialneeds |
| Public school district special-ed plans | dpsk12.org (Denver), providenceschools.org |

## Recommended approach for the simulator data layer

1. Hard-code the constants (FPL, brackets, max allotments) in a versioned `data/constants_2025.json`.
2. Include a `data/constants_2026.json` if/when available — simulator picks by year.
3. Rent/utility/insurance medians → `data/city_defaults.json` keyed by `denver_co` / `providence_ri`.
4. School tuition → `data/schools.json` keyed by slug with `sticker_by_grade` array.
5. Benchmark SLCSP premiums → scrape once from healthcare.gov API (there's a public `/api/v1/plans/search.json`) for the relevant zip/age mix.
