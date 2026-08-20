import { initDb, db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { newId, slugify } from "../src/lib/utils";

interface SeedProduct {
  title: string;
  description: string;
  category: string;
  price: number; // USD
  image: string;
  license: string;
  featured?: boolean;
}

const CATEGORIES = [
  { slug: "software", name: "Software & Tools", icon: "code" },
  { slug: "design", name: "Design Assets", icon: "palette" },
  { slug: "courses", name: "Courses & Guides", icon: "graduation-cap" },
  { slug: "templates", name: "Templates & Kits", icon: "layout-template" },
];

const PRODUCTS: SeedProduct[] = [
  {
    title: "Nebula UI Kit Pro",
    description:
      "A 300+ component design system for building premium SaaS dashboards. Figma source, tokens, light & dark themes, and full documentation included.",
    category: "design",
    price: 89,
    image: "/products/nebula-ui-kit.svg",
    license: "NEBULA-UI-PRO-0001",
    featured: true,
  },
  {
    title: "Swift Commerce Engine",
    description:
      "Headless e-commerce starter built with Next.js 16 and TypeScript. Stripe-ready checkout, cart, admin dashboard, and edge caching out of the box.",
    category: "software",
    price: 149,
    image: "/products/swift-commerce.svg",
    license: "SWIFT-COMMERCE-0002",
    featured: true,
  },
  {
    title: "The Indie Hacker Playbook",
    description:
      "A 220-page field guide covering product validation, pricing strategy, and growth loops — distilled from 40+ real founder interviews.",
    category: "courses",
    price: 39,
    image: "/products/indie-hacker.svg",
    license: "INDIE-PLAYBOOK-0003",
    featured: true,
  },
  {
    title: "Lumen Presentation Kit",
    description:
      "120 hand-crafted slide layouts with animated transitions, data-viz components, and a matching brand system. PowerPoint + Keynote + Figma.",
    category: "templates",
    price: 29,
    image: "/products/lumen-deck.svg",
    license: "LUMEN-KIT-0004",
    featured: true,
  },
  {
    title: "Vault Password Manager",
    description:
      "Self-hosted password vault with end-to-end encryption, biometric unlock, and audited open-source core. Lifetime license for 5 seats.",
    category: "software",
    price: 59,
    image: "/products/vault-manager.svg",
    license: "VAULT-MGR-0005",
  },
  {
    title: "Chromatic Icon Suite",
    description:
      "4,200 production-ready icons in 6 weights and 3 color systems. SVG + React + Vue + Svelte packages with Figma plugin included.",
    category: "design",
    price: 49,
    image: "/products/chromatic-icons.svg",
    license: "CHROMATIC-ICONS-0006",
  },
  {
    title: "Zero to Launch: SaaS Bootcamp",
    description:
      "12 hours of video lessons taking you from empty repo to launched SaaS — architecture, auth, billing, marketing, and analytics.",
    category: "courses",
    price: 199,
    image: "/products/zero-to-launch.svg",
    license: "ZERO-LAUNCH-0007",
  },
  {
    title: "Orbit Social Media Templates",
    description:
      "150 scroll-stopping post templates for Instagram, LinkedIn, and X. Editable in Canva or Figma with a content calendar planner.",
    category: "templates",
    price: 19,
    image: "/products/orbit-social.svg",
    license: "ORBIT-SOCIAL-0008",
  },
  {
    title: "Pulse Analytics Desktop",
    description:
      "Privacy-first web analytics for indie products. One-click deploy, real-time dashboards, and no cookies required. Lifetime license.",
    category: "software",
    price: 79,
    image: "/products/pulse-analytics.svg",
    license: "PULSE-ANALYTICS-0009",
  },
  {
    title: "Aurora 3D Assets Pack",
    description:
      "60 high-poly 3D models + 200 seamless textures for game dev and product renders. Blender, Cinema 4D, and glTF formats.",
    category: "design",
    price: 99,
    image: "/products/aurora-3d.svg",
    license: "AURORA-3D-0010",
  },
  {
    title: "Freelance Mastery Blueprint",
    description:
      "Turn your skills into a six-figure freelance business. Pitching templates, pricing frameworks, and 50 client onboarding assets.",
    category: "courses",
    price: 49,
    image: "/products/freelance-blueprint.svg",
    license: "FREELANCE-MASTERY-0011",
  },
  {
    title: "Retro Wave Font Duo",
    description:
      "A bold display font pair inspired by the 80s — 900+ glyphs, variable weights, and multi-language support. Commercial license.",
    category: "templates",
    price: 25,
    image: "/products/retro-wave-font.svg",
    license: "RETRO-WAVE-0012",
  },
  {
    title: "CloudForge CLI Suite",
    description:
      "A Swiss-army CLI for cloud engineers — infrastructure scaffolding, deployment pipelines, and 40+ productivity commands.",
    category: "software",
    price: 45,
    image: "/products/cloudforge-cli.svg",
    license: "CLOUDFORGE-CLI-0013",
  },
  {
    title: "Serenity Notion Dashboard",
    description:
      "An all-in-one Notion workspace for creators — content pipeline, finance tracker, goal system, and 25 integrated databases.",
    category: "templates",
    price: 35,
    image: "/products/serenity-notion.svg",
    license: "SERENITY-NOTION-0014",
    featured: true,
  },
];

async function seed() {
  initDb();

  console.log("Clearing existing data...");
  db.exec(`
    DELETE FROM licenses;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  const now = new Date().toISOString();

  for (const cat of CATEGORIES) {
    db.prepare(
      "INSERT INTO categories (id, slug, name, icon) VALUES (?, ?, ?, ?)"
    ).run(newId("cat"), cat.slug, cat.name, cat.icon);
  }

  const insertProduct = db.prepare(`
    INSERT INTO products
      (id, slug, title, description, category_id, price_cents, image, license_payload, featured, in_stock, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  for (const p of PRODUCTS) {
    const category = db
      .prepare("SELECT id FROM categories WHERE slug = ?")
      .get(p.category) as { id: string };
    insertProduct.run(
      newId("prod"),
      slugify(p.title),
      p.title,
      p.description,
      category.id,
      Math.round(p.price * 100),
      p.image,
      p.license,
      p.featured ? 1 : 0,
      now
    );
  }

  const adminHash = await hashPassword("admin123");
  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    newId("usr"),
    "admin@digivip.io",
    adminHash,
    "DIGI VIP Admin",
    "admin",
    now
  );

  const demoHash = await hashPassword("demo123");
  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    newId("usr"),
    "demo@digivip.io",
    demoHash,
    "Demo Customer",
    "customer",
    now
  );

  const stats = db
    .prepare(
      "SELECT (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM categories) AS categories, (SELECT COUNT(*) FROM users) AS users"
    )
    .get() as { products: number; categories: number; users: number };

  console.log(
    `✅ Seed complete — ${stats.products} products, ${stats.categories} categories, ${stats.users} users.`
  );
  console.log("   Admin:  admin@digivip.io / admin123");
  console.log("   Demo:   demo@digivip.io / demo123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
