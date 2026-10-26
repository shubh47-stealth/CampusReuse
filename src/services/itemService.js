import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Stationery",
  "Sports",
  "Other",
];

export const LISTING_TYPES = ["sell", "free", "swap"];

/**
 * Create a listing. `user` is the Firebase auth user,
 * `publicProfile` supplies the seller name and hostel.
 * data: { title, description, category, price, listingType, imageUrl? }
 */
export async function createItem(user, publicProfile, data) {
  const price = data.listingType === "sell" ? Number(data.price) || 0 : 0;

  return addDoc(collection(db, "items"), {
    ownerId: user.uid,
    ownerName: publicProfile.fullName,
    hostelBlock: publicProfile.hostelBlock,
    title: data.title.trim(),
    description: (data.description || "").trim(),
    category: data.category,
    listingType: data.listingType,
    price,
    imageUrl: data.imageUrl || null,
    status: "active",
    createdAt: serverTimestamp(),
  });
}

/**
 * Live feed of active items, newest first.
 * filters: { hostelBlock?, category? }
 * The status filter is required by the security rules.
 * Sorting happens here instead of in the query so no composite index is needed.
 */
export function subscribeToItems(filters, onItems, onError) {
  const constraints = [where("status", "==", "active")];
  if (filters?.hostelBlock) constraints.push(where("hostelBlock", "==", filters.hostelBlock));
  if (filters?.category) constraints.push(where("category", "==", filters.category));

  const q = query(collection(db, "items"), ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // A just-created item has createdAt == null until the server confirms it
      const time = (i) => (i.createdAt ? i.createdAt.toMillis() : Date.now());
      items.sort((a, b) => time(b) - time(a));
      onItems(items);
    },
    onError
  );
}

export function setItemStatus(itemId, status) {
  return updateDoc(doc(db, "items", itemId), { status });
}

export function deleteItem(itemId) {
  return deleteDoc(doc(db, "items", itemId));
}