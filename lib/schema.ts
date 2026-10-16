import { z } from "zod";

const money = z.number().positive().max(10_000_000);
const nonNegativeMoney = z.number().min(0).max(10_000_000);

export const purchaseSchema = z.object({
  priceMxn: money,
  installmentCount: z.number().int().min(1).max(48),
  installmentAmountMxn: money.nullable(),
  firstDueDate: z.string().nullable().refine((value) => value === null || isRealDate(value), "Ingresa una fecha real."),
  knownFeesMxn: nonNegativeMoney.nullable(),
  essentialExpensesMxn: nonNegativeMoney,
  existingMonthlyPaymentsMxn: nonNegativeMoney,
  selfSetMonthlyLimitMxn: money.nullable(),
  otherDebtsNotIncluded: z.literal(true),
  source: z.enum(["manual", "screenshot"]),
  confirmedByUser: z.boolean(),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;

export function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const screenshotRequestSchema = z.object({
  imageDataUrl: z.string().max(5_600_000).regex(/^data:image\/(png|jpeg|webp);base64,/),
});
