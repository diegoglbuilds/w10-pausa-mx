"use client";

import { useState } from "react";
import type { CheckResult } from "@/lib/finance";

const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export function ComprehensionCheck({ result, onBack, onContinue }: { result: CheckResult; onBack: () => void; onContinue: () => void }) {
  const [total, setTotal] = useState("");
  const [nextMonth, setNextMonth] = useState("");
  const [unknown, setUnknown] = useState("");
  const [checked, setChecked] = useState(false);
  const understood = Math.abs(Number(total) - result.totalKnownCostMxn) < 0.01
    && Math.abs(Number(nextMonth) - result.nextMonthKnownObligationMxn) < 0.01
    && unknown === "yes";
  return <section className="card">
    <span className="badge">Chequeo de comprensión</span><h2 style={{marginTop:12}}>Antes de decidir</h2>
    <p className="muted">Responde con lo que viste. Esto mide si la explicación fue clara; no es una puntuación financiera.</p>
    <div className="question"><label htmlFor="answer-total">¿Cuánto pagarías en total, según los datos conocidos?</label><input id="answer-total" className="field-input" type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="MXN" /></div>
    <div className="question"><label htmlFor="answer-next">¿Cuánto se suma a tus pagos el próximo mes?</label><input id="answer-next" type="number" min="0" step="0.01" value={nextMonth} onChange={(e) => setNextMonth(e.target.value)} placeholder="MXN" /></div>
    <div className="question"><label htmlFor="answer-unknown">¿Qué dato sigue faltando?</label><select id="answer-unknown" value={unknown} onChange={(e) => setUnknown(e.target.value)}><option value="">Elige una opción</option><option value="yes">Puede faltar información: comisiones, fecha u otras deudas</option><option value="no">Ya se conocen todos los datos</option></select></div>
    <button className="btn secondary" type="button" onClick={() => setChecked(true)}>Revisar respuestas</button>
    {checked && <p className={`notice ${understood ? "green" : "amber"}`} role="status">{understood ? "Entendiste los importes y los datos que siguen faltando." : `Revisa el resultado: costo conocido ${money(result.totalKnownCostMxn)}; pagos conocidos el próximo mes ${money(result.nextMonthKnownObligationMxn)}. Otros datos pueden seguir faltando.`}</p>}
    <div className="notice" style={{marginTop:16}}>Tú decides qué hacer. El resultado muestra consecuencias; no otorga permiso ni toma la decisión.</div>
    <div className="actions"><button className="btn secondary" onClick={onBack}>Volver al resultado</button><button className="btn primary" onClick={onContinue}>Continuar de todos modos</button></div>
    <p className="footer-note">Tú decides. Pausa MX no bloquea compras ni decide por ti.</p>
  </section>;
}
