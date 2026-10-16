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
- Added Vitest coverage for validation, money math, schedule dates, advisory thresholds, buyer-control copy, continuation, comprehension, and simulated screenshot confirmation.
- `docs/PACKET.md` was not changed.

## Security status

- No secrets are committed. `.env*` files are ignored; `OPENAI_API_KEY` is read only by the server route. It is not configured in this workspace, so screenshot extraction currently uses the local simulated fallback.
- No real personal financial data is persisted. There is no database, auth, or Supabase; RLS is not applicable.
- Zod validates purchase values and extracted candidates. The browser and server enforce accepted image MIME types and a 4 MB maximum. Impossible dates and out-of-range values are rejected.
- The optional vision request sends the user-selected image to OpenAI only when the server key is configured. The route uses fixed instructions and sends no raw user-entered text. Vision output cannot supply calculations or status.
- `npm audit`: zero known vulnerabilities after upgrading to Next.js 16.4.2.

## Unresolved risks

- The simulated screenshot fields are synthetic sample values, not OCR. Users may still over-trust candidate extraction despite the confirmation step.
- Live vision behavior, model availability, provider retention settings, request-cost controls, and rate limiting have not been evaluated. A configured server key enables the route; no OpenAI key is present in this workspace.
- Missing due dates are shown as unknown. For the next-month estimate only, an unknown date is conservatively treated as a payment next month; the interface should continue to make that assumption clear.
- No external persona walkthrough, live URL, or production deployment was performed in this session.
- Next 16 uses Turbopack; the production build succeeds.

## Tomorrow’s first move

Run a mobile walkthrough with the synthetic Karla persona. Check whether she can explain the known total, next-month obligation, and remaining unknowns after entering one real-world-shaped but fictional offer. Adjust unclear labels before any deployment.
