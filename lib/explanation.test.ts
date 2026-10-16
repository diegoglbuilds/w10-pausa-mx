import { describe, expect, it } from "vitest";
import { simulatedExplanation } from "./explanation";
import { explanationInputSchema } from "./schema";

describe("simulated result explanation", () => {
  it("explains only validated calculations and explicitly preserves unknowns", () => {
    const input = explanationInputSchema.parse({ limitStatus: "review", totalKnownCostMxn: 3000, monthlyPaymentMxn: 500, nextMonthKnownObligationMxn: 1700, feesUnknown: true, dueDateUnknown: true, otherDebtsNotIncluded: true });
    const explanation = simulatedExplanation(input);
    expect(explanation).toContain("se acercan al límite");
    expect(explanation).toContain("$3,000.00");
    expect(explanation).toContain("$1,700.00");
    expect(explanation).toContain("las comisiones siguen desconocidas");
    expect(explanation).toContain("otras deudas podrían no estar incluidas");
  });
});
