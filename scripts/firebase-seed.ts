import { firestoreDb, COLLECTIONS } from "../src/lib/firebase-admin";

async function seedFirestore() {
  console.log("Seeding Firebase Cloud Firestore database...");

  const categories = [
    { id: "cat_software", slug: "software", name: "Software & Tools", icon: "code" },
    { id: "cat_design", slug: "design", name: "Design Assets", icon: "palette" },
    { id: "cat_courses", slug: "courses", name: "Courses & Guides", icon: "book" },
    { id: "cat_templates", slug: "templates", name: "Templates & Kits", icon: "layout" },
  ];

  for (const cat of categories) {
    await firestoreDb.collection(COLLECTIONS.CATEGORIES).doc(cat.id).set(cat, { merge: true });
    console.log(`✓ Seeded category: ${cat.name}`);
  }

  const products = [
    {
      id: "prod_nebula",
      slug: "nebula-ui-kit-pro",
      title: "Nebula UI Kit Pro",
      description: "A 300+ component design system for building premium SaaS dashboards. Figma source, tokens, light & dark themes, and full documentation included.",
      category_id: "cat_design",
      price_cents: 8900,
      image: "/products/nebula-ui-kit.svg",
      license_payload: "NEBULA-UI-PRO-0001",
      featured: 1,
      in_stock: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "prod_swift",
      slug: "swift-commerce-engine",
      title: "Swift Commerce Engine",
      description: "Headless e-commerce starter built with Next.js 16 and TypeScript. Includes Stripe checkout, license generation, order receipts, and admin analytics.",
      category_id: "cat_software",
      price_cents: 14900,
      image: "/products/swift-commerce.svg",
      license_payload: "SWIFT-ENGINE-0001",
      featured: 1,
      in_stock: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "prod_indie",
      slug: "the-indie-hacker-playbook",
      title: "The Indie Hacker Playbook",
      description: "A 220-page field guide covering product validation, pricing strategy, distribution channels, and scaling digital product stores to $10k/mo MRR.",
      category_id: "cat_courses",
      price_cents: 3900,
      image: "/products/indie-hacker.svg",
      license_payload: "PLAYBOOK-BOOK-0001",
      featured: 1,
      in_stock: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "prod_lumen",
      slug: "lumen-presentation-kit",
      title: "Lumen Presentation Kit",
      description: "120 hand-crafted slide layouts with animated transitions, data-viz charts, dark mode themes, and export presets for Keynote, PowerPoint, and Figma.",
      category_id: "cat_templates",
      price_cents: 2900,
      image: "/products/lumen-deck.svg",
      license_payload: "LUMEN-SLIDES-0001",
      featured: 1,
      in_stock: 1,
      created_at: new Date().toISOString(),
    },
  ];

  for (const prod of products) {
    await firestoreDb.collection(COLLECTIONS.PRODUCTS).doc(prod.id).set(prod, { merge: true });
    console.log(`✓ Seeded product: ${prod.title}`);
  }

  console.log("✓ Firebase Cloud Firestore database successfully seeded!");
}

seedFirestore().catch(console.error);
