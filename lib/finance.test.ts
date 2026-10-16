import { describe, expect, it } from "vitest";
import { calculateCheck } from "./finance";
import { purchaseSchema } from "./schema";

function input(limit: number | null = 2000, overrides: Record<string, unknown> = {}) {
  return purchaseSchema.parse({ priceMxn: 3000, installmentCount: 6, installmentAmountMxn: 500, firstDueDate: null,
    knownFeesMxn: null, essentialExpensesMxn: 300, existingMonthlyPaymentsMxn: 1200,
    selfSetMonthlyLimitMxn: limit, otherDebtsNotIncluded: true, source: "manual", confirmedByUser: true, ...overrides });
}

describe("deterministic installment check", () => {
  it("calculates known total from installments and known fees", () => {
    expect(calculateCheck(input(2000, { knownFeesMxn: 100 })).totalKnownCostMxn).toBe(3100);
  });
  it("does not lose cents from the known price when its monthly estimate is rounded", () => {
    const result = calculateCheck(input(2000, { priceMxn: 1, installmentCount: 3, installmentAmountMxn: null, existingMonthlyPaymentsMxn: 0, essentialExpensesMxn: 0 }));
    expect(result.monthlyPaymentMxn).toBe(0.33);
    expect(result.totalKnownCostMxn).toBe(1);
  });
  it("estimates a payment schedule and next month obligation deterministically", () => {
    const result = calculateCheck(input(), new Date(2026, 0, 15));
    expect(result.monthlyTimeline).toHaveLength(6);
    expect(result.monthlyTimeline.map((row) => row.amountMxn)).toEqual([500, 500, 500, 500, 500, 500]);
    expect(result.nextMonthKnownObligationMxn).toBe(1700);
  });
  it("preserves the entered date and caps month-end dates", () => {
    const result = calculateCheck(input(2000, { firstDueDate: "2026-01-31" }), new Date(2025, 11, 1));
    expect(result.monthlyTimeline.map((row) => row.date)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31", "2026-06-30"]);
  });
  it("includes a later installment due next month even when the first is this month", () => {
    const result = calculateCheck(input(2000, { firstDueDate: "2026-01-20" }), new Date(2026, 0, 15));
    expect(result.nextMonthKnownObligationMxn).toBe(1700);
  });
  it("changing the user limit changes only advisory outputs", () => {
    const within = calculateCheck(input(2500));
    const wait = calculateCheck(input(1000));
    expect(within.limitStatus).toBe("within");
    expect(wait.limitStatus).toBe("wait");
    expect({ total: within.totalKnownCostMxn, payment: within.monthlyPaymentMxn, timeline: within.monthlyTimeline, next: within.nextMonthKnownObligationMxn })
      .toEqual({ total: wait.totalKnownCostMxn, payment: wait.monthlyPaymentMxn, timeline: wait.monthlyTimeline, next: wait.nextMonthKnownObligationMxn });
  });
  it("uses simple review bands and a neutral no-limit state", () => {
    expect(calculateCheck(input(2400)).limitStatus).toBe("review");
    expect(calculateCheck(input(null)).limitStatus).toBe("no_limit");
  });
  it("keeps unknown fees and due dates visible in its result data", () => {
    const result = calculateCheck(input());
    expect(result.feesUnknown).toBe(true);
    expect(result.dueDateUnknown).toBe(true);
    expect(result.monthlyTimeline[0].date).toBeNull();
  });
  it("does not depend on AI or remote explanation", () => {
    expect(calculateCheck(input()).totalKnownCostMxn).toBe(3000);
  });
});
