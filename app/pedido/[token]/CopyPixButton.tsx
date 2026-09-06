"use client";

import { useState } from "react";

export function CopyPixButton({ payload }: { payload: string }) {
  const [copied, setCopied] = useState(false);
  async function copyPix() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }
  return <button type="button" onClick={copyPix}>{copied ? "Código Pix copiado" : "Copiar código Pix"}</button>;
}
