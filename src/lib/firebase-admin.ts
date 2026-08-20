import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    initializeApp({
      projectId: projectId || "digi-vip-firebase-default",
    });
  }
}

export const firestoreDb = getFirestore();

export const COLLECTIONS = {
  USERS: "users",
  CATEGORIES: "categories",
  PRODUCTS: "products",
  ORDERS: "orders",
  LICENSES: "licenses",
} as const;
