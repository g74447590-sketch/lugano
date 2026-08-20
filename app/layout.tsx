import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const editorial = Fraunces({ variable: "--font-editorial", subsets: ["latin"] });
const siteUrl = "https://lugano-clothing.carlossergiogomesferreira.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lugano Clothing — Presença sem excesso",
  description: "Camisetas, moletons e acessórios Lugano Clothing. Consulte modelos e disponibilidade pelo WhatsApp.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Lugano Clothing — Presença sem excesso",
    description: "Moda contemporânea com presença. Conheça a coleção Lugano Clothing.",
    url: "/",
    siteName: "Lugano Clothing",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-v2.png", width: 1731, height: 909, alt: "Lugano Clothing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lugano Clothing — Presença sem excesso",
    description: "Moda contemporânea com presença. Conheça a coleção Lugano Clothing.",
    images: ["/og-v2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${sans.variable} ${editorial.variable}`}>{children}</body></html>;
}
