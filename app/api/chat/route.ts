import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { catalogProducts } from "@/app/catalog";

type ChatMessage = { role?: "user" | "assistant"; content?: string };
type AiBinding = {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
};

const HANDOFF_PATTERN = /\b(estoque|dispon[ií]vel|disponibilidade|frete|cep|prazo|entrega hoje|pix|pagamento|comprovante|atendente|pessoa|humano|troca do meu pedido|meu pedido|voc[eê]s\s+t[eê]m|t[eê]m\s+(?:bon[eê]|produto))\b/i;
const CHAT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const ALLOWED_ORIGINS = new Set([
  "https://lugano-clothing.g74447590.workers.dev",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  return origin && ALLOWED_ORIGINS.has(origin)
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" }
    : {};
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

const storeFacts = [
  "A Lugano Clothing vende bonés e envia para todo o Brasil.",
  "O cliente escolhe o produto, adiciona à sacola e solicita o pedido pelo site.",
  "Disponibilidade, frete e prazo são confirmados antes do pagamento.",
  "Trocas são aceitas em até 7 dias após o recebimento, para produto sem uso e na embalagem original.",
  "Dados do cliente são usados somente para processar o pedido e não são compartilhados com terceiros.",
  ...catalogProducts.map((product) => `${product.name}: ${product.price ?? "preço sob consulta"}; ${product.line}; ${product.sizes?.join(", ") ?? "tamanho sob consulta"}.`),
].join("\n");

function cleanMessages(value: unknown): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(value)) return [];
  return value.slice(-4).flatMap((entry: ChatMessage) => {
    if ((entry?.role !== "user" && entry?.role !== "assistant") || typeof entry.content !== "string") return [];
    const content = entry.content.trim().replace(/\s+/g, " ").slice(0, 500);
    return content ? [{ role: entry.role, content }] : [];
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: unknown };
    const messages = cleanMessages(body.messages);
    const latest = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
    if (!latest) return NextResponse.json({ error: "Escreva uma pergunta para continuar." }, { status: 400, headers: corsHeaders(request) });

    if (HANDOFF_PATTERN.test(latest)) {
      return NextResponse.json({
        answer: "Para confirmar essa informação com segurança, vou encaminhar você para nossa equipe no WhatsApp.",
        handoff: true,
      }, { headers: corsHeaders(request) });
    }

    const ai = (env as unknown as { AI?: AiBinding }).AI;
    if (!ai) {
      return NextResponse.json({
        answer: "O atendimento automático está temporariamente indisponível. Nossa equipe pode continuar com você pelo WhatsApp.",
        handoff: true,
      }, { headers: corsHeaders(request) });
    }

    const result = await ai.run(CHAT_MODEL, {
      messages: [
        {
          role: "system",
          content: `Você atende clientes da Lugano Clothing em português do Brasil. Responda em no máximo 60 palavras, com tom claro e cordial. Use somente os fatos abaixo. Nunca invente preço, estoque, frete, prazo, promoção, política ou situação de pedido. Se não houver informação suficiente, diga que a equipe continuará pelo WhatsApp e termine com a marca [ATENDIMENTO].\n\nFATOS CONFIRMADOS:\n${storeFacts}`,
        },
        ...messages,
      ],
      max_tokens: 140,
      temperature: 0.2,
    });

    const candidate = result as { response?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
    const raw = typeof candidate.response === "string"
      ? candidate.response
      : candidate.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || !raw.trim()) throw new Error("Empty AI response");
    const handoff = raw.includes("[ATENDIMENTO]");
    const answer = raw.replaceAll("[ATENDIMENTO]", "").trim().slice(0, 700);
    return NextResponse.json({ answer, handoff }, { headers: { ...corsHeaders(request), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("store_chat_failed", error);
    return NextResponse.json({
      answer: "Não consegui responder agora. Nossa equipe pode continuar com você pelo WhatsApp.",
      handoff: true,
    }, { headers: corsHeaders(request) });
  }
}
