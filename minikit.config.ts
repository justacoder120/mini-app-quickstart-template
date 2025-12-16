const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {

accountAssociation: {
    header: "eyJmaWQiOjE1OTY2NTMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg4NTAzNEViQ0VkQTNjODRDRkNFMWIyQ0ZEZTI4YjZkOUQ3YzY0NjgzIn0",
    payload: "eyJkb21haW4iOiJtaW5pLWFwcC1xdWlja3N0YXJ0LXRlbXBsYXRlLXBpLnZlcmNlbC5hcHAifQ",
    signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABh1uItWTm0KBY7DAavmjiGzYl8-1eknv-cepKxG-hDalfh00JsxndcMPp_38i2LYLNTCQI4gKkgXCuuFV8rCZngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoia2RCZk1yNFFYWDRwU3pYb3d2bk05b2NJc3htVGVGbW9vOWxyOHJDbWtBZyIsIm9yaWdpbiI6Imh0dHBzOi8va2V5cy5jb2luYmFzZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  },

  miniapp: {
    version: "1",
    name: "CommitMint",
    subtitle: "Social Accountability",
    description: "commitMint is a decentralized social accountability app built on the Base blockchain that leverages financial incentives and social validation to help users achieve their goals. The concept is simple: you create a challenge pool with friends (e.g., '30 Days of Morning Runs') and stake USDC. At the core of the system lies a 'Proof and Voting' mechanism: participants are required to upload a video proof of their daily activity. Other pool members then watch and vote to verify these proofs.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png?v=2`,
    splashImageUrl: `${ROOT_URL}/splash.png?v=2`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["social", "fitness", "productivity", "defi"],
    heroImageUrl: `${ROOT_URL}/hero.png?v=2`,
    tagline: "Stake. Commit. Mint Habits.",
    ogTitle: "CommitMint - Decentralized Accountability",
    ogDescription: "Stake on your goals and prove your progress. Join challenge pools and verify friends to earn rewards.",
    ogImageUrl: `${ROOT_URL}/hero.png?v=2`,
  },
} as const;

