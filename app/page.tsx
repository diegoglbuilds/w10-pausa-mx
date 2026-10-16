"use client";

import { useState } from "react";
import { ManualForm } from "./manual-form";
import { ResultView } from "./result-view";
import { ComprehensionCheck } from "./comprehension-check";
import { calculateCheck } from "@/lib/finance";
import { ScreenshotPath } from "./screenshot-path";
import type { PurchaseInput } from "@/lib/schema";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseInput | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showComprehension, setShowComprehension] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [draft, setDraft] = useState<{ priceMxn: number | null; installmentCount: number | null; installmentAmountMxn: number | null } | null>(null);
  const [aiLabel, setAiLabel] = useState<string | null>(null);
  return <main className="shell"><div className="container">
    <header className="topbar"><div><div className="brand"><span className="brand-mark">Ⅱ</span> Pausa MX</div><div className="eyebrow">Chequeo de Cuotas</div></div><span className="badge">Sin banco · sin juicios</span></header>
    {showScreenshot ? <ScreenshotPath onBack={() => setShowScreenshot(false)} onConfirmed={(candidate, label) => { setDraft(candidate); setAiLabel(label); setStarted(true); setShowScreenshot(false); }} /> : !started ? <>
      <section className="hero"><span className="eyebrow">Una herramienta del lado de quien compra</span><h1>30 segundos antes de aceptar otra compra a meses.</h1><p className="lead">Mira cómo se suma esta compra a tus pagos y a tu propio límite. Pausa MX no presta, no bloquea compras y no ve todas tus deudas. Tú decides.</p>
        <div className="actions"><button className="btn primary" onClick={() => setStarted(true)}>Revisar una compra <span aria-hidden="true"> →</span></button><button className="btn secondary" onClick={() => setStarted(true)}>Usar calculadora manual</button><button className="btn text" onClick={() => setShowScreenshot(true)}>Subir captura (opcional)</button></div>
      </section>
      <section className="grid two" aria-label="Cómo funciona">
        <article className="card feature"><span className="feature-icon">◷</span><div><strong>En 30 segundos</strong><span>Captura el precio y las mensualidades que conoces.</span></div></article>
        <article className="card feature"><span className="feature-icon">▤</span><div><strong>Ve el impacto</strong><span>Consulta el calendario de pagos y tus compromisos.</span></div></article>
        <article className="card feature"><span className="feature-icon">◎</span><div><strong>Tú pones el límite</strong><span>Es opcional, editable y solo sirve como referencia.</span></div></article>
        <article className="card feature"><span className="feature-icon">◇</span><div><strong>Lo desconocido se queda visible</strong><span>No inventamos comisiones, fechas ni otras deudas.</span></div></article>
      </section>
      <section className="notice" style={{marginTop:18}}><strong>Tu decisión sigue siendo tuya.</strong> Mostramos consecuencias para ayudarte a entender la compra; eso no significa que demos permiso ni que decidamos por ti.</section>
    </> : purchase && showComprehension ? <ComprehensionCheck result={calculateCheck(purchase)} onBack={() => setShowComprehension(false)} onContinue={() => setShowComprehension(false)} /> : purchase && showResult ? <ResultView input={purchase} onEdit={() => setShowResult(false)} onContinue={() => setShowComprehension(true)} /> : purchase ? <section className="card"><div className="section-head"><span className="badge">Datos confirmados</span><h2 style={{marginTop:12}}>Tu situación mensual</h2><p>Con los valores que confirmaste, ya podemos mostrar las consecuencias.</p></div><div className="actions"><button className="btn secondary" onClick={() => setPurchase(null)}>Editar compra</button><button className="btn primary" onClick={() => setShowResult(true)}>Calcular resultado →</button></div></section> : <ManualForm draft={draft} aiLabel={aiLabel} onSubmit={(input) => { setPurchase(input); setShowResult(true); }} onBack={() => setStarted(false)} />}
    <p className="footer-note">Tú decides. Pausa MX no bloquea compras ni decide por ti.</p>
  </div></main>;
}
