"use client";

import { useEffect, useState } from "react";
import { simulatedExplanation } from "@/lib/explanation";
import type { ExplanationInput } from "@/lib/schema";

export function ResultExplanation({ input }: { input: ExplanationInput }) {
  const [result, setResult] = useState({ mode: "simulated", explanation: simulatedExplanation(input) });
  const [configured, setConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    async function checkConfiguration() {
      try {
        const statusResponse = await fetch("/api/explain");
        const config = await statusResponse.json() as { configured: boolean };
        if (active) setConfigured(config.configured);
      } catch {
        if (active) setConfigured(false);
      } finally {
        if (active) setChecking(false);
      }
    }
    void checkConfiguration();
    return () => { active = false; };
  }, [input]);
  async function requestExplanation() {
    setBusy(true);
    try {
      const response = await fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error("No disponible");
      const payload = await response.json() as { mode?: string; explanation?: string };
      if (payload.mode && payload.explanation) setResult({ mode: payload.mode, explanation: payload.explanation });
    } catch {
      setResult({ mode: "simulated", explanation: simulatedExplanation(input) });
    } finally { setBusy(false); }
  }
  return <section className="notice" aria-label="Explicación del resultado"><span className="badge">{result.mode === "ai_assisted" ? "IA asistida · explicación" : "Explicación simulada"}</span><p style={{marginBottom:0}}>{result.explanation}</p><small>La explicación no modifica los cálculos ni el aviso.</small>{configured && <div style={{marginTop:10}}><p className="muted">Si la pides, enviaremos a OpenAI solo los importes calculados y datos faltantes que aparecen aquí. No se envían la captura ni texto personal.</p><button className="btn secondary" onClick={requestExplanation} disabled={busy}>{busy ? "Preparando explicación…" : "Pedir explicación con IA"}</button></div>}{!configured && !checking && <small style={{display:"block",marginTop:8}}>Explicación simulada; no se enviaron datos a un servicio externo.</small>}</section>;
}
