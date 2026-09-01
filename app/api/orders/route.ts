import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { emailOutbox, orderEvents, orderItems, orders } from "@/db/schema";
import { catalogProducts } from "@/app/catalog";

type IncomingItem = { productId?: string; size?: string; quantity?: number };

function clean(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown> & { items?: IncomingItem[] };
    const customerName = clean(body.customerName, 100);
    const customerEmail = clean(body.customerEmail, 160).toLowerCase();
    const customerPhone = clean(body.customerPhone, 24).replace(/[^0-9+]/g, "");
    const postalCode = clean(body.postalCode, 9).replace(/\D/g, "");
    const addressLine = clean(body.addressLine, 180);
    const city = clean(body.city, 80);
    const state = clean(body.state, 2).toUpperCase();
    if (!customerName || !customerEmail.includes("@") || customerPhone.length < 10 || postalCode.length !== 8 || !addressLine || !city || state.length !== 2) {
      return NextResponse.json({ error: "Revise os dados de contato e entrega." }, { status: 400 });
    }

    const items = (body.items ?? []).map((incoming) => {
      const product = catalogProducts.find((entry) => entry.id === incoming.productId && entry.priceCents);
      const quantity = Math.max(1, Math.min(5, Number(incoming.quantity) || 1));
      const size = clean(incoming.size, 4).toUpperCase();
      if (!product || !product.sizes?.includes(size)) return null;
      return { product, quantity, size };
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (!items.length || items.length !== body.items?.length) return NextResponse.json({ error: "Há um item inválido na sacola." }, { status: 400 });

    const subtotalCents = items.reduce((sum, item) => sum + (item.product.priceCents ?? 0) * item.quantity, 0);
    const now = new Date().toISOString();
    const accessToken = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const code = `LUG-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const db = getDb();
    const [created] = await db.insert(orders).values({ code, accessToken, customerName, customerEmail, customerPhone, postalCode, addressLine, city, state, subtotalCents, createdAt: now, updatedAt: now }).returning({ id: orders.id });
    await db.insert(orderItems).values(items.map((item) => ({ orderId: created.id, productId: item.product.id, productName: item.product.name, size: item.size, quantity: item.quantity, unitPriceCents: item.product.priceCents ?? 0 })));
    await db.insert(orderEvents).values({ orderId: created.id, type: "order_created", message: "Pedido recebido e aguardando cotação do frete.", createdAt: now });
    await db.insert(emailOutbox).values({ orderId: created.id, eventKey: "order_created", recipient: customerEmail, subject: `${code} recebido pela Lugano`, template: "order_created", createdAt: now });
    return NextResponse.json({ code, url: `/pedido/${accessToken}` }, { status: 201 });
  } catch (error) {
    console.error("order_create_failed", error);
    return NextResponse.json({ error: "Não foi possível criar o pedido agora." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (token.length < 40) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  const db = getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.accessToken, token) });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json(order);
}
