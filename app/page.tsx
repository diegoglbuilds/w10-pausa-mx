"use client";

import { useState } from "react";
import { ManualForm } from "./manual-form";
import type { PurchaseInput } from "@/lib/schema";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseInput | null>(null);
  return <main className="shell"><div className="container">
    <header className="topbar"><div><div className="brand"><span className="brand-mark">Ⅱ</span> Pausa MX</div><div className="eyebrow">Chequeo de Cuotas</div></div><span className="badge">Sin banco · sin juicios</span></header>
    {!started ? <>
      <section className="hero"><span className="eyebrow">Una herramienta del lado de quien compra</span><h1>30 segundos antes de aceptar otra compra a meses.</h1><p className="lead">Mira cómo se suma esta compra a tus pagos y a tu propio límite. Pausa MX no presta, no bloquea compras y no ve todas tus deudas. Tú decides.</p>
        <div className="actions"><button className="btn primary" onClick={() => setStarted(true)}>Revisar una compra <span aria-hidden="true"> →</span></button><button className="btn secondary" onClick={() => setStarted(true)}>Usar calculadora manual</button></div>
      </section>
      <section className="grid two" aria-label="Cómo funciona">
        <article className="card feature"><span className="feature-icon">◷</span><div><strong>En 30 segundos</strong><span>Captura el precio y las mensualidades que conoces.</span></div></article>
        <article className="card feature"><span className="feature-icon">▤</span><div><strong>Ve el impacto</strong><span>Consulta el calendario de pagos y tus compromisos.</span></div></article>
        <article className="card feature"><span className="feature-icon">◎</span><div><strong>Tú pones el límite</strong><span>Es opcional, editable y solo sirve como referencia.</span></div></article>
        <article className="card feature"><span className="feature-icon">◇</span><div><strong>Lo desconocido se queda visible</strong><span>No inventamos comisiones, fechas ni otras deudas.</span></div></article>
      </section>
      <section className="notice" style={{marginTop:18}}><strong>Tu decisión sigue siendo tuya.</strong> Mostramos consecuencias para ayudarte a entender la compra; eso no significa que demos permiso ni que decidamos por ti.</section>
    </> : purchase ? <section className="card"><div className="section-head"><h2>Compra capturada</h2></div><p>Tu revisión está lista para calcular.</p><button className="btn secondary" onClick={() => setPurchase(null)}>Editar datos</button></section> : <ManualForm onSubmit={setPurchase} onBack={() => setStarted(false)} />}
    <p className="footer-note">Tú decides. Pausa MX no bloquea compras ni decide por ti.</p>
  </div></main>;
}
