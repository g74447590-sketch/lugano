import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Lugano Clothing homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Bonés Lugano Clothing — Presença sem excesso<\/title>/i);
  assert.match(html, /Lugano Clothing/i);
  assert.match(html, /Presença/);
  assert.match(html, /5561991541080/);
  assert.match(html, /Monaco/);
  assert.match(html, /R\$ 117/);
  assert.match(html, /Cursivo Preto/);
  assert.match(html, /Cursivo Branco/);
  assert.match(html, /lugano-cursivo-branco\.png/);
  assert.match(html, /Tutto passa/);
  assert.match(html, /lugano-tutto-passa-marinho\.png/);
  assert.match(html, /Cursivo Azul-Escuro/);
  assert.match(html, /Club Cap Preto/);
  assert.match(html, /Frete e prazo confirmados por WhatsApp antes do pagamento/);
  assert.match(html, /A Lugano não inventa depoimentos/);
  assert.match(html, /R\$ 80/);
  assert.doesNotMatch(html, /Star Hoodie|Essential Tee|Riviera|Camisetas|Moletons|Óculos/i);
  assert.doesNotMatch(html, /Chocolate Lugano|cacau|Gramado/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/i);

  const origin = "https://lugano-clothing.g74447590.workers.dev";
  const metaTags = html.match(/<(?:meta|link)\b[^>]*>/g) ?? [];
  const canonical = metaTags.find((tag) => tag.includes('rel="canonical"'));
  assert.equal(new URL(canonical?.match(/href="([^"]+)"/)?.[1] ?? "http://invalid").href, `${origin}/`);
  for (const [name, path] of [["og:url", "/"], ["og:image", "/og-v2.png"], ["twitter:image", "/og-v2.png"]]) {
    const tag = metaTags.find((value) => value.includes(`="${name}"`));
    assert.equal(new URL(tag?.match(/content="([^"]+)"/)?.[1] ?? "http://invalid").href, `${origin}${path}`, `${name} must use the official origin`);
  }
  assert.doesNotMatch(metaTags.join("\n"), /carlossergiogomesferreira|chatgpt\.site/);
  for (const id of ["collection", "manifesto", "destaques", "como-comprar"]) {
    assert.match(html, new RegExp(`<section[^>]*id="${id}"`));
  }
  assert.match(html, /Trocas e Devoluções/);
  assert.match(html, /<b id="entrega-title">Entregas<\/b>/);
  assert.match(html, /Privacidade/);
  assert.match(html, /https:\/\/instagram\.com\/lugano_coo/);
  assert.match(html, /Precisa de ajuda\?/);

  const images = html.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(images.length, 12);
  for (const [index, tag] of images.entries()) {
    const widths = [...tag.matchAll(/(?:&amp;|&)w=(\d+)/g)].map((match) => Number(match[1]));
    const cap = index === 0 ? 1200 : 800;
    assert.ok(widths.length > 0);
    assert.ok(widths.every((width) => width <= cap));
    assert.ok(widths.includes(cap));
    assert.ok(tag.includes(`loading="${index === 0 ? "eager" : "lazy"}"`));
  }
});

test("keeps the storefront truthful, accessible, and deployable", async () => {
  const [page, catalog, layout, css, hosting, chatRoute] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/chat/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const WHATSAPP_NUMBER = "5561991541080"/);
  assert.match(page, /aria-modal="true"|<dialog/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(page, /Continuar pedido/);
  assert.match(page, /Solicitar pedido/);
  assert.match(page, /Dados de entrega/);
  assert.doesNotMatch(page, /Etapa 1 de 2/);
  assert.match(page, /lugano-club-cap-branco-lc-preto-clean\.jpg/);
  assert.match(page, /Club Cap Branco da Lugano Clothing com monograma LC/);
  assert.match(page, /className="cartButton"/);
  assert.doesNotMatch(page, /<b>Explore<\/b>/);
  assert.match(page, /darkMode \? "◑" : "◐"/);
  assert.match(page, /darkMode \? "Claro" : "Escuro"/);
  assert.doesNotMatch(page, /Favoritos|Chocolate Lugano/i);
  assert.doesNotMatch(catalog, /Star Drop|price: "R\$ 96"/);
  assert.match(catalog, /Club Cap Branco[\s\S]*price: "R\$ 75"/);
  assert.match(catalog, /Club Cap Azul-Marinho[\s\S]*price: "R\$ 75"/);
  assert.match(catalog, /Club Cap Preto[\s\S]*price: "R\$ 75"/);
  assert.match(catalog, /lugano-club-cap-preto-lc-clean\.jpg/);
  assert.match(catalog, /lugano-club-cap-branco-lc-preto-clean\.jpg/);
  assert.match(catalog, /lugano-club-cap-navy-lc-only\.png/);
  assert.match(catalog, /lugano-monaco-navy-bordado\.png/);
  assert.doesNotMatch(catalog, /lugano-bone-tactel-v3-logo-correta\.png|lugano-oculos\.png/);
  assert.match(catalog, /price: "R\$ 117"/);
  assert.equal((catalog.match(/id: "/g) ?? []).length, 8);
  assert.equal((catalog.match(/priceCents: 8000, price: "R\$ 80"/g) ?? []).length, 4);
  assert.match(catalog, /id: "cursivo-white", name: "Cursivo Branco", line: "Boné · Branco", priceCents: 8000/);
  assert.match(catalog, /id: "tutto-passa-navy", name: "Tutto passa", line: "Boné · Azul-marinho", priceCents: 8000/);
  assert.match(catalog, /lugano-cursivo-preto\.png/);
  assert.match(catalog, /lugano-cursivo-azul-escuro\.png/);
  assert.doesNotMatch(catalog, /Hoodie|Tee|Riviera/);
  assert.doesNotMatch(catalog, /R\$\s*(?:63,90|29,90|125,00)/);

  assert.match(layout, /title: "Bonés Lugano Clothing — Presença sem excesso"/);
  assert.match(layout, /openGraph:[\s\S]*title: "Lugano Clothing — Presença sem excesso"/);
  assert.match(layout, /metadataBase/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.menuOverlay/);
  assert.match(css, /\.storeChatPanel/);
  assert.match(css, /\.storeChat \{[^}]*z-index: 70/);
  assert.doesNotMatch(chatRoute, /Não diga que é uma IA/);
  assert.match(chatRoute, /https:\/\/lugano-clothing\.g74447590\.workers\.dev/);
  assert.doesNotMatch(chatRoute, /chatgpt\.site/);
  assert.match(hosting, /appgprj_6a84a122a06881919a1fe2bbd371c407/);
  assert.match(hosting, /"d1"\s*:\s*"DB"/);
});
