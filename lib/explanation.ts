import type { ExplanationInput } from "./schema";

const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export function simulatedExplanation(input: ExplanationInput): string {
  const status = {
    within: "Los datos que incluiste quedan dentro del límite que definiste.",
    review: "Los datos que incluiste se acercan al límite que definiste.",
    wait: "Los datos que incluiste superan el límite que definiste.",
    no_limit: "No definiste un límite mensual, así que no hay comparación de límite.",
  }[input.limitStatus];
  const unknowns = [
    input.feesUnknown ? "las comisiones siguen desconocidas" : "",
    input.dueDateUnknown ? "la fecha del primer pago sigue desconocida" : "",
    input.otherDebtsNotIncluded ? "otras deudas podrían no estar incluidas" : "",
  ].filter(Boolean).join("; ");
  return `${status} El costo conocido es ${money(input.totalKnownCostMxn)} y el próximo mes se estiman ${money(input.nextMonthKnownObligationMxn)} en pagos. ${unknowns}. El límite solo cambia el aviso, no estos cálculos.`;
}
