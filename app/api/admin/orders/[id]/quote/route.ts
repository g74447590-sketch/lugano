import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { emailOutbox, orderEvents, orders } from "@/db/schema";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return new Response("Não autorizado", { status: 401 });
  const { id } = await params;
  const orderId = Number(id);
  const form = await request.formData();
  const shippingText = String(form.get("shipping") ?? "").replace(".", "").replace(",", ".");
  const shippingCents = Math.round(Number(shippingText) * 100);
  const shippingDays = Math.round(Number(form.get("days")));
  if (!Number.isInteger(orderId) || !Number.isFinite(shippingCents) || shippingCents < 0 || shippingCents > 100000 || shippingDays < 1 || shippingDays > 90) return new Response("Cotação inválida", { status: 400 });
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "awaiting_quote") return new Response("Pedido indisponível", { status: 409 });
  const now = new Date().toISOString();
  await db.update(orders).set({ shippingCents, shippingDays, totalCents: order.subtotalCents + shippingCents, status: "awaiting_payment", updatedAt: now }).where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({ orderId, type: "shipping_confirmed", message: "Frete confirmado. Pagamento liberado em modo de teste.", createdAt: now });
  await db.insert(emailOutbox).values({ orderId, eventKey: "shipping_confirmed", recipient: order.customerEmail, subject: `${order.code}: frete confirmado`, template: "shipping_confirmed", createdAt: now }).onConflictDoNothing();
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
