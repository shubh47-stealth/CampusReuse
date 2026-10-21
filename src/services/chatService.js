import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Same chat id no matter who starts the conversation
export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

// Create the chat document if it doesn't exist yet.
// setDoc + merge avoids a read, which the security rules would block
// for a chat that doesn't exist.
export async function ensureChat(uidA, uidB) {
  const chatId = getChatId(uidA, uidB);
  await setDoc(
    doc(db, "chats", chatId),
    { participants: [uidA, uidB].sort() },
    { merge: true }
  );
  return chatId;
}

export async function sendMessage(chatId, senderId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: trimmed,
    senderId,
    createdAt: serverTimestamp(),
  });
}

// Real-time listener: calls onMessages with the latest messages, oldest first.
// Returns the unsubscribe function.
export function subscribeToMessages(chatId, onMessages, onError) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "desc"),
    limit(100)
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
      onMessages(messages);
    },
    onError
  );
}