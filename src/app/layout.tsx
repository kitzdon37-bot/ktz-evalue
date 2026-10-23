import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "KTZ Évalue", template: "%s — KTZ Évalue" },
  description: "Tests de recrutement générés par IA pour les entreprises d'Afrique francophone.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Pas de police téléchargée : on utilise celles du téléphone ou de l'ordinateur,
// pour que les pages restent légères sur une connexion faible.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
