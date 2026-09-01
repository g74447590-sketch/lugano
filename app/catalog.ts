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
  { id: "star-hoodie-black", name: "Star Hoodie Black", line: "Moletom · Preto", priceCents: 18800, price: "R$ 188", image: "/collection/lugano-star-hoodie-preto.png", sizes: ["P", "M", "G", "GG"] },
  { id: "star-hoodie-white", name: "Star Hoodie White", line: "Moletom · Branco", priceCents: 18800, price: "R$ 188", image: "/collection/lugano-star-hoodie-branco.png", sizes: ["P", "M", "G", "GG"] },
  { id: "star-hoodie-off-white", name: "Star Hoodie Off-White", line: "Moletom · Off-white", priceCents: 18800, price: "R$ 188", image: "/collection/lugano-star-hoodie-off-white.png", sizes: ["P", "M", "G", "GG"] },
  { id: "star-drop-black", name: "Star Drop Black", line: "Camiseta · Preto", priceCents: 9600, price: "R$ 96", image: "/collection/lugano-star-tee-preta.png", sizes: ["P", "M", "G", "GG"] },
  { id: "star-drop-white", name: "Star Drop White", line: "Camiseta · Branco", priceCents: 9600, price: "R$ 96", image: "/collection/lugano-star-tee-branca.png", sizes: ["P", "M", "G", "GG"] },
  { id: "star-drop-off-white", name: "Star Drop Off-White", line: "Camiseta · Off-white", priceCents: 9600, price: "R$ 96", image: "/collection/lugano-star-tee-off-white.png", sizes: ["P", "M", "G", "GG"] },
  { id: "essential-off-white", name: "Essential Tee Off-White", line: "Essential · Off-white", priceCents: 5900, price: "R$ 59", image: "/collection/lugano-essential-tee-off-white.png", sizes: ["P", "M", "G", "GG"] },
  { id: "essential-navy", name: "Essential Tee Navy", line: "Essential · Azul-marinho", priceCents: 5900, price: "R$ 59", image: "/collection/lugano-essential-tee-navy.png", sizes: ["P", "M", "G", "GG"] },
  { id: "essential-gray", name: "Essential Tee Gray", line: "Essential · Cinza", priceCents: 5900, price: "R$ 59", image: "/collection/lugano-essential-tee-cinza.png", sizes: ["P", "M", "G", "GG"] },
  { id: "essential-sage", name: "Essential Tee Sage", line: "Essential · Verde-sálvia", priceCents: 5900, price: "R$ 59", image: "/collection/lugano-essential-tee-salvia.png", sizes: ["P", "M", "G", "GG"] },
  { id: "club-cap-off-white", name: "Club Cap Off-White", line: "Boné · Off-white", image: "/collection/lugano-club-cap-off-white-lc-only.png" },
  { id: "riviera", name: "Riviera", line: "Óculos · Azul-marinho", image: "/collection/lugano-oculos.png" },
];

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
