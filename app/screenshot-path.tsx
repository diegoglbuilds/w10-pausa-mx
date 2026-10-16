"use client";

import { useState, type ChangeEvent } from "react";

type Candidates = { priceMxn: number | null; installmentCount: number | null; installmentAmountMxn: number | null };
type Props = { onConfirmed: (draft: Candidates, label: string) => void; onBack: () => void };
const simulated: Candidates = { priceMxn: 3000, installmentCount: 6, installmentAmountMxn: 500 };
const fields: Array<{ key: keyof Candidates; label: string }> = [
  { key: "priceMxn", label: "Precio de compra (MXN)" },
  { key: "installmentCount", label: "Número de mensualidades" },
  { key: "installmentAmountMxn", label: "Pago mensual (MXN)" },
];

export function ScreenshotPath({ onConfirmed, onBack }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState<Candidates | null>(null);
  const [mode, setMode] = useState<"ai_assisted" | "simulated" | null>(null);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setCandidates(null); setMode(null); setConfirmed({}); setError("");
    if (selected && (!["image/png", "image/jpeg", "image/webp"].includes(selected.type) || selected.size > 4 * 1024 * 1024 || selected.size === 0)) {
      setFile(null); setError("Usa una imagen PNG, JPG o WebP de hasta 4 MB."); return;
    }
    setFile(selected);
  }
  async function extract() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const status = await fetch("/api/extract");
      const config = await status.json() as { configured: boolean };
      if (!config.configured) {
        // The selected image stays in the browser when no server key is configured.
        setCandidates(simulated); setMode("simulated"); setBusy(false); return;
      }
      const body = new FormData(); body.set("image", file);
      const response = await fetch("/api/extract", { method: "POST", body });
      const result = await response.json() as { mode?: "ai_assisted" | "simulated"; candidates?: Candidates; error?: string };
      if (!response.ok || !result.candidates || !result.mode) throw new Error(result.error ?? "No pudimos leer la captura.");
      setCandidates(result.candidates); setMode(result.mode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos leer la captura. Puedes usar la calculadora manual.");
    } finally { setBusy(false); }
  }
  const populated = fields.filter(({ key }) => candidates?.[key] !== null && candidates?.[key] !== undefined);
  const canConfirm = populated.length > 0 && populated.every(({ key }) => confirmed[key]);
  return <section className="card"><div className="section-head"><span className="badge">Ruta opcional</span><h2 style={{marginTop:12}}>Usar una captura</h2><p>La imagen no se guarda. Sin OPENAI_API_KEY, no se envía al servidor: se muestra un ejemplo simulado.</p></div>
    <div className="field"><label htmlFor="offer-image">Imagen de la oferta</label><input className="file-input" id="offer-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectFile} /><small>PNG, JPG o WebP · máximo 4 MB</small></div>
    {error && <p className="error" role="alert">{error}</p>}
    {!candidates && <div className="actions"><button className="btn secondary" onClick={onBack}>Volver</button><button className="btn primary" disabled={!file || busy} onClick={extract}>{busy ? "Revisando…" : "Leer campos candidatos"}</button></div>}
    {candidates && <div style={{marginTop:18}}><p><span className="badge">{mode === "ai_assisted" ? "IA asistida · candidatos por confirmar" : "Extracción simulada · no es lectura de tu imagen"}</span></p><p className="muted">Confirma cada dato detectado. Puedes editarlo antes de continuar. Los campos sin dato permanecen desconocidos.</p>
      <div className="form-grid">{fields.map(({ key, label }) => <div className="field" key={key}><label htmlFor={`candidate-${key}`}>{label}</label><input id={`candidate-${key}`} type="number" min="1" max={key === "installmentCount" ? 48 : 10000000} step={key === "installmentCount" ? 1 : "0.01"} disabled={candidates[key] === null} value={candidates[key] ?? ""} onChange={(e) => { setCandidates((current) => current ? { ...current, [key]: e.target.value === "" ? null : Number(e.target.value) } : current); setConfirmed((current) => ({ ...current, [key]: false })); }} /><label className="checkline"><input type="checkbox" disabled={candidates[key] === null} checked={Boolean(confirmed[key])} onChange={(e) => setConfirmed((current) => ({ ...current, [key]: e.target.checked }))} /> Confirmo este dato</label></div>)}</div>
      <div className="actions"><button className="btn secondary" onClick={onBack}>Volver</button><button className="btn primary" disabled={!canConfirm} onClick={() => onConfirmed(candidates, mode === "ai_assisted" ? "Captura · IA asistida · valores confirmados" : "Captura · ejemplo simulado · confirmar en formulario")}>Continuar con valores confirmados</button></div>
    </div>}
  </section>;
}
