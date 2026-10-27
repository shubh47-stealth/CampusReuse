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

export const LF_CATEGORIES = [
  "ID / Cards",
  "Keys",
  "Electronics",
  "Books",
  "Clothing",
  "Bottles & Bags",
  "Other",
];

export const REPORT_TYPES = ["lost", "found"];

/**
 * Create a lost or found report.
 * `user` is the Firebase auth user, `profile` supplies name and hostel.
 * data: { type, title, description, category, location, date, imageUrl? }
 */
export function createReport(user, profile, data) {
  return addDoc(collection(db, "lostFound"), {
    reporterId: user.uid,
    reporterName: profile.fullName,
    hostelBlock: profile.hostelBlock,
    type: data.type,
    title: data.title.trim(),
    description: (data.description || "").trim(),
    category: data.category,
    location: (data.location || "").trim(),
    date: data.date, // YYYY-MM-DD
    imageUrl: data.imageUrl || null,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

/**
 * Live feed of open reports of one type, newest first.
 * filters: { type, hostelBlock? }
 * The status filter is required by the security rules.
 * Sorting happens here so no composite index is needed.
 */
export function subscribeToReports(filters, onReports, onError) {
  const constraints = [
    where("status", "==", "open"),
    where("type", "==", filters.type),
  ];
  if (filters.hostelBlock) constraints.push(where("hostelBlock", "==", filters.hostelBlock));

  const q = query(collection(db, "lostFound"), ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const time = (r) => (r.createdAt ? r.createdAt.toMillis() : Date.now());
      reports.sort((a, b) => time(b) - time(a));
      onReports(reports);
    },
    onError
  );
}

export function markReturned(reportId) {
  return updateDoc(doc(db, "lostFound", reportId), { status: "returned" });
}

export function deleteReport(reportId) {
  return deleteDoc(doc(db, "lostFound", reportId));
}