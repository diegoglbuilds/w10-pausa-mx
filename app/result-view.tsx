import type { PurchaseInput } from "@/lib/schema";
import { calculateCheck } from "@/lib/finance";

const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);
const statusCopy = {
  within: ["Dentro de tu límite", "Con los datos que incluiste, el total queda dentro del margen que definiste."],
  review: ["Revisa antes de comprar", "Con los datos incluidos, te acercas al límite mensual que tú definiste."],
  wait: ["Espera", "Con los datos incluidos, el total supera el límite mensual que tú definiste."],
  no_limit: ["Sin límite definido", "Aquí están los pagos conocidos. No hay una comparación de límite."],
} as const;

export function ResultView({ input, onEdit, onContinue }: { input: PurchaseInput; onEdit: () => void; onContinue: () => void }) {
  const result = calculateCheck(input);
  const [title, explanation] = statusCopy[result.limitStatus];
  return <section className="card">
    <div className="stepper"><span className="step done"><b>✓</b> Compra</span><span>────</span><span className="step done"><b>✓</b> Tu situación</span><span>────</span><span className="step active"><b>3</b> Resultado</span></div>
    <div className={`result-banner ${result.limitStatus}`}><span aria-hidden="true" style={{fontSize:24}}>●</span><div><h2>{title}</h2><p style={{margin:"6px 0 0"}}>{explanation}</p></div></div>
    <div className="metric-grid">
      <Metric title="Costo conocido total" value={money(result.totalKnownCostMxn)} />
      <Metric title="Pago nuevo mensual" value={money(result.monthlyPaymentMxn)} />
      <Metric title="Compromisos actuales / mes" value={money(result.existingMonthlyPaymentsMxn)} />
      <Metric title="Pagos conocidos el próximo mes" value={money(result.nextMonthKnownObligationMxn)} />
    </div>
    <section style={{marginTop:22}}><h2>Tu límite y pagos mensuales</h2><div className="metric-grid" style={{marginTop:12}}>
      <Metric title="Límite que definiste" value={result.selfSetMonthlyLimitMxn === null ? "Sin límite" : money(result.selfSetMonthlyLimitMxn)} />
      <Metric title="Esenciales + pagos + compra" value={money(result.monthlyTotalWithPurchaseMxn)} />
      <Metric title="Margen restante" value={result.remainingRoomMxn === null ? "No calculable" : money(result.remainingRoomMxn)} />
    </div></section>
    <section className="card" style={{marginTop:18,padding:18,boxShadow:"none"}}><h2>Calendario de esta compra</h2><div className="timeline" style={{marginTop:10}}>{result.monthlyTimeline.map((payment, index) => <div className="timeline-row" key={index}><span>{payment.label}</span><strong>{index === 0 ? "Primer pago" : `Pago ${index + 1}`}</strong><strong>{money(payment.amountMxn)}</strong></div>)}</div></section>
    <section className="notice amber" style={{marginTop:18}}><strong>Datos faltantes o no incluidos</strong><ul className="unknown-list">
      {result.feesUnknown && <li>Comisiones: desconocidas; no se sumaron.</li>}
      {result.dueDateUnknown && <li>Fecha del primer pago: desconocida; el calendario muestra el orden, no fechas.</li>}
      <li>Otras deudas: no incluidas salvo los pagos que tú anotaste.</li>
    </ul></section>
    <p className="muted">El costo conocido suma {input.installmentAmountMxn === null ? "precio ÷ mensualidades" : "el pago mensual que ingresaste"} × {input.installmentCount} mensualidades{input.knownFeesMxn === null ? "; no incluye comisiones desconocidas." : ` + ${money(input.knownFeesMxn)} de comisiones conocidas.`}</p>
    <div className="notice">Mostrar consecuencias no significa dar permiso. Tú puedes cambiar el límite o continuar según tu criterio.</div>
    <div className="actions"><button className="btn secondary" onClick={onEdit}>Editar datos</button><button className="btn primary" onClick={onContinue}>Continuar de todos modos</button></div>
    <p className="footer-note">Tú decides. Pausa MX no bloquea compras ni decide por ti.</p>
  </section>;
}

function Metric({ title, value }: { title: string; value: string }) { return <div className="metric"><span>{title}</span><strong>{value}</strong></div>; }
