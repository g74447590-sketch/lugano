import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { orderEvents, orderItems, orders } from "@/db/schema";
import { formatMoney } from "@/app/catalog";
import "./pedido.css";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  awaiting_quote: "Aguardando cotação do frete",
  awaiting_payment: "Aguardando pagamento",
  payment_pending: "Pagamento em análise",
  paid: "Pagamento aprovado",
  preparing: "Pedido em preparação",
  shipped: "Pedido enviado",
  cancelled: "Pedido cancelado",
};

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/i.test(token)) notFound();
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token)).limit(1);
  if (!order) notFound();
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt)),
  ]);
  const quoteReady = order.status === "awaiting_payment" && order.totalCents != null;

  return <main className="orderPage">
    <header><Link href="/" className="orderBrand">LUGANO <span>CLOTHING</span></Link><Link href="/">Voltar à loja</Link></header>
    <section className="orderHero"><p>Pedido {order.code}</p><h1>{statusLabels[order.status] ?? order.status}</h1><span>Última atualização: {new Date(order.updatedAt).toLocaleString("pt-BR")}</span></section>
    <div className="orderGrid">
      <section className="orderCard"><h2>Resumo</h2>{items.map((item) => <article key={item.id}><div><strong>{item.productName}</strong><span>Tamanho {item.size} · Quantidade {item.quantity}</span></div><b>{formatMoney(item.unitPriceCents * item.quantity)}</b></article>)}<dl><div><dt>Subtotal</dt><dd>{formatMoney(order.subtotalCents)}</dd></div><div><dt>Frete</dt><dd>{order.shippingCents == null ? "Em cotação" : formatMoney(order.shippingCents)}</dd></div><div className="orderTotal"><dt>Total</dt><dd>{order.totalCents == null ? "A confirmar" : formatMoney(order.totalCents)}</dd></div></dl></section>
      <aside className="paymentCard"><p>Pagamento</p>{quoteReady ? <><h2>Total confirmado</h2><strong>{formatMoney(order.totalCents!)}</strong><button type="button" disabled>Pix dinâmico · modo de teste</button><small>O pagamento real ainda não está ativo. Nenhuma cobrança será feita.</small></> : <><h2>Aguardando o fornecedor</h2><p>Assim que o frete for confirmado, o valor total e a opção de pagamento aparecerão aqui.</p><span className="waitingPulse">Cotação em andamento</span></>}</aside>
      <section className="orderCard orderTimeline"><h2>Atualizações</h2>{events.map((event) => <div key={event.id}><i /><p><strong>{event.message}</strong><span>{new Date(event.createdAt).toLocaleString("pt-BR")}</span></p></div>)}</section>
      <section className="orderCard"><h2>Entrega</h2><p>{order.addressLine}<br />{order.city} · {order.state}<br />CEP {order.postalCode.replace(/(\d{5})(\d{3})/, "$1-$2")}</p>{order.shippingDays && <p>Prazo informado: {order.shippingDays} dias após a postagem.</p>}</section>
    </div>
  </main>;
}
