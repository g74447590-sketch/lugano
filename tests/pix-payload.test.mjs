import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadPixModule() {
  const source = await readFile(new URL("../app/pix.ts", import.meta.url), "utf8");
  const runnableSource = source.replaceAll(": string", "").replaceAll(": number", "");
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
  const { createPixPayload } = await loadPixModule();
  const payload = createPixPayload(1);
  const fields = readTlv(payload);

  assert.equal(fields.get("00"), "01");
  assert.equal(fields.get("01"), "11");
  assert.equal(fields.get("54"), "0.01");
  assert.equal(fields.get("58"), "BR");
  assert.match(fields.get("26") ?? "", /^0014br\.gov\.bcb\.pix0136[0-9a-f-]{36}$/);
  assert.match(fields.get("63") ?? "", /^[0-9A-F]{4}$/);
});
