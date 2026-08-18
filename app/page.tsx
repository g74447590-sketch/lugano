"use client";

import { useState } from "react";

const essentials = [
  { name: "Essential Tee", line: "240g · Algodão premium", image: "/collection/lugano-camisetas-basicas-lc-v2.png", className: "wide" },
  { name: "Club Polo", line: "Estrutura impecável", image: "/collection/lugano-polos-quatro-cores.png", className: "tall" },
  { name: "Club Cap", line: "Tactel ultraleve", image: "/collection/lugano-bone-tactel-v3-logo-correta.png", className: "small" },
  { name: "Riviera", line: "Proteção UV400", image: "/collection/lugano-oculos.png", className: "small" },
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

export default function Home() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <main>
      <header className="nav shell">
        <a className="wordmark" href="#top" aria-label="Lugano, página inicial">LUGANO</a>
        <nav aria-label="Navegação principal">
          <a href="#collection">Coleção</a><a href="#philosophy">Essência</a><a href="#club">Lugano Club</a>
        </nav>
        <a className="navCta" href="#collection">Comprar <Arrow /></a>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy shell">
          <p className="overline">Ambition Collection · 2026</p>
          <h1>Ambição,<br /><span>bem vestida.</span></h1>
          <p>Peças essenciais. Materiais excepcionais.<br />Desenhadas para o seu próximo capítulo.</p>
          <div className="heroActions"><a className="primary" href="#collection">Explorar a coleção</a><a className="textLink" href="#philosophy">Nossa essência <Arrow /></a></div>
        </div>
        <div className="heroVisual">
          <img src="/collection/lugano-camisetas-basicas-lc-v2.png" alt="Camisetas premium da coleção Lugano" />
          <p><span>01</span> Essential Tee</p>
        </div>
        <a className="scroll" href="#philosophy"><span /> Role para descobrir</a>
      </section>

      <section className="statement shell" id="philosophy">
        <p className="overline">A filosofia Lugano</p>
        <h2>O luxo não precisa<br />chamar <span>atenção.</span></h2>
        <p className="statementBody">Ele é sentido no toque, percebido no caimento e lembrado pela forma como faz você se sentir. Cada peça existe para durar além da estação.</p>
        <div className="principles">
          <article><b>01</b><h3>Matéria</h3><p>Fibras selecionadas por textura, peso e durabilidade.</p></article>
          <article><b>02</b><h3>Forma</h3><p>Silhuetas precisas que se movem com naturalidade.</p></article>
          <article><b>03</b><h3>Intenção</h3><p>Nada em excesso. Todo detalhe tem uma razão.</p></article>
        </div>
      </section>

      <section className="collection" id="collection">
        <div className="collectionHead shell"><div><p className="overline">Selecionados para você</p><h2>Essenciais,<br />reimaginados.</h2></div><a className="textLink" href="#grid">Ver todos <Arrow /></a></div>
        <div className="productGrid shell" id="grid">
          {essentials.map((item) => (
            <article className={`product ${item.className}`} key={item.name}>
              <a href={`https://wa.me/5561991541080?text=${encodeURIComponent(`Olá! Quero saber mais sobre ${item.name} da Lugano.`)}`} target="_blank" rel="noreferrer" aria-label={`Conhecer ${item.name} pelo WhatsApp`}>
                <div className="productImage"><img src={item.image} alt={item.name} /><span className="quick">Descobrir <Arrow /></span></div>
                <div className="productMeta"><div><h3>{item.name}</h3><p>{item.line}</p></div><Arrow /></div>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial shell">
        <div className="editorialImage"><img src="/hero-lugano.png" alt="Ambition Collection da Lugano" /></div>
        <div className="editorialCopy"><p className="overline">The Ambition Edit</p><h2>Feito para quem<br />não chegou até aqui<br />por acaso.</h2><p>Um guarda-roupa preciso para dias que pedem presença. Do primeiro compromisso ao último plano da noite.</p><a className="primary dark" href="#collection">Conhecer o drop</a></div>
      </section>

      <section className="craft shell">
        <div className="craftIntro"><p className="overline">Construído para durar</p><h2>Qualidade que você<br />percebe de perto.</h2></div>
        <div className="craftGrid">
          <article><span>01</span><div><h3>Algodão de alta gramatura</h3><p>Toque encorpado, macio e resistente. Mantém a estrutura mesmo depois de muitos usos.</p></div></article>
          <article><span>02</span><div><h3>Caimento estudado</h3><p>Proporções equilibradas para vestir bem sem limitar seus movimentos.</p></div></article>
          <article><span>03</span><div><h3>Acabamento preciso</h3><p>Costuras reforçadas e detalhes pensados para atravessar temporadas.</p></div></article>
          <article><span>04</span><div><h3>Produção consciente</h3><p>Menos excessos, escolhas melhores e peças que permanecem relevantes.</p></div></article>
        </div>
      </section>

      <section className="lookbook">
        <div className="lookbookCopy shell"><p className="overline">Lugano, todos os dias</p><h2>Uma coleção.<br />Infinitas versões.</h2><p>Do essencial ao detalhe final, cada peça foi desenhada para combinar com o que você já conquistou — e com o que ainda vem pela frente.</p><a className="primary" href="#collection">Montar meu look</a></div>
        <div className="lookbookImages shell">
          <div><img src="/collection/lugano-polos-quatro-cores.png" alt="Polos Lugano em quatro cores" /></div>
          <div><img src="/collection/lugano-bone-algodao.png" alt="Boné Lugano em algodão" /></div>
          <div><img src="/collection/lugano-pulseiras.png" alt="Pulseiras Lugano" /></div>
        </div>
      </section>

      <section className="club" id="club">
        <div className="clubInner shell">
          <p className="overline">Acesso antecipado · Edições limitadas</p>
          <h2>Você vai querer<br />saber <span>primeiro.</span></h2>
          <p>Entre para o Lugano Club e tenha acesso ao que vem antes de todo mundo.</p>
          {subscribed ? (
            <div className="success" role="status"><span>✓</span><div><b>Você está na lista.</b><p>As novidades da Lugano chegarão primeiro para você.</p></div></div>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}>
              <label><span className="srOnly">Seu melhor e-mail</span><input type="email" name="email" autoComplete="email" placeholder="Seu melhor e-mail" required /><button type="submit">Entrar para o Club <Arrow /></button></label>
            </form>
          )}
        </div>
      </section>

      <footer className="footer shell">
        <div><a className="wordmark" href="#top">LUGANO</a><p>Clássicos contemporâneos<br />para uma vida em movimento.</p></div>
        <div><b>Explore</b><a href="#collection">Coleção</a><a href="#philosophy">Essência</a><a href="#club">Lugano Club</a></div>
        <div><b>Conecte-se</b><a href="https://instagram.com/lugano_coo" target="_blank" rel="noreferrer">Instagram</a><a href="https://wa.me/5561991541080" target="_blank" rel="noreferrer">Contato</a><a href="https://wa.me/5561991541080?text=Olá!%20Preciso%20de%20atendimento%20da%20Lugano." target="_blank" rel="noreferrer">Atendimento</a></div>
        <small>© 2026 Lugano Clothing. Todos os direitos reservados.</small><small>São Paulo · Brasil</small>
      </footer>
    </main>
  );
}
