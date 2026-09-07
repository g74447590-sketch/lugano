"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import StoreImage from "./StoreImage";
import ChatAssistant from "./ChatAssistant";
import { catalogProducts as products, formatMoney, type CatalogProduct } from "./catalog";

const WHATSAPP_NUMBER = "5561991541080";

const productAppeals: Record<string, string> = {
  "cursivo-white": "Branco com a assinatura Lugano em cursivo azul-marinho.",
  "tutto-passa-navy": "Tutto passa em cursivo branco sobre azul-marinho.",
  "cursivo-black": "Preto com a assinatura Lugano em cursivo branco.",
  "cursivo-navy": "Azul-escuro com a assinatura Lugano em cursivo branco.",
  "monaco-navy": "Monte-Carlo, monograma LC e a assinatura Lugano.",
  "club-cap-white": "Monograma LC em uma escolha clara e discreta.",
  "club-cap-navy": "Azul-marinho com o monograma LC em destaque.",
  "club-cap-black": "Preto com o monograma LC em branco.",
};

const navItems = [
  { label: "Coleção", href: "#collection" },
  { label: "Manifesto", href: "#manifesto" },
  { label: "Destaques", href: "#destaques" },
  { label: "Como comprar", href: "#como-comprar" },
];

const categories = [
  {
    number: "01",
    label: "Monaco",
    copy: "Uma nova assinatura em azul-marinho.",
    image: "/collection/lugano-monaco-navy-bordado.png",
    alt: "Boné Monaco azul-marinho com inscrições bordadas",
    theme: "stone",
  },
  {
    number: "02",
    label: "Club Cap Azul-Marinho",
    copy: "O monograma LC em um tom clássico.",
    image: "/collection/lugano-club-cap-navy-lc-only.png",
    alt: "Club Cap Azul-Marinho com monograma LC",
    theme: "ink",
  },
  {
    number: "03",
    label: "Club Cap Branco",
    title: "O detalhe que fecha o look.",
    copy: "Uma assinatura discreta para acompanhar todos os dias.",
    image: "/collection/lugano-club-cap-branco-lc-preto-clean.jpg",
    alt: "Club Cap Branco da Lugano Clothing com monograma LC",
    theme: "sand",
  },
  {
    number: "04",
    label: "Club Cap Preto",
    copy: "O monograma LC em contraste marcante.",
    image: "/collection/lugano-club-cap-preto-lc-clean.jpg",
    alt: "Club Cap Preto da Lugano Clothing com monograma LC",
    theme: "ink",
  },
];

