import { describe, expect, it } from "vitest";
import { isRealDate, purchaseSchema, extractedOfferSchema } from "./schema";

const valid = {
  priceMxn: 3000, installmentCount: 6, installmentAmountMxn: 500, firstDueDate: null,
  knownFeesMxn: null, essentialExpensesMxn: 0, existingMonthlyPaymentsMxn: 1200,
  selfSetMonthlyLimitMxn: 2000, otherDebtsNotIncluded: true, source: "manual" as const, confirmedByUser: true,
};

describe("purchase input security floor", () => {
  it("requires a positive price", () => { expect(purchaseSchema.safeParse({ ...valid, priceMxn: 0 }).success).toBe(false); });
  it("bounds installment count to 1–48", () => {
    expect(purchaseSchema.safeParse({ ...valid, installmentCount: 0 }).success).toBe(false);
    expect(purchaseSchema.safeParse({ ...valid, installmentCount: 49 }).success).toBe(false);
  });
  it("requires a positive installment amount when present", () => { expect(purchaseSchema.safeParse({ ...valid, installmentAmountMxn: 0 }).success).toBe(false); });
  it("rejects impossible calendar dates", () => {
    expect(isRealDate("2026-02-30")).toBe(false);
    expect(purchaseSchema.safeParse({ ...valid, firstDueDate: "2026-02-30" }).success).toBe(false);
  });
  it("allows fees to remain explicitly unknown", () => { expect(purchaseSchema.safeParse({ ...valid, knownFeesMxn: null }).success).toBe(true); });
  it("keeps other obligations explicitly incomplete", () => {
    expect(purchaseSchema.safeParse({ ...valid, otherDebtsNotIncluded: true }).success).toBe(true);
    expect(purchaseSchema.safeParse({ ...valid, otherDebtsNotIncluded: false }).success).toBe(false);
  });
  it("validates candidate extraction fields as bounded values or unknown", () => {
    expect(extractedOfferSchema.safeParse({ priceMxn: 3000, installmentCount: 6, installmentAmountMxn: null }).success).toBe(true);
    expect(extractedOfferSchema.safeParse({ priceMxn: -2, installmentCount: 90, installmentAmountMxn: 0 }).success).toBe(false);
  });
});
