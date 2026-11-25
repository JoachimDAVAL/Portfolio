import type { NextConfig } from "next";

// Deux façons de construire le site :
// - npm run build            : Next.js avec serveur (Vercel), la route /api/contact est incluse
// - npm run build:cloudflare : export statique dans out/, /api/contact est servie par worker/index.ts
// La route s'appelle route.api.ts : l'extension « api.ts » n'est reconnue que hors export (un POST ne s'exporte pas).
const exportStatique = process.env.EXPORT_STATIQUE === "1";

const nextConfig: NextConfig = {
  ...(exportStatique ? { output: "export" as const } : {}),
  pageExtensions: exportStatique ? ["tsx", "ts"] : ["tsx", "ts", "api.ts"],
  // Images réduites préparées par scripts/variantes.mjs, à la place de l'optimisation de Next (absente d'un export)
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    deviceSizes: [640, 1080, 1600],
    imageSizes: [384],
  },
};

export default nextConfig;
