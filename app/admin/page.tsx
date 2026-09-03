import { desc } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { formatMoney } from "@/app/catalog";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const db = getDb();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  return <main className="adminPage"><aside><Link href="/" className="adminBrand">LUGANO <span>ADMIN</span></Link><nav><Link className="active" href="/admin">Pedidos</Link><Link href="/">Ver loja</Link></nav><footer><span>{user.email}</span><a href={chatGPTSignOutPath("/")}>Sair</a></footer></aside><section className="adminContent"><header><div><p>Operação</p><h1>Pedidos</h1></div><span>{rows.length} pedidos</span></header>{rows.length === 0 ? <div className="adminEmpty"><h2>Nenhum pedido ainda</h2><p>Os novos pedidos da loja aparecerão aqui.</p></div> : <div className="orderTable">{rows.map((order) => <article key={order.id}><div><strong>{order.code}</strong><span>{order.customerName} · {order.city}/{order.state}</span><small>{new Date(order.createdAt).toLocaleString("pt-BR")}</small></div><div><span>{order.status === "awaiting_quote" ? "Cotando frete" : "Aguardando pagamento"}</span><b>{order.totalCents == null ? formatMoney(order.subtotalCents) : formatMoney(order.totalCents)}</b></div>{order.status === "awaiting_quote" && <form method="post" action={`/api/admin/orders/${order.id}/quote`}><label>Frete em reais<input name="shipping" inputMode="decimal" placeholder="25,00" required /></label><label>Prazo em dias<input name="days" inputMode="numeric" placeholder="7" required /></label><button type="submit">Confirmar frete</button></form>}<Link href={`/pedido/${order.accessToken}`} target="_blank" rel="noreferrer">Ver pedido</Link></article>)}</div>}</section></main>;
}
