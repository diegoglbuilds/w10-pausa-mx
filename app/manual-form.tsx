"use client";

import { useState, type FormEvent } from "react";
import { purchaseSchema, type PurchaseInput } from "@/lib/schema";

type OfferDraft = { priceMxn: number | null; installmentCount: number | null; installmentAmountMxn: number | null };
type Props = { onSubmit: (input: PurchaseInput) => void; onBack: () => void; draft?: OfferDraft | null; aiLabel?: string | null };
const initial = (draft?: OfferDraft | null) => ({ priceMxn: draft?.priceMxn?.toString() ?? "", installmentCount: draft ? draft.installmentCount?.toString() ?? "" : "6", installmentAmountMxn: draft?.installmentAmountMxn?.toString() ?? "", firstDueDate: "", knownFeesMxn: "", essentialExpensesMxn: "", existingMonthlyPaymentsMxn: "", selfSetMonthlyLimitMxn: "" });
type FormValues = ReturnType<typeof initial>;
const pesos = (s: string) => s === "" ? null : Number(s);

export function ManualForm({ onSubmit, onBack, draft, aiLabel }: Props) {
  const [values, setValues] = useState(() => initial(draft));
  const [errors, setErrors] = useState<string[]>([]);
  const [feesUnknown, setFeesUnknown] = useState(true);
  const [dateUnknown, setDateUnknown] = useState(true);
  function update(field: keyof FormValues, value: string) { setValues((current) => ({ ...current, [field]: value })); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missingContext = [values.essentialExpensesMxn === "" ? "Indica tus gastos esenciales o escribe 0." : "", values.existingMonthlyPaymentsMxn === "" ? "Indica tus pagos actuales o escribe 0." : ""].filter(Boolean);
    if (missingContext.length) { setErrors(missingContext); return; }
    const parsed = purchaseSchema.safeParse({
      priceMxn: Number(values.priceMxn), installmentCount: Number(values.installmentCount),
      installmentAmountMxn: pesos(values.installmentAmountMxn), firstDueDate: dateUnknown ? null : values.firstDueDate,
      knownFeesMxn: feesUnknown ? null : Number(values.knownFeesMxn || 0), essentialExpensesMxn: Number(values.essentialExpensesMxn || 0),
      existingMonthlyPaymentsMxn: Number(values.existingMonthlyPaymentsMxn || 0), selfSetMonthlyLimitMxn: pesos(values.selfSetMonthlyLimitMxn),
      otherDebtsNotIncluded: true, source: aiLabel ? "screenshot" : "manual", confirmedByUser: true,
    });
    if (!parsed.success) { setErrors(parsed.error.issues.map((issue) => issue.message)); return; }
    setErrors([]); onSubmit(parsed.data);
  }
  return <form className="card" onSubmit={submit} noValidate>
    <div className="stepper"><span className="step active"><b>1</b> Compra</span><span>────</span><span className="step"><b>2</b> Tu situación</span><span>────</span><span className="step"><b>3</b> Resultado</span></div>
    <div className="section-head"><span className="badge">{aiLabel ?? "Manual · sin conectar cuentas"}</span><h2 style={{marginTop:12}}>Datos de la compra</h2><p>Escribe lo que conoces. Lo que falte seguirá marcado como desconocido.</p></div>
    <div className="form-grid">
      <Field label="Precio de compra (MXN)" value={values.priceMxn} onChange={(v) => update("priceMxn", v)} placeholder="3,000" required />
      <Field label="Número de mensualidades" value={values.installmentCount} onChange={(v) => update("installmentCount", v)} type="number" min="1" max="48" required />
      <Field label="Pago mensual (si lo conoces)" value={values.installmentAmountMxn} onChange={(v) => update("installmentAmountMxn", v)} placeholder="500" hint="Si lo dejas vacío, estimamos precio ÷ mensualidades." />
      <div className="field"><label htmlFor="firstDueDate">Fecha del primer pago</label><input id="firstDueDate" type="date" value={values.firstDueDate} disabled={dateUnknown} onChange={(e) => update("firstDueDate", e.target.value)} /><label className="checkline"><input type="checkbox" checked={dateUnknown} onChange={(e) => setDateUnknown(e.target.checked)} /> No la conozco</label></div>
      <div className="field wide"><label htmlFor="knownFees">Comisiones conocidas (MXN)</label><input id="knownFees" inputMode="decimal" placeholder="0" value={values.knownFeesMxn} disabled={feesUnknown} onChange={(e) => update("knownFeesMxn", e.target.value)} /><label className="checkline"><input type="checkbox" checked={feesUnknown} onChange={(e) => setFeesUnknown(e.target.checked)} /> No conozco las comisiones</label></div>
    </div>
    <div className="divider" />
    <div className="section-head"><h2>Tu situación mensual</h2><p>Montos aproximados en MXN. No necesitamos saber a quién pagas.</p></div>
    <div className="form-grid">
      <Field label="Gastos esenciales mensuales" value={values.essentialExpensesMxn} onChange={(v) => update("essentialExpensesMxn", v)} placeholder="0" hint="Si no quieres contarlos, escribe 0." required />
      <Field label="Pagos actuales a meses" value={values.existingMonthlyPaymentsMxn} onChange={(v) => update("existingMonthlyPaymentsMxn", v)} placeholder="0" hint="Incluye los pagos que conoces; escribe 0 si no tienes." required />
      <Field label="Tu límite mensual (opcional)" value={values.selfSetMonthlyLimitMxn} onChange={(v) => update("selfSetMonthlyLimitMxn", v)} placeholder="Sin límite definido" hint="Tú lo defines; cambiarlo no modifica los cálculos." />
    </div>
    <p className="notice amber" style={{marginTop:16}}>No vemos todas tus deudas. Solo contamos lo que tú incluyes; otros pagos pueden faltar.</p>
    {errors.length > 0 && <ul className="error" role="alert">{errors.map((error, i) => <li key={`${error}-${i}`}>{error}</li>)}</ul>}
    <div className="actions"><button type="button" className="btn secondary" onClick={onBack}>Volver</button><button className="btn primary" type="submit">Ver mi resultado →</button></div>
  </form>;
}

function Field({ label, value, onChange, type = "number", min = "0", max = "10000000", placeholder, hint, required }: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; max?: string; placeholder?: string; hint?: string; required?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div className="field"><label htmlFor={id}>{label}{required ? " *" : ""}</label><input id={id} type={type} min={min} max={max} step="0.01" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />{hint && <small>{hint}</small>}</div>;
}
