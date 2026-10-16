# Week 10 Persona Test

## Test status

- **Persona:** fictional / synthetic. This is a source-based walkthrough, not user research.
- **Browser automation available:** no.
- **Screenshots actually available:** no. The repository contains a design mockup, but no captured browser or production screenshots were available for this test.
- **Testing method:** Read the landing, manual form, result, explanation, screenshot, and comprehension components; traced React state transitions, Zod schemas, deterministic finance functions, and existing workflow tests. Then reviewed the proposed copy change against that flow and added a rendered-copy regression test. No live browser actions or production behavior are claimed.
- **Honesty note:** Interpretations and hesitation below are predictions based on the fictional persona and implemented copy. They are not quotes or observed user behavior.

## Persona

**Karla Hernández — fictional / synthetic profile.** Age 29, Estado de México; variable disposable income; uses WhatsApp, Instagram, Mercado Libre, and banking apps; does not use a personal-finance spreadsheet. She often encounters installment offers in social and marketplace checkout flows, understands monthly payments more readily than APR language, and may focus on the installment while overlooking the full obligation. She has essential expenses and recurring payments. She is impatient at checkout, distrusts requests for bank credentials, dislikes scolding, and wants to remain the decision maker.

## Walkthrough

These are source-based expectations for Karla, not measured usability findings. Likelihood means the predicted chance she would proceed to the next state.

| State | Expectation | Interpretation | Hesitation / confusion | Likelihood of continuing | Severity |
|---|---|---|---|---|---|
| Landing | A quick check before she accepts installments | Buyer-side tool that shows how one purchase adds to payments; it says it does not lend, block, or see all debts | “30 segundos” may feel optimistic because the flow asks for several amounts. Two manual start buttons (“Revisar una compra” and “Usar calculadora manual”) appear to offer similar paths | Medium to high: trust and control copy is immediate, but time promise is unproven | Medium |
| Manual-first path | Enter offer details without connecting accounts | Manual entry is the default path; “sin conectar cuentas” reassures her | She may wonder if she can skip the optional screenshot. The copy says it is optional, and manual flow is directly available | High | Low |
| Purchase price | Enter the price shown at checkout | Purchase price is one input to the known cost | “¿Por qué tengo que poner esto?” The form does not say right beside the price that it is used to compare the offer and calculate a total | Medium | Medium |
| Installment count | Enter number of payments | The count determines schedule length and divides price when monthly payment is unknown | The 1–48 bound is technically enforced but not explained; “mensualidades” may be less familiar than “pagos al mes” for some offers | Medium | Low |
| Installment amount | Enter checkout amount or leave blank | If blank, the app estimates price ÷ count; finance code owns the estimate | If the seller's monthly amount differs from price ÷ count, she may not know whether to trust the displayed offer amount or estimate. The hint explains the estimate but not how conflicting numbers are treated | Medium | Medium |
| First due date | Enter first date or leave “No la conozco” checked | Date is optional; leaving it unknown preserves uncertainty | She may not know where to find the date at checkout. Result explicitly says the timeline has order only and conservatively assumes a payment next month | High | Low |
| Known vs unknown fees | Keep “No conozco las comisiones” checked, or enter known fee amount | Fees are excluded when unknown; explicit zero is different from unknown | This is clear in principle, but “Comisiones conocidas” might not include interest or other charges in Karla's mind. The recent mechanical fix prevents blank known fees becoming zero | Medium to high | Medium |
| Essential expenses | Enter monthly essentials or `0` | This is required context to compare the monthly total with her own maximum | “¿Por qué me pide gastos esenciales?” She may not want to disclose personal spending or may not know the amount at checkout. “Si no quieres contarlos, escribe 0” allows skipping the amount but can make the result less representative | Medium | High |
| Existing installment commitments | Enter the payments she knows, or `0` if none | The app adds these known monthly payments and says other debts may be missing | “¿Está viendo todas mis deudas?” No: no bank login, and the notice says only included values count. Still, entering a sum is work and may omit irregular commitments | Medium | Medium |
| Optional self-set maximum | Optionally enter what she wants to allocate monthly | Before the fix, “límite mensual” did not explain that the app compares it with essentials + existing payments + the new purchase | “¿Qué significa ‘límite’?” She could mistake it for a credit limit, a maximum installment, or an app-imposed rule. This was the worst confusion | Initially low to medium; improved by explicit definition, still requires estimating an amount | High before fix; medium after fix |
| Calculation / timeline | See known total, monthly payment, next-month obligation, and scheduled payments | Pure TypeScript calculation; AI is not needed to calculate | “¿Cuánto voy a pagar realmente?” The result says “costo conocido” and shows the formula, but the entered purchase price is not separately displayed in the result. If installment × count differs from price, she may need to compare manually | Medium | Medium |
| Unknown-data disclosure | See unknown fees, unknown date assumption, and debts not included | Pausa MX does not claim complete visibility; unknown fees are excluded and unknown date gets an explicit next-month assumption | “¿Qué dato está adivinando?” The unknown date assumption is called out. She may interpret “pagos actuales” as comprehensive despite the repeated omission disclosure | Medium to high | Medium |
| Within-limit advisory | See “Dentro de tu límite” | The monthly total is at or below 80% of her entered maximum | Could sound like approval even though nearby copy says it is only a comparison based on entered data | High | Low to medium |
| Review advisory | See “Revisa antes de comprar” | Advisory, based on her own maximum | “¿Esto me va a decir que no puedo comprar?” The copy says she decides and can continue, but “revisa” may still feel like a warning | Medium to high | Medium |
| Wait advisory | See “Espera” | The monthly total exceeds her maximum; it is not a block | “¿Puedo seguir comprando aunque diga ‘Espera’?” Both result and footer explicitly offer “Continuar de todos modos” and state the app does not block | Medium | Medium |
| No-limit state | Leave limit blank | Neutral state; no comparison is made | She may worry the app needs a limit to calculate. Result explicitly says no comparison and shows known payments; no-limit remains neutral | High | Low |
| “Continuar de todos modos” | Continue regardless of result or comprehension answers | Buyer control is preserved; action opens the comprehension check from result | The button wording may suggest a purchase action, although the app does not transact. “Continuar” here advances in Pausa MX; page copy says it does not buy or block | Medium | Medium |
| Explanation disclosure | Read local simulated explanation; optionally request AI explanation if configured | Deterministic numbers remain separate; explanation is visibly labeled simulated or AI-assisted | “¿La IA está haciendo las cuentas?” The badge and note explain it does not modify calculations, but this separation appears on result rather than before manual entry. If a service fails, simulated wording is used | High | Low to medium |
| Optional screenshot / vision | Select an image only if she chooses that route | Without a key, image stays local and a sample is shown; with a key, image is sent to the vision endpoint | She may expect the sample values to have been read from her screenshot. The UI says “no es lectura de tu imagen,” but that disclosure competes with a realistic-looking sample | Medium | Medium |
| Candidate confirmation | Confirm each populated candidate before moving to form | Extraction proposes values; each populated amount requires an explicit checkbox, and manual form validates again | Repeated per-field confirmation adds time. “Confirmo este dato” may imply accuracy rather than “I reviewed this value”; still, fields can be edited | Medium | Medium |
| Comprehension check | Enter total, next-month payments, and identify missing data | It checks understanding, not creditworthiness, and does not gate continuation | This adds homework at the most impatient moment. Wrong answers are shown along with the correct known amounts; there is no required pass | Medium to low | Medium |
| Shadow / buyer-control statement | See that Pausa MX does not decide or block | The user retains the final decision throughout | Repetition may feel defensive, but it reinforces autonomy and matches her concern about algorithmic control | High | Low |

