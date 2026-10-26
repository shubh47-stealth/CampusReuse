import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const cache = new Map();

// Name and hostel of any student (never email or room number)
export async function getPublicProfile(uid) {
  if (cache.has(uid)) return cache.get(uid);
  try {
    const snap = await getDoc(doc(db, "publicProfiles", uid));
    if (!snap.exists()) return null;
    cache.set(uid, snap.data());
    return snap.data();
  } catch (err) {
    console.error("Could not load public profile:", err);
    return null;
  }
}

// Accounts created before public profiles existed get one the next time they log in
export async function ensurePublicProfile(uid, { fullName, hostelBlock }) {
  const ref = doc(db, "publicProfiles", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { uid, fullName, hostelBlock });
  }
}