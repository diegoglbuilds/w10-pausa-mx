# Pausa MX — Session decisions

## Decisions made

- Kept the experience manual-first and buyer-side. The optional screenshot entry is secondary and cannot start a calculation on its own.
- Financial values, schedules, totals, and limit bands are calculated in pure TypeScript. The optional vision route returns candidate offer fields only; each populated field needs a user confirmation and the manual form is validated again before calculation.
- Used a deterministic simulated screenshot example when `OPENAI_API_KEY` is absent. The UI labels it as simulated and does not send the selected image to the server in that case.
- Chose simple advisory bands: up to 80% of the self-set monthly limit is “within”; above 80% through 100% is “review”; above 100% is “wait”. No limit means a neutral state. The limit affects only advisory status and remaining room.
- If the monthly installment is unknown, the per-month estimate is rounded but the known total remains the entered purchase price. The next-month obligation checks every scheduled payment, including later installments when the first one falls this month.
- No real user information is stored in the browser or remotely. No database, auth, bank connection, or lender/retailer referral path is included.
- Updated Next.js to 16.4.2 after the first audit identified a critical advisory in the starter version. The patched dependency set reports zero known vulnerabilities.

## What changed

- Created a responsive Spanish (Mexico) app based on the supplied mobile mockup, with a buyer-first landing page, validated manual entry, deterministic result/timeline, unknown-data disclosures, and a comprehension check.
- Added optional screenshot selection with PNG/JPG/WebP and 4 MB limits, server-only OpenAI vision when configured, structured candidate validation, and per-field confirmation. Without the key, the screenshot remains local and the example data is visibly simulated.
- Added an optional server-only OpenAI explanation endpoint. It receives only validated calculation values after the user explicitly asks for it, and cannot set the status or financial math. Without a key or if the service fails, the visible explanation is deterministic and labeled “Explicación simulada”.
- Added Vitest coverage for validation, money math, schedule dates, advisory thresholds, buyer-control copy, continuation, comprehension, and simulated screenshot confirmation.
- `docs/PACKET.md` was not changed.

## Security status

- No secrets are committed. `.env*` files are ignored; `OPENAI_API_KEY` is read only by the server route. It is not configured in this workspace, so screenshot extraction currently uses the local simulated fallback.
- No real personal financial data is persisted. There is no database, auth, or Supabase; RLS is not applicable.
- Zod validates purchase values and extracted candidates. The browser and server enforce accepted image MIME types and a 4 MB maximum. Impossible dates and out-of-range values are rejected.
- The optional vision request sends the user-selected image to OpenAI only when the server key is configured. The route uses fixed instructions and sends no raw user-entered text. Vision output cannot supply calculations or status.
- The optional explanation request sends only Zod-validated numeric outputs, advisory status, and unknown flags after an explicit user action. A key availability check sends no financial values. The key remains server-only; the explanation cannot change calculation results.
- `npm audit`: zero known vulnerabilities after upgrading to Next.js 16.4.2.

## Unresolved risks

- The simulated screenshot fields are synthetic sample values, not OCR. Users may still over-trust candidate extraction despite the confirmation step.
- Live vision and explanation behavior, model availability, provider retention settings, request-cost controls, and rate limiting have not been evaluated. A configured server key enables the routes; no OpenAI key is present in this workspace, so both currently use simulated outputs.
- Missing due dates are shown as unknown. For the next-month estimate only, an unknown date is conservatively treated as a payment next month; the interface should continue to make that assumption clear.
- No external persona walkthrough, live URL, or production deployment was performed in this session.
- Next 16 uses Turbopack; the production build succeeds.

## Tomorrow’s first move

Run a mobile walkthrough with the synthetic Karla persona. Check whether she can explain the known total, next-month obligation, and remaining unknowns after entering one real-world-shaped but fictional offer. Adjust unclear labels before any deployment.

## Mechanical Test — Post Deploy #1

- **Testing method:** Source inspection against the mechanical test plan, existing Vitest/Testing Library coverage, then `npm test` and `npm run build`. No browser interaction or production behavior is claimed from this pass.
- **Browser automation available:** no.
- **Production browser verification available:** no.
- **Real bug found:** When the user unchecked “No conozco las comisiones” but left the fee amount blank, the form converted the blank string to `0` and accepted the input as known zero fees.
- **Why it mattered:** This silently understated the known total and hid an unanswered cost, violating the requirement to preserve unknowns and making the result less reliable at the purchase decision.
- **Fix applied:** The form now rejects an empty fee amount when fees are marked known, with an instruction to enter an amount or mark fees unknown. An explicit `0` remains valid.
- **Regression test:** Added a form test proving blank known fees are rejected and an explicitly entered zero is accepted.
- **Remaining risks:** No live browser or production walkthrough was available. Vision and external explanation behavior remain unverified in a browser. A persona test is still needed.
- **Next session first move:** persona test.

## Persona Test — Post Mechanical Fix

- **Synthetic persona:** Karla Hernández, fictional / synthetic, age 29, Estado de México, with variable disposable income and checkout-focused shopping habits.
- **Testing method:** Source-based walkthrough of implemented UI copy, rendered structure, state transitions, schemas, deterministic finance logic, and workflow tests. Added a rendered-copy regression test and re-traced the affected form state. This is not real user research.
- **Browser/screenshot limitation:** Browser automation was unavailable. No captured browser or production screenshots were available; the repository mockup is not a screenshot. No clicks, visual observations, or production behavior are claimed.
- **Worst confusion:** “Tu límite mensual” did not explain that the entered amount was compared with essential expenses, current payments, and the new purchase. It could sound like an app-imposed credit or installment limit.
- **Design decision:** State directly that the optional value is the user's own maximum total monthly allocation and list the categories used in its existing comparison. Keep the value optional and preserve the neutral no-limit state.
- **Fix:** Renamed the field to “Tu máximo mensual (opcional)” and explained what it is compared against. Deterministic finance logic was unchanged.
- **Re-test result:** Source re-trace confirms the user-set meaning is explicit at entry, blank remains no-limit, changing the value continues to affect only advisory outputs, and the continue-anyway action remains available. Regression coverage checks the visible label and explanation. Comprehension for a real shopper remains unmeasured.
- **Simple-alternative comparison:** A calculator can multiply installments and a calendar can record dates. Pausa MX additionally combines the schedule, known total, next-month obligation, visible unknowns, and optional user-defined comparison. Calculator + calendar could produce similar understanding with more manual setup; no evidence yet shows Pausa MX is faster or that Karla would voluntarily use it before checkout.
- **Remaining risk:** Required context fields and the comprehension check may feel like homework; “known total” can differ from offer price if payment × count differs; the 30-second claim is unmeasured; simulated screenshot values may be mistaken for extraction; no real user has tested whether “Espera” feels advisory.
- **Next session first move:** final deploy verification and submission artifacts.
