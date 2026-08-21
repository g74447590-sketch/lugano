"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";

const WHATSAPP_NUMBER = "5561991541080";

const navItems = [
  { label: "Coleção", href: "#collection" },
  { label: "Manifesto", href: "#manifesto" },
  { label: "Destaques", href: "#destaques" },
  { label: "Como comprar", href: "#como-comprar" },
];

const categories = [
  {
    number: "01",
    label: "Camisetas",
    title: "Essenciais com identidade.",
    copy: "Bases limpas, tons pensados e a assinatura LC.",
    image: "/collection/lugano-camisetas-basicas-lc-v2.png",
    alt: "Camisetas Lugano Clothing em quatro cores",
    theme: "stone",
  },
  {
    number: "02",
    label: "Moletons",
    title: "Camadas para vestir com presença.",
    copy: "A coleção Star em preto, branco e off-white.",
    image: "/collection/lugano-star-hoodies.png",
    alt: "Moletons Star da Lugano Clothing em três cores",
    theme: "ink",
  },
  {
    number: "03",
    label: "Bonés",
    title: "O detalhe que fecha o look.",
    copy: "Uma assinatura discreta para acompanhar todos os dias.",
    image: "/collection/lugano-club-cap-off-white-logo-correta.png",
    alt: "Club Cap off-white da Lugano Clothing com monograma LC",
    theme: "sand",
  },
  {
    number: "04",
    label: "Óculos",
    title: "Linhas marcantes, sem excesso.",
    copy: "Riviera: linhas limpas e presença imediata.",
    image: "/collection/lugano-oculos.png",
    alt: "Óculos Riviera da Lugano Clothing",
    theme: "night",
  },
];

const products = [
  { name: "Star Hoodie Black", line: "Moletom · Preto", price: "R$ 188", image: "/collection/lugano-star-hoodie-preto.png" },
  { name: "Star Hoodie White", line: "Moletom · Branco", price: "R$ 188", image: "/collection/lugano-star-hoodie-branco.png" },
  { name: "Star Hoodie Off-White", line: "Moletom · Off-white", price: "R$ 188", image: "/collection/lugano-star-hoodie-off-white.png" },
  { name: "Star Drop Black", line: "Camiseta · Preto", price: "R$ 96", image: "/collection/lugano-star-tee-preta.png" },
  { name: "Star Drop White", line: "Camiseta · Branco", price: "R$ 96", image: "/collection/lugano-star-tee-branca.png" },
  { name: "Star Drop Off-White", line: "Camiseta · Off-white", price: "R$ 96", image: "/collection/lugano-star-tee-off-white.png" },
  { name: "Essential Tee Off-White", line: "Essential · Off-white", price: "R$ 45", image: "/collection/lugano-essential-tee-off-white.png" },
  { name: "Essential Tee Navy", line: "Essential · Azul-marinho", price: "R$ 45", image: "/collection/lugano-essential-tee-navy.png" },
  { name: "Essential Tee Gray", line: "Essential · Cinza", price: "R$ 45", image: "/collection/lugano-essential-tee-cinza.png" },
  { name: "Essential Tee Sage", line: "Essential · Verde-sálvia", price: "R$ 45", image: "/collection/lugano-essential-tee-salvia.png" },
  { name: "Club Cap Off-White", line: "Boné · Off-white", image: "/collection/lugano-club-cap-off-white-logo-correta.png" },
  { name: "Riviera", line: "Óculos · Azul-marinho", image: "/collection/lugano-oculos.png" },
];

