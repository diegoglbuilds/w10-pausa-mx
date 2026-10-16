import type { PurchaseInput } from "./schema";

export type LimitStatus = "within" | "review" | "wait" | "no_limit";
export type Payment = { label: string; date: string | null; amountMxn: number };
export type CheckResult = {
  totalKnownCostMxn: number;
  monthlyPaymentMxn: number;
  monthlyTimeline: Payment[];
  nextMonthKnownObligationMxn: number;
  existingMonthlyPaymentsMxn: number;
  monthlyBaselineMxn: number;
  monthlyTotalWithPurchaseMxn: number;
  selfSetMonthlyLimitMxn: number | null;
  remainingRoomMxn: number | null;
  limitStatus: LimitStatus;
  feesUnknown: boolean;
  dueDateUnknown: boolean;
};

export function calculateCheck(input: PurchaseInput, referenceDate = new Date()): CheckResult {
  const monthlyPaymentMxn = input.installmentAmountMxn ?? round(input.priceMxn / input.installmentCount);
  const totalKnownCostMxn = round((input.installmentAmountMxn === null ? input.priceMxn : monthlyPaymentMxn * input.installmentCount) + (input.knownFeesMxn ?? 0));
  const timeline = Array.from({ length: input.installmentCount }, (_, index) => {
    const due = input.firstDueDate ? addMonths(input.firstDueDate, index) : null;
    return { label: due ? formatMonth(due) : `Pago ${index + 1}`, date: due, amountMxn: monthlyPaymentMxn };
  });
  const nextMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  const nextMonthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 2, 0);
  const newPaymentDueNextMonth = input.firstDueDate === null || timeline.some(({ date }) => {
    if (!date) return false;
    const due = parseDate(date);
    return due >= nextMonth && due <= nextMonthEnd;
  });
  const nextMonthKnownObligationMxn = round(input.existingMonthlyPaymentsMxn + (newPaymentDueNextMonth ? monthlyPaymentMxn : 0));
  const monthlyBaselineMxn = round(input.essentialExpensesMxn + input.existingMonthlyPaymentsMxn);
  const monthlyTotalWithPurchaseMxn = round(monthlyBaselineMxn + monthlyPaymentMxn);
  const limit = input.selfSetMonthlyLimitMxn;
  const remainingRoomMxn = limit === null ? null : round(limit - monthlyTotalWithPurchaseMxn);
  let limitStatus: LimitStatus = "no_limit";
  if (limit !== null) {
    const ratio = monthlyTotalWithPurchaseMxn / limit;
    // Advisory bands: at or below 80% is within; above 80% through 100% is review; above 100% is wait.
    limitStatus = ratio <= 0.8 ? "within" : ratio <= 1 ? "review" : "wait";
  }
  return {
    totalKnownCostMxn, monthlyPaymentMxn, monthlyTimeline: timeline, nextMonthKnownObligationMxn,
    existingMonthlyPaymentsMxn: input.existingMonthlyPaymentsMxn, monthlyBaselineMxn, monthlyTotalWithPurchaseMxn,
    selfSetMonthlyLimitMxn: limit, remainingRoomMxn, limitStatus,
    feesUnknown: input.knownFeesMxn === null, dueDateUnknown: input.firstDueDate === null,
  };
}

function round(value: number): number { return Math.round((value + Number.EPSILON) * 100) / 100; }
function parseDate(value: string): Date { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); }
function addMonths(value: string, offset: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + offset, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}
function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}
