# 05 — Open Questions

Things we need to decide / you need to tell me, before the mapping is final enough to code.

## Scenario scope

1. **Tax year target**: model 2025 (verifiable) or 2026 (requires projecting)?
2. **ACA subsidy extension**: the IRA enhanced PTCs expire end of 2025 unless Congress renews. Do we model:
   - (a) optimistic: extended (current rules);
   - (b) pessimistic: reverts to pre-IRA (400% FPL cliff, higher required contributions);
   - (c) a toggle?
3. **Are parents US citizens / green-card holders?** Affects Medicaid & SNAP eligibility for non-citizens.
4. **Any existing assets** (house equity, 401k, cash savings)? Affects financial-aid grant, Medicaid assets test (SSI has a $2,000 single / $3,000 couple resource limit — **SSDI does not**), and feasibility cushion.

## Parent A

5. What is the realistic salary range you want to model? Local community journalism in Denver vs Providence differs:
   - Denver local newspaper reporter: ~$45–70k
   - Providence local journalism / nonprofit comms: ~$40–62k
   - Include freelance / 1099 option? (changes FICA to 15.3%, adds SEP/solo 401k).

## Parent B

6. If on **SSDI**: rough monthly benefit? (Do you have a real number in mind, or should I use the 2025 national avg of $1,580?)
7. If on **SSI** instead of SSDI: this has a strict asset test and different rules — confirm which.
8. Will Parent B attempt **part-time work under SGA**? ($1,620/mo is the ceiling without losing SSDI.) SSA's "Ticket to Work" / trial work period is relevant.
9. Does Parent B have a condition that gives Kid B's learning/personal issues context (e.g., familial / hereditary), and would that affect Kid B's eligibility for additional programs?

## Kid A (Jewish day school)

10. Which specific school(s) are realistic for this family? (Affects sticker, aid philosophy, kashrut level, grade levels offered.) Even a rough "one of these 2–3" list in each city helps.
11. Is there a **sibling discount** at the school if Kid B also enrolls? (Common — 10–25%.)
12. Camp: is 8-week Jewish summer camp assumed in-scope, or just a short day-camp block? Sleep-away (Ramah: ~$12k) vs local day camp (~$3–5k) changes numbers a lot.

## Kid B (special needs)

13. What's the diagnostic picture — roughly? Options materially affect modeling:
    - Learning disability / ADHD (often served by IEP in public school)
    - Autism spectrum (often needs more specialized placement)
    - Emotional/behavioral
    - Combination
14. Strong preference between:
    - (a) Public with IEP + out-of-pocket private OT/ST/therapy
    - (b) District-funded private specialized placement (requires IEP + proof public can't FAPE)
    - (c) Self-pay private special-needs school
    - (d) Same Jewish day school as Kid A + private aides?
    
    Each of these has drastically different cost structure.

## Housing

15. Firm on **renting** (vs modeling "buy in year 2" transition)?
16. Neighborhood preference — Orthodox / Jewish-community proximity is often a hard constraint. In Denver this means East Denver (Hilltop, Park Hill) or Stapleton; in Providence it means East Side (Wayland Sq, Blackstone). These are **more expensive** than city medians.

## Health

17. Does Parent A's hypothetical employer offer family coverage? Journalism / small-nonprofit jobs frequently do NOT offer affordable family plans — even if "employer coverage" exists, the spouse + kids often need ACA because the employee-only plan is cheap but family plan is not. (The "family glitch" is fixed now — family members can get PTC if employer's family premium > 8.39% of income.) Assume we model this?

## Lifestyle / values-based inputs (optional sliders)

18. Shomer-Shabbat constraints: no driving Friday night–Saturday, separate kosher kitchen, etc. This affects:
    - Rent (must walk to shul → narrows neighborhoods)
    - Transport (may need to live without transit on Shabbat)
    - Food (strict kosher = kosher_multiplier ~1.4–1.6, not 1.2)
19. Private Jewish tutoring (bar/bat mitzvah prep for 11–13 age)? Out of our 5–10 age window but worth flagging.
20. Annual travel — e.g., fly to grandparents for Pesach / Sukkot. Jewish holidays often mean multiple flights/year.

## Technical / UI

21. Output preference: single annual number, or month-by-month breakdown (cashflow across the year — matters because tuition is often front-loaded September, tax refund arrives April, heating spikes Jan–Feb)?
22. Comparison view: side-by-side Denver vs Providence always visible, or toggle?
23. Granularity of 3D scene: is the three.js "city" just decorative, or should it encode data (building height = expense, particle flow = income → categories)?

---

## My suggested defaults (if you don't want to decide yet)

I propose we code the simulator against these defaults, all overridable via the UI:

- Tax year: **2025** (verifiable constants).
- ACA: **extended IRA rules** with a toggle for pre-IRA.
- Parent A: **$55k** (median local-journalism salary).
- Parent B: **SSDI at $1,580/mo** (national average), no earned income.
- Kid A: DJDS (Denver) / JCDSRI (Providence), **50% grant**.
- Kid B: **public school with IEP** + $400/mo private therapy copay.
- Housing: HUD FMR 3BR, Jewish-community neighborhood premium +15%.
- Health: **marketplace full family** (no employer plan), silver benchmark.
- Kosher: yes, multiplier 1.3.
- 1 car.

With these defaults the simulator shows a baseline; then every input becomes a knob.
