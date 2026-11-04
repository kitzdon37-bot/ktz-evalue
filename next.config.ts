import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Modules chargés tels quels côté serveur : chiffrement des mots de passe (module natif),
  // génération des PDF (lit ses polices sur le disque) et exécution du code des candidats
  // (QuickJS en WebAssembly, chargé depuis node_modules).
  serverExternalPackages: ["@node-rs/argon2", "pdfkit", "quickjs-emscripten"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
