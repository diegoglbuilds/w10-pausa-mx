import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { explanationInputSchema } from "@/lib/schema";
import { simulatedExplanation } from "@/lib/explanation";

export const runtime = "nodejs";
const explanationOutputSchema = z.object({ explanation: z.string().min(1).max(500) });

export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const parsed = explanationInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Los datos explicativos no son válidos." }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ mode: "simulated", explanation: simulatedExplanation(parsed.data) });
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", temperature: 0, max_tokens: 180, response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Explain the supplied validated calculation in plain Spanish (Mexico). Do not change, recalculate, or recommend a status. Mention unknown assumptions. Never claim a purchase is safe, approved, or affordable. Return JSON with one short explanation string." },
          { role: "user", content: JSON.stringify(parsed.data) },
        ],
      }),
    });
    if (!response.ok) throw new Error("Explanation request failed");
    const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const candidate = JSON.parse(result.choices?.[0]?.message?.content ?? "{}");
    const explanation = explanationOutputSchema.parse(candidate).explanation;
    return NextResponse.json({ mode: "ai_assisted", explanation });
  } catch {
    return NextResponse.json({ mode: "simulated", explanation: simulatedExplanation(parsed.data) });
  }
}
