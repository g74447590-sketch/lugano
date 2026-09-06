export type CatalogProduct = {
  id: string;
  name: string;
  line: string;
  priceCents?: number;
  price?: string;
  image: string;
  sizes?: readonly string[];
};

export const catalogProducts: readonly CatalogProduct[] = [
  { id: "cursivo-white", name: "Cursivo Branco", line: "Boné · Branco", priceCents: 8000, price: "R$ 80", image: "/collection/lugano-cursivo-branco.png", sizes: ["Tamanho único"] },
  { id: "tutto-passa-navy", name: "Tutto passa", line: "Boné · Azul-marinho", priceCents: 8000, price: "R$ 80", image: "/collection/lugano-tutto-passa-marinho.png", sizes: ["Tamanho único"] },
  { id: "cursivo-black", name: "Cursivo Preto", line: "Boné · Preto", priceCents: 8000, price: "R$ 80", image: "/collection/lugano-cursivo-preto.png", sizes: ["Tamanho único"] },
  { id: "cursivo-navy", name: "Cursivo Azul-Escuro", line: "Boné · Azul-escuro", priceCents: 8000, price: "R$ 80", image: "/collection/lugano-cursivo-azul-escuro.png", sizes: ["Tamanho único"] },
  { id: "monaco-navy", name: "Monaco", line: "Boné · Azul-marinho", priceCents: 11700, price: "R$ 117", image: "/collection/lugano-monaco-navy-bordado.png", sizes: ["Tamanho único"] },
  { id: "club-cap-white", name: "Club Cap Branco", line: "Boné · Branco", priceCents: 7500, price: "R$ 75", image: "/collection/lugano-club-cap-branco-lc-preto-clean.jpg", sizes: ["Tamanho único"] },
  { id: "club-cap-navy", name: "Club Cap Azul-Marinho", line: "Boné · Azul-marinho", priceCents: 7500, price: "R$ 75", image: "/collection/lugano-club-cap-navy-lc-only.png", sizes: ["Tamanho único"] },
  { id: "club-cap-black", name: "Club Cap Preto", line: "Boné · Preto", priceCents: 7500, price: "R$ 75", image: "/collection/lugano-club-cap-preto-lc-clean.jpg", sizes: ["Tamanho único"] },
];

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