Across the flow, the product does not request bank credentials or persist financial data. The source has no lender/retailer referral links or financial risk score. Those facts support trust, though source inspection cannot prove a production user's experience.

## Confusion Log

| State | Confusion | Severity | Why it matters | Candidate fix |
|---|---|---|---|---|
| Landing | The 30-second promise may conflict with the number of required fields | Medium | If the time cost feels false, Karla may leave before seeing value | Keep the promise framed as a target; measure in a real persona test and shorten only if observed time warrants it |
| Landing | Two manual entry buttons may look redundant | Low | Small choice cost at checkout | Use one primary manual action if a real walkthrough confirms hesitation |
| Price | Purpose of price is not explained beside the field | Medium | She may see another form question instead of a useful calculation input | Add a short reason only if this can be done without making the form denser |
| Installment count | The 1–48 bound is not explained | Low | Out-of-range offers may seem rejected arbitrarily | Explain the accepted range if users encounter it |
| Installment amount | If her entered monthly amount differs from price ÷ count, the result formula may surprise her | Medium | The known total may not match the headline price, which could undermine confidence | Show the stated price and installment total side by side when they differ; do not silently replace either |
| First due date | She may not know where to find the date | Low | Could slow checkout, but unknown is supported and disclosed | Keep unknown option prominent |
| Fees | “Comisiones” may not mean interest or every extra charge to her | Medium | An incomplete fee understanding can understate total cost | Use “comisiones u otros cargos” if comprehension testing shows “comisiones” is too narrow |
| Essential expenses | Required amount may feel intrusive or like homework | High | This can threaten 30-second adoption and trust | State why it is requested; allow `0` and keep personal detail unnecessary |
| Existing payments | She may think the app sees all obligations or may omit some | Medium | Could produce false confidence in the monthly comparison | Continue repeating that only entered payments count and other debts may be missing |
| Monthly maximum | The original label did not say what the maximum applied to | High | Could feel like a credit limit or an app-set affordability rule | Clarify that it is her own total monthly amount for essentials, current payments, and this purchase; preserve optionality |
| Total | “Costo conocido total” may be mistaken for the seller's final amount | Medium | Unknown fees are excluded and installment total may differ from purchase price | Keep “conocido” prominent; explain differences if price and installments disagree |
| Unknown date | The next-month amount uses a conservative assumption when date is unknown | Medium | Assumption can be mistaken for a known due date | Current disclosure states it is an assumption; retain it next to the result |
| Within / review / wait | Advisory colors and words can still feel like approval or prohibition | Medium | Threatens buyer control | Keep visible override and no-permission language with every result |
| Continue action | “Continuar de todos modos” could be read as proceeding with a purchase | Medium | App does not execute a transaction; mismatch can surprise | Clarify that it continues the Pausa MX flow if users infer checkout execution |
| AI explanation | AI role may be mistaken for arithmetic | Low to medium | A user may trust generated prose as authoritative calculation | Keep deterministic math source-owned and explanation badge/disclaimer adjacent |
| Screenshot simulation | Sample values could be mistaken for OCR results | Medium | False extraction could contaminate user's manual input | Keep “simulado” and “no es lectura de tu imagen” adjacent to candidate values |
| Candidate confirmation | Confirmation checkboxes add time and may imply correctness | Medium | Could burden the optional route or overstate confidence | Keep values editable and require confirmation; consider clearer “Revisé este dato” wording if tested |
| Comprehension check | Three answers may feel like a quiz after she already got the result | Medium | Adds friction at the moment she wants to leave checkout | Preserve skip/continue path; test whether it improves comprehension enough to justify friction |
| Repeated control copy | Repetition may feel overly defensive | Low | Can add reading time | Keep the shadow clause visible, trim duplicate phrasing only after a real walkthrough |

