"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string; handoff?: boolean };

const WHATSAPP_NUMBER = "5561991541080";
const CHAT_ENDPOINT = process.env.NODE_ENV === "production"
  ? "https://lugano-clothing.g74447590.workers.dev/api/chat"
  : "/api/chat";
const greeting: Message = {
  role: "assistant",
  content: "Olá. Posso ajudar você a conhecer os bonés, preços, compra e políticas da Lugano.",
};
const suggestions = ["Quais bonés vocês têm?", "Como faço um pedido?", "Como funcionam as trocas?"];

function whatsappUrl(question: string) {
  const message = question
    ? `Olá! Preciso de atendimento da Lugano Clothing. Minha dúvida é: ${question}`
    : "Olá! Preciso de atendimento da Lugano Clothing.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  const ask = async (question: string) => {
    const content = question.trim().slice(0, 500);
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-4).map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const result = await response.json() as { answer?: string; handoff?: boolean };
      if (!result.answer) throw new Error("Resposta indisponível");
      setMessages((current) => [...current, { role: "assistant", content: result.answer!, handoff: result.handoff }]);
    } catch {
      setMessages((current) => [...current, {
        role: "assistant",
        content: "O atendimento automático está indisponível agora. Continue com nossa equipe pelo WhatsApp.",
        handoff: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(input);
  };

  const latestQuestion = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  return (
    <aside className={`storeChat${open ? " is-open" : ""}`} aria-label="Atendimento da Lugano">
      {open && (
        <section id="store-chat-panel" className="storeChatPanel" role="dialog" aria-modal="false" aria-labelledby="store-chat-title">
          <header>
            <div><small>Atendimento</small><h2 id="store-chat-title">Como podemos ajudar?</h2></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar atendimento">Fechar</button>
          </header>
          <div className="storeChatMessages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`storeChatMessage is-${message.role}`} key={`${message.role}-${index}`}>
                <p>{message.content}</p>
                {message.handoff && <a href={whatsappUrl(latestQuestion)} target="_blank" rel="noreferrer">Continuar no WhatsApp</a>}
              </div>
            ))}
            {messages.length === 1 && <div className="storeChatSuggestions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(suggestion)}>{suggestion}</button>)}</div>}
            {loading && <p className="storeChatLoading">Preparando resposta…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={submit}>
            <label htmlFor="store-chat-input">Sua pergunta</label>
            <div><input ref={inputRef} id="store-chat-input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Digite sua dúvida" disabled={loading} /><button type="submit" disabled={loading || !input.trim()}>Enviar</button></div>
          </form>
          <p className="storeChatPrivacy">Não informe dados de pagamento. Para pedidos específicos, fale com nossa equipe.</p>
        </section>
      )}
      <button className="storeChatToggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="store-chat-panel">
        <span aria-hidden="true" />{open ? "Fechar" : "Precisa de ajuda?"}
      </button>
    </aside>
  );
}