function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function Arrow({ down = false }: { down?: boolean }) {
  return <span className={`arrowMark${down ? " arrowMarkDown" : ""}`} aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -7%" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMenuLink.current?.focus();

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const trapMenuFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <main>
      <header className="siteHeader">
        <div className="nav shell">
          <a className="brandLockup" href="#top" aria-label="Lugano Clothing, página inicial">
            <strong>LUGANO</strong><span>CLOTHING</span>
          </a>
          <nav className="desktopNav" aria-label="Navegação principal">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <a className="headerContact" href={whatsappUrl("Olá! Quero conhecer a coleção da Lugano Clothing.")} target="_blank" rel="noreferrer">
            Atendimento <Arrow />
          </a>
          <button className="menuToggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}>
            <span>Menu</span><i aria-hidden="true" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <dialog className="menuOverlay" id="mobile-menu" open aria-label="Menu" onKeyDown={trapMenuFocus}>
          <div className="menuTop shell">
            <span className="menuBrand">LUGANO <small>CLOTHING</small></span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">Fechar <span className="closeMark" aria-hidden="true" /></button>
          </div>
          <nav className="menuLinks shell" aria-label="Menu mobile">
            {navItems.map((item, index) => (
              <a key={item.href} href={item.href} ref={index === 0 ? firstMenuLink : undefined} onClick={() => setMenuOpen(false)}>
                <small>0{index + 1}</small><span>{item.label}</span><Arrow />
              </a>
            ))}
          </nav>
          <div className="menuFooter shell">
            <a href="https://instagram.com/lugano_coo" target="_blank" rel="noreferrer">Instagram <Arrow /></a>
            <a href={whatsappUrl("Olá! Preciso de atendimento da Lugano Clothing.")} target="_blank" rel="noreferrer">WhatsApp <Arrow /></a>
          </div>
        </dialog>
      )}

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="heroMedia" aria-hidden="true"><Image src="/hero-lugano-v2.png" alt="" width={1792} height={937} priority sizes="100vw" /></div>
        <div className="heroVeil" />
        <div className="heroContent shell">
          <p className="heroEdition">LUGANO / 46°00′N</p>
          <p className="eyebrow">Precisão alpina · Elegância italiana · Luz mediterrânea</p>
          <h1 id="hero-title">Entre os Alpes<br /><em>e o mar.</em></h1>
          <p className="heroIntro">Uma coleção construída com rigor suíço, presença italiana e a leveza luminosa do Mediterrâneo.</p>
          <div className="heroActions">
            <a className="button buttonLight" href="#collection">Ver coleção <Arrow down /></a>
            <a className="lineLink light" href={whatsappUrl("Olá! Quero conhecer a coleção da Lugano Clothing.")} target="_blank" rel="noreferrer">Falar com a Lugano <Arrow /></a>
          </div>
        </div>
        <div className="heroIndex" aria-hidden="true"><span>HELVETIA / ITALIA / AEGEAN</span><span>Edition 01 · 2026</span></div>
        <div className="heroHorizon" aria-hidden="true" />
      </section>

      <section className="categoryIntro shell" id="collection" data-reveal>
        <div><p className="eyebrow">A coleção</p><h2>Quatro formas<br />de compor <em>presença.</em></h2></div>
        <p>Do essencial ao detalhe final, cada escolha participa do mesmo visual: preciso, contemporâneo e fácil de vestir.</p>
      </section>

      <section className="categoryStory" aria-label="Categorias da coleção">
        {categories.map((category, index) => (
          <article className="categoryChapter" key={category.label}>
            <div className={`categoryPanel theme-${category.theme}`} style={{ zIndex: index + 1 }}>
              <div className="categoryContent shell">
                <div className="categoryCopy" data-reveal>
                  <div className="categoryLabel"><span>{category.number}</span><p>{category.label}</p></div>
                  <h3>{category.title}</h3><p>{category.copy}</p>
                  <a className="lineLink" href="#destaques">Ver seleção <Arrow /></a>
                </div>
                <div className="categoryMedia"><Image src={category.image} alt={category.alt} width={1792} height={1024} loading="lazy" sizes="(max-width: 680px) 100vw, 58vw" /></div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="manifesto" id="manifesto">
        <div className="manifestoArc manifestoArcOne" aria-hidden="true" /><div className="manifestoArc manifestoArcTwo" aria-hidden="true" />
        <div className="manifestoInner shell" data-reveal>
          <p className="eyebrow">Manifesto</p><h2>Vestir com intenção.<br /><em>Menos ruído,</em><br />mais presença.</h2><p className="manifestoSignature">Lugano Clothing</p>
        </div>
      </section>

      <section className="productsSection" id="destaques">
        <div className="productsHead shell" data-reveal>
          <div><p className="eyebrow">Seleção Lugano</p><h2>Peças que<br /><em>falam baixo.</em></h2></div>
          <p>Consulte modelos e disponibilidade diretamente com a nossa equipe.</p>
        </div>
        <div className="productGrid shell">
          {products.map((product, index) => (
            <article className="productCard" key={product.name} data-reveal style={{ transitionDelay: `${(index % 3) * 70}ms` }}>
              <a className="productMedia" href={whatsappUrl(`Olá! Quero saber mais sobre ${product.name} da Lugano Clothing.`)} target="_blank" rel="noreferrer" aria-label={`Consultar ${product.name} pelo WhatsApp`}>
                <Image src={product.image} alt={product.name} width={1200} height={1200} loading="lazy" sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 33vw" /><span className="productQuick">Consultar <Arrow /></span>
              </a>
              <div className="productMeta">
                <div><h3>{product.name}</h3><p className="productLine">{product.line}</p>{product.price && <p className="productPrice">{product.price}</p>}</div>
                <a className="productContact" href={whatsappUrl(`Olá! Quero saber mais sobre ${product.name} da Lugano Clothing.`)} target="_blank" rel="noreferrer" aria-label={`Falar sobre ${product.name} no WhatsApp`}>Consultar</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="editorialSection">
        <div className="editorialHeading shell" data-reveal><p className="eyebrow">Lugano, todos os dias</p><h2>Uma coleção.<br /><em>Seu ritmo.</em></h2></div>
        <div className="editorialGrid shell">
          <figure className="editorialMain" data-reveal><Image src="/collection/lugano-star-tees.png" alt="Camisetas Star da Lugano Clothing" width={1536} height={1024} loading="lazy" sizes="(max-width: 1020px) 100vw, 66vw" /><figcaption><span>01</span> Star Series</figcaption></figure>
          <div className="editorialSide">
            <figure data-reveal><Image src="/collection/lugano-club-cap-off-white-logo-correta.png" alt="Club Cap off-white da Lugano Clothing com monograma LC" width={1536} height={1024} loading="lazy" sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 34vw" /><figcaption><span>02</span> Club Cap Off-White</figcaption></figure>
            <figure data-reveal><Image src="/collection/lugano-oculos.png" alt="Óculos Riviera da Lugano Clothing" width={1536} height={1024} loading="lazy" sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 34vw" /><figcaption><span>03</span> Riviera</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="buyingSection shell" id="como-comprar">
        <div className="buyingIntro" data-reveal><p className="eyebrow">Compra direta</p><h2>Simples do início<br /><em>ao fechamento.</em></h2></div>
        <ol className="buyingSteps">
          <li data-reveal><span>01</span><div><h3>Escolha sua peça</h3><p>Navegue pela coleção e encontre o modelo que combina com você.</p></div></li>
          <li data-reveal><span>02</span><div><h3>Chame no WhatsApp</h3><p>O produto escolhido já vai identificado na mensagem.</p></div></li>
          <li data-reveal><span>03</span><div><h3>Confirme os detalhes</h3><p>Nossa equipe confirma tamanho, disponibilidade, frete e pagamento.</p></div></li>
        </ol>
      </section>

      <section className="closingCta" id="club">
        <div className="closingHorizon" aria-hidden="true" />
        <div className="closingInner shell" data-reveal><p className="eyebrow">Atendimento Lugano</p><h2>Encontrou<br />a sua peça?</h2><p>Fale com a gente para confirmar os detalhes e concluir seu pedido.</p><a className="button buttonBrass" href={whatsappUrl("Olá! Quero fazer um pedido na Lugano Clothing.")} target="_blank" rel="noreferrer">Falar com a Lugano <Arrow /></a></div>
      </section>

      <footer className="footer">
        <div className="footerInner shell">
          <div className="footerBrand"><a className="brandLockup" href="#top"><strong>LUGANO</strong><span>CLOTHING</span></a><p>Moda contemporânea com presença.</p></div>
          <div className="footerLinks">
            <div><b>Explore</b>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
            <div><b>Conecte-se</b><a href="https://instagram.com/lugano_coo" target="_blank" rel="noreferrer">Instagram</a><a href={whatsappUrl("Olá! Preciso de atendimento da Lugano Clothing.")} target="_blank" rel="noreferrer">WhatsApp</a></div>
          </div>
          <div className="footerBottom"><small>© 2026 Lugano Clothing. Todos os direitos reservados.</small><small>Moda contemporânea · Brasil</small></div>
        </div>
      </footer>
    </main>
  );
}