## Simple Alternative Comparison

| Tool | What it gives Karla | Extra friction / limits |
|---|---|---|
| Basic calculator | Quickly multiplies monthly installment by number of payments and can add known fees | Does not maintain an unknown-fees state, identify omitted debts, compare against her own monthly maximum, or preserve a payment sequence without extra work |
| Calendar | Can place known due dates and reminders | Requires manual event setup; does not total the known cost or compare monthly essentials and current payments against her maximum |
| Pausa MX | Combines known total, monthly payment timeline, next-month known obligation, unknown-data disclosure, optional self-set comparison, override, and comprehension prompts | Asks for multiple values, including essentials and current payments; date and amount estimates need review; optional screenshot confirmation and comprehension check add friction |

Pausa MX adds structure and makes unknowns and buyer control more explicit than a calculator alone. A calculator plus calendar could produce similar numerical understanding if Karla is willing to do the setup and remember which fees or debts are unknown. The source does not establish that Pausa MX is faster, clearer, or meaningfully better for her. The extra transparency is implemented, but voluntary use before checkout remains unproven. The 30-second claim and comprehension check need a real user test before claiming advantage.

## Worst Confusion

Before the fix, “Tu límite mensual” did not define what the amount limited. The finance logic compares it with essential expenses + existing monthly payments + the new installment, while the label could be understood as an installment ceiling, debt limit, or rule imposed by Pausa MX. This threatens both adoption and buyer control: Karla may feel judged by an unexplained algorithm even though the number is optional and user-set.

## Fix Applied

Changed the field label to “Tu máximo mensual (opcional)” and added a short explanation: “Define cuánto quieres destinar en total al mes. Lo comparamos con tus gastos esenciales, pagos actuales y esta compra.” This names the user's role and exactly what the existing calculation compares. The finance logic, limit bands, and neutral no-limit state are unchanged. Added a rendered-copy regression test.

## Re-test

Re-traced the manual form with the new wording: Karla can understand that the optional value is her own total monthly maximum and that it is compared against the three visible categories already included in the math. If she leaves it blank, the existing no-limit state remains neutral. If she changes it, only the advisory status and remaining room change. “Continuar de todos modos” remains available for every advisory, and no permission or purchase action is introduced. This source/test re-test supports the copy change; it does not establish measured comprehension or actual 30-second completion.

## Remaining Confusions

- Required essential-expense and current-payment fields may still feel like homework; the explanation for why essentials matter could be closer to those fields.
- “Costo conocido total” may differ from the displayed offer price if the installment amount × count differs; that difference is not separately surfaced.
- The 30-second promise is unmeasured, and the comprehension step adds time.
- Screenshot sample values are simulated rather than read from the image; users could still overlook that label.
- No synthetic walkthrough can establish whether “Espera” feels advisory to a real shopper.
- The simple calculator + calendar alternative may be adequate for many buyers; observed comparative use is still required.
