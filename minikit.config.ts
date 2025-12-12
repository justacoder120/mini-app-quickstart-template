const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {



  miniapp: {
    version: "1",
    name: "Mini App Quickstart Template",
    subtitle: "Quickstart Template",
    description: "A starter template for building Base Mini Apps using Next.js. By Trio Blockchain Labs.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "developer-tools",
    tags: ["developer-tools", "productivity"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Ship mini apps faster. By TriO",
    ogTitle: "Mini App Quickstart Template",
    ogDescription: "A template for building Base Mini Apps using Next.js and TypeScript. By Trio Blockchain Labs",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;

