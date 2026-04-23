# Dependency Graph

High-level flow of how user inputs propagate into the yearly-cost output.

```mermaid
flowchart TD
    subgraph INPUTS
        LOC[location]
        PA_SAL[parent_a_gross_salary]
        PB_MODE[parent_b_mode]
        PB_SAL[parent_b_gross_salary]
        PB_SSDI[parent_b_ssdi_monthly]
        KOSHER[keeps_kosher]
        KA_SCHOOL[kid_a_school choice]
        KA_GRANT[kid_a_grant_pct]
        KB_PLACE[kid_b_placement]
        HEALTH[health_coverage_strategy]
        RENT_IN[monthly_rent override]
    end

    PA_SAL --> EARN[earned_income]
    PB_SAL --> EARN
    PB_SSDI --> UNEARN[unearned_income]
    EARN --> GROSS[gross_income]
    UNEARN --> GROSS
    GROSS --> MAGI[MAGI]

    MAGI --> FED_TAX[federal_income_tax]
    MAGI --> ACA[ACA subsidy / PTC]
    MAGI --> MEDICAID[Medicaid/CHIP eligibility]
    MAGI --> SNAP[SNAP eligibility + benefit]
    MAGI --> GRANT_SUG[suggested Kid A grant %]
    MAGI --> EITC_F[federal EITC]

    EARN --> FICA[FICA 7.65%]

    LOC --> STATE_TAX[state income tax]
    MAGI --> STATE_TAX
    LOC --> LOCAL_TAX[Denver OPT]
    LOC --> RENT_DEF[default rent]
    LOC --> UTILS[utilities]
    LOC --> CAR_INS[car insurance]
    LOC --> FOOD_MULT[kosher mult per city]
    LOC --> EITC_S[state EITC %]

    EITC_F --> EITC_S
    RENT_IN --> RENT[rent yearly]
    RENT_DEF --> RENT

    PB_MODE -->|ssdi| MEDICARE[Medicare after 24mo]
    PB_MODE -->|ssdi/ssi| SNAP_UNCAP[SNAP shelter deduction uncapped]
    SNAP_UNCAP --> SNAP
    PB_MODE -->|ssdi| SGA_CHK{earned < SGA?}
    PB_SAL --> SGA_CHK
    SGA_CHK -->|no| SSDI_LOST[SSDI suspended]

    KA_SCHOOL --> KA_STICK[sticker tuition]
    KA_GRANT --> KA_NET[kid_a_net_tuition]
    KA_STICK --> KA_NET
    GRANT_SUG -.suggests.-> KA_GRANT

    KB_PLACE --> KB_COST[kid_b_out_of_pocket]
    KB_PLACE --> KB_THERAPY[extra therapy $]

    HEALTH --> PREMIUM[health premium]
    ACA --> PREMIUM
    MEDICAID --> PREMIUM

    KOSHER --> FOOD[food yearly]
    FOOD_MULT --> FOOD

    FED_TAX --> NET[YEARLY NET CASH]
    FICA --> NET
    STATE_TAX --> NET
    LOCAL_TAX --> NET
    GROSS --> NET
    RENT --> NET
    UTILS --> NET
    FOOD --> NET
    KA_NET --> NET
    KB_COST --> NET
    KB_THERAPY --> NET
    PREMIUM --> NET
    CAR_INS --> NET
    SNAP --> NET
    EITC_F --> NET
    EITC_S --> NET

    NET --> FLAG{feasibility}
    FLAG --> GREEN[green: surplus > 2mo]
    FLAG --> YELLOW[yellow: 0-2mo]
    FLAG --> RED[red: deficit]
```

## The core cascade in words

1. **User sets income + disability + location.**
2. Income composes to gross → MAGI.
3. MAGI + location jointly determine every tax.
4. MAGI is also the eligibility key for ACA, Medicaid/CHIP, SNAP, grants, EITC.
5. Location sets expenses (rent, utilities, car insurance, food mult).
6. Disability status overrides several rules (Medicare, SNAP uncapped shelter, Katie Beckett for Kid B).
7. Schooling choices add big fixed expenses.
8. Sum → yearly net cash → feasibility flag.

## The interesting coupling — "the cliff"

```mermaid
flowchart LR
    NEXT_DOLLAR[next $1 of Parent B earnings]
    NEXT_DOLLAR --> TAX[+ income tax]
    NEXT_DOLLAR --> FICA2[+ FICA 7.65%]
    NEXT_DOLLAR --> SNAP_LOSS[- up to 30¢ SNAP]
    NEXT_DOLLAR --> ACA_LOSS[- higher ACA premium]
    NEXT_DOLLAR --> CHIP_LOSS[potential loss of kid CHIP]
    NEXT_DOLLAR --> GRANT_LOSS[- smaller Kid A grant]
    NEXT_DOLLAR --> SSDI_CLIFF{crosses SGA?}
    SSDI_CLIFF -->|yes| SSDI_ZERO[entire SSDI lost = -$1,580/mo]
```

When Parent B's work pushes MAGI across one of these thresholds, the **effective marginal tax rate often exceeds 100%** — earning more makes them poorer. This is the central insight the simulator must make visible.
