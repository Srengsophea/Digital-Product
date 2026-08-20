import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "products");
fs.mkdirSync(OUT_DIR, { recursive: true });

interface ProductArt {
  slug: string;
  name: string;
  tagline: string;
  from: string;
  to: string;
  accent: string;
  icon: "layers" | "cart" | "book" | "slides" | "shield" | "pen" | "video" | "share" | "chart" | "cube" | "briefcase" | "font" | "terminal" | "grid";
}

const PRODUCTS: ProductArt[] = [
  { slug: "nebula-ui-kit", name: "Nebula UI Kit", tagline: "300+ components", from: "#8b5cf6", to: "#06b6d4", accent: "#a78bfa", icon: "layers" },
  { slug: "swift-commerce", name: "Swift Commerce", tagline: "Headless e-commerce engine", from: "#2563eb", to: "#06b6d4", accent: "#60a5fa", icon: "cart" },
  { slug: "indie-hacker", name: "Indie Hacker Playbook", tagline: "220-page founder guide", from: "#f59e0b", to: "#ef4444", accent: "#fbbf24", icon: "book" },
  { slug: "lumen-deck", name: "Lumen Deck", tagline: "120 slide layouts", from: "#10b981", to: "#06b6d4", accent: "#34d399", icon: "slides" },
  { slug: "vault-manager", name: "Vault Manager", tagline: "Self-hosted password vault", from: "#6366f1", to: "#8b5cf6", accent: "#818cf8", icon: "shield" },
  { slug: "chromatic-icons", name: "Chromatic Icons", tagline: "4,200 icons", from: "#f472b6", to: "#8b5cf6", accent: "#f9a8d4", icon: "pen" },
  { slug: "zero-to-launch", name: "Zero to Launch", tagline: "12-hour SaaS bootcamp", from: "#06b6d4", to: "#6366f1", accent: "#22d3ee", icon: "video" },
  { slug: "orbit-social", name: "Orbit Social", tagline: "150 social templates", from: "#ec4899", to: "#f59e0b", accent: "#f472b6", icon: "share" },
  { slug: "pulse-analytics", name: "Pulse Analytics", tagline: "Privacy-first analytics", from: "#22c55e", to: "#06b6d4", accent: "#4ade80", icon: "chart" },
  { slug: "aurora-3d", name: "Aurora 3D Pack", tagline: "60 3D models + textures", from: "#a855f7", to: "#06b6d4", accent: "#c084fc", icon: "cube" },
  { slug: "freelance-blueprint", name: "Freelance Mastery", tagline: "Six-figure roadmap", from: "#f97316", to: "#f59e0b", accent: "#fb923c", icon: "briefcase" },
  { slug: "retro-wave-font", name: "Retro Wave Font", tagline: "Display font duo", from: "#d946ef", to: "#6366f1", accent: "#e879f9", icon: "font" },
  { slug: "cloudforge-cli", name: "CloudForge CLI", tagline: "DevOps Swiss-army knife", from: "#0ea5e9", to: "#6366f1", accent: "#38bdf8", icon: "terminal" },
  { slug: "serenity-notion", name: "Serenity Notion", tagline: "Creator workspace", from: "#14b8a6", to: "#8b5cf6", accent: "#2dd4bf", icon: "grid" },
];

const ICON_PATHS: Record<string, string> = {
  layers: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></g>',
  cart: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2 3h2l2.6 12.4A2 2 0 0 0 8.6 17H18a2 2 0 0 0 2-1.4L22 7H6"/></g>',
  book: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></g>',
  slides: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></g>',
  shield: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></g>',
  pen: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></g>',
  video: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></g>',
  share: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></g>',
  chart: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 13h4l2-4 3 6 3-8"/></g>',
  cube: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></g>',
  briefcase: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></g>',
  font: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v16"/><path d="M7 11h10"/></g>',
  terminal: '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m7 9 3 3-3 3m5 0h5"/></g>',
  grid: '<g fill="none" stroke="#fff" stroke-width="3"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></g>',
};

function buildSvg(p: ProductArt): string {
  const { from, to, accent, tagline, name, icon } = p;
  // deterministic pseudo-random blobs
  const seed = name.length + icon.length;
  const blob1x = 10 + (seed % 40);
  const blob1y = 5 + ((seed * 7) % 30);
  const blob2x = 55 + ((seed * 13) % 35);
  const blob2y = 55 + ((seed * 3) % 25);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#080412"/>
      <stop offset="55%" stop-color="#0b0719"/>
      <stop offset="100%" stop-color="#0d0822"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="iconGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${from}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${from}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${to}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${to}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="${from}" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="800" height="600" fill="url(#bg)"/>

  <!-- grid pattern -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    ${Array.from({ length: 17 }, (_, i) => `<line x1="0" y1="${i * 38}" x2="800" y2="${i * 38}"/>`).join("")}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="${i * 38}" y1="0" x2="${i * 38}" y2="600"/>`).join("")}
  </g>

  <!-- glow blobs -->
  <circle cx="${blob1x * 7}" cy="${blob1y * 7}" r="170" fill="url(#glow1)" filter="url(#blur)"/>
  <circle cx="${blob2x * 7}" cy="${blob2y * 7}" r="150" fill="url(#glow2)" filter="url(#blur)"/>

  <!-- accent orb top-right -->
  <circle cx="660" cy="110" r="90" fill="${accent}" fill-opacity="0.14" filter="url(#blur)"/>

  <!-- main card -->
  <g filter="url(#cardShadow)">
    <rect x="150" y="140" width="500" height="320" rx="28" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.5"/>
    <rect x="150" y="140" width="500" height="320" rx="28" fill="url(#accentGrad)" fill-opacity="0.06"/>
    <!-- card top bar -->
    <line x1="150" y1="200" x2="650" y2="200" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.5"/>
    <!-- mini dots -->
    <circle cx="182" cy="170" r="6" fill="${accent}"/>
    <circle cx="206" cy="170" r="6" fill="#ffffff" fill-opacity="0.15"/>
    <circle cx="230" cy="170" r="6" fill="#ffffff" fill-opacity="0.15"/>
    <!-- icon circle -->
    <circle cx="400" cy="280" r="76" fill="url(#iconGrad)" fill-opacity="0.16" stroke="url(#iconGrad)" stroke-width="2"/>
    <circle cx="400" cy="280" r="90" fill="none" stroke="url(#iconGrad)" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="4 8"/>
    <g transform="translate(400,280) scale(2.6) translate(-12,-12)">
      ${ICON_PATHS[icon]}
    </g>
  </g>

  <!-- pill badge -->
  <rect x="330" y="360" width="140" height="34" rx="17" fill="${from}" fill-opacity="0.18" stroke="${from}" stroke-opacity="0.5"/>
  <text x="400" y="383" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="${accent}">${tagline.toUpperCase()}</text>

  <!-- name -->
  <text x="400" y="450" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="1" fill="#f3f0ff">${name}</text>

  <!-- footer strip -->
  <text x="400" y="540" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="6" fill="#6d6488">DIGI VIP × PREMIUM</text>
</svg>`;
}

let count = 0;
for (const p of PRODUCTS) {
  const file = path.join(OUT_DIR, `${p.slug}.svg`);
  fs.writeFileSync(file, buildSvg(p));
  count++;
}

console.log(`✅ Generated ${count} product images in public/products/`);
