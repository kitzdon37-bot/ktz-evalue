import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Modules chargés tels quels côté serveur : chiffrement des mots de passe (module natif)
  // et génération des PDF (lit ses polices sur le disque).
  serverExternalPackages: ["@node-rs/argon2", "pdfkit"],
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
