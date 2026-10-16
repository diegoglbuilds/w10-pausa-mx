import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";
import { ScreenshotPath } from "./screenshot-path";
import { ResultView } from "./result-view";
import { ComprehensionCheck } from "./comprehension-check";
import { ManualForm } from "./manual-form";
import { ResultExplanation } from "./result-explanation";
import { purchaseSchema } from "@/lib/schema";
import { calculateCheck } from "@/lib/finance";

const entry = purchaseSchema.parse({ priceMxn: 3000, installmentCount: 6, installmentAmountMxn: 500, firstDueDate: null, knownFeesMxn: null, essentialExpensesMxn: 300, existingMonthlyPaymentsMxn: 1200, selfSetMonthlyLimitMxn: 1000, otherDebtsNotIncluded: true, source: "manual", confirmedByUser: true });

describe("buyer-first product constraints", () => {
  it("does not claim complete debt visibility and exposes the shadow clause", () => {
    render(<Home />);
    expect(screen.getByText(/no ve todas tus deudas/i)).toBeInTheDocument();
    expect(screen.getByText(/no bloquea compras ni decide por ti/i)).toBeInTheDocument();
    expect(screen.queryByText(/panorama financiero completo/i)).not.toBeInTheDocument();
  });
  it("has no lender or retailer referral links", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll("a[href]")).toHaveLength(0);
  });
  it("keeps a continue action when status is wait", () => {
    render(<ResultView input={entry} onEdit={() => {}} onContinue={() => {}} />);
    expect(screen.getByText(/explicación simulada/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Espera" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar de todos modos/i })).toBeEnabled();
  });
  it("surfaces unknown fees, omitted debts, and the next-month date assumption", () => {
    render(<ResultView input={entry} onEdit={() => {}} onContinue={() => {}} />);
    expect(screen.getByText(/comisiones: desconocidas/i)).toBeInTheDocument();
    expect(screen.getByText(/otras deudas: no incluidas/i)).toBeInTheDocument();
    expect(screen.getByText(/asumimos una mensualidad el próximo mes/i)).toBeInTheDocument();
    expect(screen.getByText(/pagos estimados el próximo mes/i)).toBeInTheDocument();
  });
  it("shows no hidden financial risk score", () => {
    const { container } = render(<Home />);
    expect(container.textContent?.toLowerCase()).not.toContain("score");
    expect(container.textContent?.toLowerCase()).not.toContain("puntaje de riesgo");
  });
  it("requires the user to state essential expenses and existing payments", () => {
    render(<ManualForm onSubmit={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /ver mi resultado/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/indica tus gastos esenciales/i);
    expect(screen.getByRole("alert")).toHaveTextContent(/indica tus pagos actuales/i);
  });
  it("does not treat blank known fees as confirmed zero", () => {
    const onSubmit = vi.fn();
    render(<ManualForm onSubmit={onSubmit} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText(/precio de compra/i), { target: { value: "3000" } });
    fireEvent.change(screen.getByLabelText(/gastos esenciales mensuales/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/pagos actuales a meses/i), { target: { value: "0" } });
    fireEvent.click(screen.getByLabelText(/no conozco las comisiones/i));
    fireEvent.click(screen.getByRole("button", { name: /ver mi resultado/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/indica las comisiones conocidas o marca que no las conoces/i);

    fireEvent.change(screen.getByLabelText(/comisiones conocidas/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /ver mi resultado/i }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ knownFeesMxn: 0 }));
  });
  it("explains what the optional monthly maximum is compared against", () => {
    render(<ManualForm onSubmit={() => {}} onBack={() => {}} />);
    expect(screen.getByLabelText(/tu máximo mensual/i)).toBeInTheDocument();
    expect(screen.getByText(/define cuánto quieres destinar en total al mes.*gastos esenciales, pagos actuales y esta compra/i)).toBeInTheDocument();
  });
  it("checks comprehension without blocking continuation", () => {
    render(<ComprehensionCheck result={calculateCheck(entry)} onBack={() => {}} onContinue={() => {}} />);
    expect(screen.getByLabelText(/¿cuánto pagarías en total/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿cuánto se suma a tus pagos el próximo mes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿qué dato sigue faltando/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar de todos modos/i })).toBeEnabled();
  });
  it("grades correct answers as comprehension, not a financial score", () => {
    render(<ComprehensionCheck result={calculateCheck(entry)} onBack={() => {}} onContinue={() => {}} />);
    fireEvent.change(screen.getByLabelText(/¿cuánto pagarías en total/i), { target: { value: "3000" } });
    fireEvent.change(screen.getByLabelText(/¿cuánto se suma a tus pagos el próximo mes/i), { target: { value: "1700" } });
    fireEvent.change(screen.getByLabelText(/¿qué dato sigue faltando/i), { target: { value: "yes" } });
    fireEvent.click(screen.getByRole("button", { name: /revisar respuestas/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/entendiste/i);
  });
  it("sends only validated calculations after an explicit AI explanation request", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ configured: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ mode: "ai_assisted", explanation: "Explicación breve." }) });
    vi.stubGlobal("fetch", fetchMock);
    const explanationInput = { limitStatus: "wait" as const, totalKnownCostMxn: 3000, monthlyPaymentMxn: 500, nextMonthKnownObligationMxn: 1700, feesUnknown: true, dueDateUnknown: true, otherDebtsNotIncluded: true as const };
    render(<ResultExplanation input={explanationInput} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /pedir explicación con ia/i })).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /pedir explicación con ia/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST", body: JSON.stringify(explanationInput) });
    expect(screen.getByText("Explicación breve.")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe("screenshot contract", () => {
  it("rejects invalid image types before upload", () => {
    render(<ScreenshotPath onConfirmed={() => {}} onBack={() => {}} />);
    const input = screen.getByLabelText(/imagen de la oferta/i);
    fireEvent.change(input, { target: { files: [new File(["not image"], "offer.gif", { type: "image/gif" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent(/png, jpg o webp/i);
    fireEvent.change(input, { target: { files: [new File([new Uint8Array(4 * 1024 * 1024 + 1)], "oversize.png", { type: "image/png" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent(/hasta 4 mb/i);
  });
  it("shows simulated AI output and requires confirmation per candidate", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ configured: false }) });
    vi.stubGlobal("fetch", fetchMock);
    const onConfirmed = vi.fn();
    render(<ScreenshotPath onConfirmed={onConfirmed} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText(/imagen de la oferta/i), { target: { files: [new File(["sample"], "offer.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: /leer campos candidatos/i }));
    await waitFor(() => expect(screen.getByText(/extracción simulada/i)).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/extract");
    const button = screen.getByRole("button", { name: /continuar con valores confirmados/i });
    expect(button).toBeDisabled();
    const checks = screen.getAllByRole("checkbox");
    checks.forEach((check) => fireEvent.click(check));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onConfirmed).toHaveBeenCalledWith({ priceMxn: 3000, installmentCount: 6, installmentAmountMxn: 500 }, expect.stringMatching(/simulado/i));
    vi.unstubAllGlobals();
  });
});
