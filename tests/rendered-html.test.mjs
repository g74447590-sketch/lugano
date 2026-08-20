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
  assert.match(html, /<title>Lugano Clothing — Presença sem excesso<\/title>/i);
  assert.match(html, /Lugano Clothing/i);
  assert.match(html, /Presença/);
  assert.match(html, /5561991541080/);
  assert.match(html, /Star Hoodie Black/);
  assert.doesNotMatch(html, /Chocolate Lugano|cacau|Gramado/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/i);
});

test("keeps the storefront truthful, accessible, and deployable", async () => {
  const [page, layout, css, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const WHATSAPP_NUMBER = "5561991541080"/);
  assert.match(page, /aria-modal="true"|<dialog/);
  assert.match(page, /prefers-reduced-motion/);
  assert.doesNotMatch(page, /Carrinho|Favoritos|Chocolate Lugano/i);
  assert.doesNotMatch(page, /R\$\s*\d/);

  assert.match(layout, /Lugano Clothing — Presença sem excesso/);
  assert.match(layout, /metadataBase/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.menuOverlay/);
  assert.match(hosting, /appgprj_6a84a122a06881919a1fe2bbd371c407/);
});