function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function Arrow({ down = false }: { down?: boolean }) {
  return <span className={`arrowMark${down ? " arrowMarkDown" : ""}`} aria-hidden="true" />;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Array<{ product: CatalogProduct; size: string; quantity: number }>>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const firstMenuLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setDarkMode(window.localStorage.getItem("lugano-theme") === "dark"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("lugano-theme", next ? "dark" : "light");
      return next;
    });
  };

  const addToCart = (product: CatalogProduct, requestedSize?: string) => {
    if (!product.priceCents || !requestedSize) return;
    setCart((current) => {
      const match = current.find((item) => item.product.id === product.id && item.size === requestedSize);
      return match
        ? current.map((item) => item === match ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { product, size: requestedSize, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.priceCents ?? 0) * item.quantity, 0);

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setCheckoutError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, items: cart.map((item) => ({ productId: item.product.id, size: item.size, quantity: item.quantity })) }) });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Não foi possível criar o pedido.");
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Não foi possível criar o pedido.");
      setSubmitting(false);
    }
  };

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
    <>
      <main className={darkMode ? "darkTheme" : "lightTheme"}>
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
          <button className="cartButton" type="button" onClick={() => setCartOpen(true)} aria-label={`Abrir sacola com ${cart.reduce((sum, item) => sum + item.quantity, 0)} itens`}>Sacola <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span></button>
          <button className="themeToggle" type="button" onClick={toggleTheme} aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={darkMode}><span aria-hidden="true">{darkMode ? "◑" : "◐"}</span><b>{darkMode ? "Claro" : "Escuro"}</b></button>
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

      {cartOpen && (
        <dialog className="cartOverlay" open aria-modal="true" aria-label="Sua sacola">
          <button className="cartBackdrop" type="button" onClick={() => setCartOpen(false)} aria-label="Fechar sacola" />
          <section className="cartPanel">
            <header><div><small>Sua seleção</small><h2>Sacola</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar sacola">Fechar</button></header>
            <div className="checkoutNotice" role="status"><strong>Pagamento via Pix.</strong><p>Depois da confirmação de disponibilidade, frete e prazo, o código Pix aparecerá na página do pedido.</p></div>
            {cart.length === 0 ? <div className="cartEmpty"><p>Sua sacola está vazia.</p><button type="button" onClick={() => setCartOpen(false)}>Explorar coleção</button></div> : (
              <>
                <div className="cartItems">{cart.map((item) => (
                  <article key={`${item.product.id}-${item.size}`}>
                    <Image src={item.product.image} alt="" width={104} height={124} />
                    <div><h3>{item.product.name}</h3><label>Tamanho<select value={item.size} onChange={(event) => setCart((current) => current.map((entry) => entry === item ? { ...entry, size: event.target.value } : entry))}>{item.product.sizes?.map((size) => <option key={size}>{size}</option>)}</select></label><p>{item.quantity} × {item.product.price}</p></div>
                    <button type="button" onClick={() => setCart((current) => current.filter((entry) => entry !== item))}>Remover</button>
                  </article>
                ))}</div>
                <div className="cartSummary"><div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><p>Frete e disponibilidade serão confirmados antes do pagamento.</p><button className="button buttonBrass" type="button" onClick={() => setCheckoutOpen(true)}>Continuar pedido</button></div>
              </>
            )}
          </section>
        </dialog>
      )}

      {checkoutOpen && (
        <dialog className="checkoutOverlay" open aria-modal="true" aria-label="Dados do pedido">
          <section className="checkoutPanel">
            <header><div><small>Dados de entrega</small><h2>Entrega</h2></div><button type="button" onClick={() => setCheckoutOpen(false)}>Voltar</button></header>
            <form onSubmit={submitOrder}>
              <div className="fieldGrid">
                <label className="fieldWide">Nome completo<input name="customerName" autoComplete="name" required /></label>
                <label>E-mail<input name="customerEmail" type="email" autoComplete="email" required /></label>
                <label>WhatsApp<input name="customerPhone" inputMode="tel" autoComplete="tel" placeholder="(61) 99999-9999" required /></label>
                <label>CEP<input name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={9} required /></label>
                <label>Estado<input name="state" autoComplete="address-level1" maxLength={2} placeholder="DF" required /></label>
                <label className="fieldWide">Endereço completo<input name="addressLine" autoComplete="street-address" placeholder="Rua, número e complemento" required /></label>
                <label className="fieldWide">Cidade<input name="city" autoComplete="address-level2" required /></label>
              </div>
              <div className="checkoutNotice"><strong>Você ainda não será cobrado.</strong><p>Vamos confirmar disponibilidade, frete e prazo antes de liberar o pagamento.</p></div>
              {checkoutError && <p className="formError" role="alert">{checkoutError}</p>}
              <button className="button buttonBrass" type="submit" disabled={submitting}>{submitting ? "Criando pedido…" : "Solicitar pedido"}</button>
            </form>
          </section>
        </dialog>
      )}

      <section className="storeHero" id="top" aria-labelledby="hero-title">
        <div className="storeHeroVisual"><StoreImage src="/collection/lugano-monaco-navy-bordado.png" alt="Boné Monaco azul-marinho com monograma LC e assinatura Lugano" width={1087} height={1447} maxWidth={1200} priority sizes="(max-width: 760px) 100vw, 58vw" /><span>Novo · Monaco</span></div>
        <div className="storeHeroCopy">
          <p className="eyebrow">Lugano Clothing</p>
          <h1 id="hero-title">Vista o que<br /><em>fica na memória.</em></h1>
          <p>Bonés de linhas clássicas, cores bem escolhidas e a assinatura Lugano para quem prefere presença a excesso.</p>
          <div className="storeHeroActions"><a className="storePrimary" href="#destaques">Escolher meu boné</a><a className="storeSecondary" href={whatsappUrl("Olá! Quero ajuda para escolher um boné da Lugano Clothing.")} target="_blank" rel="noreferrer">Quero ajuda <Arrow /></a></div>
        </div>
      </section>

      <aside className="serviceBar" aria-label="Como funciona a compra"><span>01 · Escolha seu boné</span><span>02 · Revise sua sacola</span><span>03 · Envie seu pedido</span></aside>

      <section className="categoryShelf shell" id="collection" aria-labelledby="category-title">
        <header data-reveal><p className="eyebrow">Comece por aqui</p><h2 id="category-title">Qual é a sua escolha?</h2></header>
        <div className="categoryCards">
          {categories.map((category) => <a href="#destaques" className="categoryCard" key={category.label} data-reveal><StoreImage src={category.image} alt={category.alt} width={700} height={700} sizes="(max-width: 1020px) 50vw, 25vw" /><span>{category.number}</span><div><h3>{category.label}</h3><p>{category.copy}</p></div></a>)}
        </div>
      </section>

      <section className="humanNote" id="manifesto"><div className="shell" data-reveal><p>Uma marca para vestir de verdade.</p><blockquote>“A melhor peça não é a que chama mais atenção. É a que faz você querer usá-la de novo.”</blockquote><span>Lugano Clothing</span></div></section>

      <section className="productsSection" id="destaques">
        <div className="productsHead shell" data-reveal>
          <div><p className="eyebrow">Seleção Lugano</p><h2>Escolha a peça<br /><em>que fica com você.</em></h2></div>
          <p>Escolha seu boné e fale com nossa equipe. Antes de qualquer pagamento, confirmamos as medidas, a disponibilidade, o frete e o prazo.</p>
        </div>
        <div className="productGrid shell">
          {products.map((product, index) => (
            <article className="productCard" key={product.name} data-reveal style={{ transitionDelay: `${(index % 3) * 70}ms` }}>
              <div className="productMedia">
                <StoreImage src={product.image} alt={product.name} width={800} height={800} sizes="(max-width: 1020px) 50vw, 33vw" />
                <span className="productQuick">{product.id === "club-cap-black" || product.id === "monaco-navy" || product.id === "tutto-passa-navy" || product.id.startsWith("cursivo-") ? "Novo" : "Escolha Lugano"}</span>
              </div>
              <div className="productMeta">
                <div className="productIdentity"><p className="productLine">{product.line}</p><h3>{product.name}</h3><p className="productAppeal">{productAppeals[product.id]}</p>{product.price && <p className="productPrice">{product.price}</p>}</div>
                {product.priceCents && product.sizes ? (
                  <div className="productChoice">
                    {product.sizes.length > 1 && <fieldset><legend>Escolha o tamanho</legend><div>{product.sizes.map((size) => <button className={selectedSizes[product.id] === size ? "is-selected" : ""} type="button" key={size} aria-pressed={selectedSizes[product.id] === size} onClick={() => setSelectedSizes((current) => ({ ...current, [product.id]: size }))}>{size}</button>)}</div></fieldset>}
                    <button className="productContact" type="button" disabled={product.sizes.length > 1 && !selectedSizes[product.id]} onClick={() => addToCart(product, product.sizes.length === 1 ? product.sizes[0] : selectedSizes[product.id])}>Adicionar à sacola</button>
                    <p className="productFreightNote">Frete e prazo confirmados por WhatsApp antes do pagamento.</p>
                  </div>
                ) : <a className="productContact" href={whatsappUrl(`Olá! Quero saber mais sobre ${product.name} da Lugano Clothing.`)} target="_blank" rel="noreferrer">Quero saber mais</a>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="buyingSection shell" id="como-comprar">
        <div className="buyingIntro" data-reveal><p className="eyebrow">Pedido acompanhado</p><h2>Você escolhe.<br /><em>A gente confirma.</em></h2></div>
        <ol className="buyingSteps">
          <li data-reveal><span>01</span><div><h3>Escolha seu boné</h3><p>Conheça os modelos e escolha sua cor preferida.</p></div></li>
          <li data-reveal><span>02</span><div><h3>Revise sua sacola</h3><p>Adicione os modelos desejados e confira as quantidades antes de continuar.</p></div></li>
          <li data-reveal><span>03</span><div><h3>Envie seu pedido</h3><p>Informe seus dados. Nossa equipe confirma disponibilidade, frete e prazo pelo WhatsApp antes do pagamento.</p></div></li>
        </ol>
      </section>

      <section className="reviewsSection" aria-labelledby="reviews-title">
        <div className="reviewsInner shell" data-reveal>
          <div><p className="eyebrow">Experiências reais</p><h2 id="reviews-title">Quem escolhe,<br /><em>conta.</em></h2></div>
          <p>As primeiras avaliações verificadas de clientes serão publicadas aqui. A Lugano não inventa depoimentos.</p>
        </div>
      </section>

      <section className="closingCta" id="club">
        <div className="closingInner shell" data-reveal><p className="eyebrow">Ainda está escolhendo?</p><h2>Vamos encontrar<br /><em>a sua Lugano.</em></h2><p>Conte para a gente o que você procura. O atendimento é feito por uma pessoa.</p><a className="button buttonBrass" href={whatsappUrl("Olá! Quero ajuda para escolher minha peça da Lugano Clothing.")} target="_blank" rel="noreferrer">Conversar no WhatsApp <Arrow /></a></div>
      </section>

      <footer className="footer">
        <div className="footerInner shell">
          <div className="footerBrand"><a className="brandLockup" href="#top"><strong>LUGANO</strong><span>CLOTHING</span></a><p>Moda contemporânea com presença.</p></div>
          <div className="footerLinks">
            <div aria-label="Políticas da loja">
              <section aria-labelledby="trocas-title"><b id="trocas-title">Trocas e Devoluções</b><p>Aceitamos trocas em até 7 dias após o recebimento, desde que o produto esteja sem uso e na embalagem original. Entre em contato pelo WhatsApp para iniciar o processo.</p></section>
              <section aria-labelledby="entrega-title"><b id="entrega-title">Entregas</b><p>O prazo de entrega é confirmado individualmente por nossa equipe antes do pagamento. Enviamos para todo o Brasil.</p></section>
              <section aria-labelledby="privacidade-title"><b id="privacidade-title">Privacidade</b><p>Seus dados são usados exclusivamente para processar seu pedido e não são compartilhados com terceiros.</p></section>
            </div>
            <div><b>Conecte-se</b><a href="https://instagram.com/lugano_coo" target="_blank" rel="noreferrer">Instagram</a><a href={whatsappUrl("Olá! Preciso de atendimento da Lugano Clothing.")} target="_blank" rel="noreferrer">WhatsApp</a></div>
          </div>
          <div className="footerBottom"><small>© 2026 Lugano Clothing. Todos os direitos reservados.</small><small>Moda contemporânea · Brasil</small></div>
        </div>
      </footer>
      </main>
      <ChatAssistant />
    </>
  );
}
