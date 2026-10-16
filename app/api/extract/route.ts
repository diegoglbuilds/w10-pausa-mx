import { NextRequest, NextResponse } from "next/server";
import { extractedOfferSchema } from "@/lib/schema";

export const runtime = "nodejs";
const maxBytes = 4 * 1024 * 1024;
const types = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || !types.has(file.type) || file.size === 0 || file.size > maxBytes) {
    return NextResponse.json({ error: "Elige una imagen PNG, JPG o WebP de hasta 4 MB." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "La extracción requiere OPENAI_API_KEY en el servidor." }, { status: 503 });

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Read only visible installment offer fields from the image. Return JSON with priceMxn, installmentCount, installmentAmountMxn. Use null when uncertain or absent. Values must be numbers. Do not infer fees or other debts." },
          { role: "user", content: [{ type: "text", text: "Extract candidate offer fields only." }, { type: "image_url", image_url: { url: `data:${file.type};base64,${bytes.toString("base64")}` } }] },
        ],
      }),
    });
    if (!response.ok) throw new Error("Vision request failed");
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = JSON.parse(body.choices?.[0]?.message?.content ?? "{}");
    const candidates = extractedOfferSchema.parse({
      priceMxn: raw.priceMxn ?? null,
      installmentCount: raw.installmentCount ?? null,
      installmentAmountMxn: raw.installmentAmountMxn ?? null,
    });
    return NextResponse.json({ mode: "ai_assisted", candidates });
  } catch {
    return NextResponse.json({ mode: "simulated", candidates: simulatedCandidates() });
  }
}

function simulatedCandidates() {
  return { priceMxn: 3000, installmentCount: 6, installmentAmountMxn: 500 };
}
