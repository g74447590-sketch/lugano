type EmailEnv = {
  DB: D1Database;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  SITE_URL?: string;
};

type PendingEmail = {
  id: number;
  recipient: string;
  subject: string;
  template: string;
  code: string;
  access_token: string;
  customer_name: string;
};

export async function processEmailOutbox(env: EmailEnv) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return;
  const result = await env.DB.prepare(`
    SELECT e.id, e.recipient, e.subject, e.template,
           o.code, o.access_token, o.customer_name
    FROM email_outbox e
    JOIN orders o ON o.id = e.order_id
    WHERE e.status = 'pending' AND e.attempts < 3
    ORDER BY e.created_at ASC
    LIMIT 20
  `).all<PendingEmail>();
  const siteUrl = (env.SITE_URL || "https://lugano-clothing.g74447590.workers.dev").replace(/\/$/, "");
  for (const email of result.results) {
    const orderUrl = `${siteUrl}/pedido/${email.access_token}`;
    const isQuote = email.template === "shipping_confirmed";
    const title = isQuote ? "Seu frete foi confirmado" : "Recebemos seu pedido";
    const message = isQuote ? "O valor total já está disponível para conferência." : "Agora vamos confirmar disponibilidade, frete e prazo.";
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [email.recipient],
          subject: email.subject,
          text: `${title}\n\nOlá, ${email.customer_name}. ${message}\n\nAcompanhe ${email.code}: ${orderUrl}`,
          html: `<div style="background:#f0efe9;padding:36px;font-family:Arial,sans-serif;color:#0b1520"><p style="letter-spacing:.16em;font-weight:700">LUGANO CLOTHING</p><h1>${title}</h1><p>Olá, ${escapeHtml(email.customer_name)}. ${message}</p><p><a href="${orderUrl}" style="display:inline-block;background:#0b1520;color:#fff;padding:14px 20px;text-decoration:none">Acompanhar ${email.code}</a></p><small>Mensagem automática relacionada ao seu pedido.</small></div>`,
        }),
      });
      if (!response.ok) throw new Error(`Resend ${response.status}`);
      await env.DB.prepare("UPDATE email_outbox SET status = 'sent', sent_at = ?, attempts = attempts + 1 WHERE id = ? AND status = 'pending'").bind(new Date().toISOString(), email.id).run();
    } catch (error) {
      console.error("email_send_failed", email.id, error);
      await env.DB.prepare("UPDATE email_outbox SET attempts = attempts + 1, status = CASE WHEN attempts + 1 >= 3 THEN 'failed' ELSE 'pending' END WHERE id = ?").bind(email.id).run();
    }
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}
