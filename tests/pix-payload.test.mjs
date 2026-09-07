import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadPixModule() {
  const source = await readFile(new URL("../app/pix.ts", import.meta.url), "utf8");
  const runnableSource = source
    .replace(/export type PixConfig = \{[\s\S]*?\};\r?\n\r?\n/, "")
    .replaceAll(": Partial<PixConfig>", "")
    .replaceAll(": PixConfig | null", "")
    .replaceAll(": PixConfig", "")
    .replaceAll(": string", "")
    .replaceAll(": number", "");
  return import(`data:text/javascript,${encodeURIComponent(runnableSource)}`);
}

function readTlv(payload) {
  const fields = new Map();
  for (let index = 0; index < payload.length;) {
    const tag = payload.slice(index, index + 2);
    const length = Number(payload.slice(index + 2, index + 4));
    assert.ok(Number.isInteger(length), `invalid length for tag ${tag}`);
    const value = payload.slice(index + 4, index + 4 + length);
    assert.equal(value.length, length, `truncated value for tag ${tag}`);
    fields.set(tag, value);
    index += 4 + length;
  }
  return fields;
}

test("generates a valid fixed-value Pix payload", async () => {
  const { createPixPayload, getPixConfig } = await loadPixModule();
  const config = getPixConfig({ key: "123.456.789-09", receiverName: "Gabriel Alves Ferreira", receiverCity: "Brasilia" });
  assert.ok(config);
  assert.equal(config.key.length, 11);
  const payload = createPixPayload(1, config, "PIX-TEST-001");
  const fields = readTlv(payload);

  assert.equal(fields.get("00"), "01");
  assert.equal(fields.get("01"), "11");
  assert.equal(fields.get("54"), "0.01");
  assert.equal(fields.get("58"), "BR");
  assert.match(fields.get("26") ?? "", /^0014br\.gov\.bcb\.pix0111\d{11}$/);
  const additionalFields = readTlv(fields.get("62") ?? "");
  assert.match(additionalFields.get("05") ?? "", /^[A-Z0-9]{1,25}$/);
  assert.match(fields.get("63") ?? "", /^[0-9A-F]{4}$/);
});

test("does not generate Pix without a complete receiver configuration", async () => {
  const { getPixConfig } = await loadPixModule();
  assert.equal(getPixConfig({ key: "only-a-key" }), null);
});
