import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Police de l'espace recruteur et du site public, hébergée avec le site (aucun appel à Google
// au moment de la visite). La page de test du candidat, elle, n'utilise que les polices du téléphone.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "KTZ Évalue — Tests de recrutement par IA", template: "%s — KTZ Évalue" },
  description: "Générez en quelques minutes un test adapté à votre offre d'emploi, envoyez-le par lien ou WhatsApp, et recevez un classement fiable de vos candidats.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13564a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
