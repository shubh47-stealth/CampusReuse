import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Same chat id no matter who starts the conversation
export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

export function getOtherUid(chat, myUid) {
  return chat.participants.find((p) => p !== myUid);
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

// Saves the message and updates the chat's "last message" summary together,
// so the inbox never shows a message that wasn't saved (or the other way round).
export async function sendMessage(chatId, senderId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const chatRef = doc(db, "chats", chatId);
  const messageRef = doc(collection(db, "chats", chatId, "messages"));

  const batch = writeBatch(db);
  batch.set(messageRef, {
    text: trimmed,
    senderId,
    createdAt: serverTimestamp(),
  });
  batch.update(chatRef, {
    lastMessage: { text: trimmed.slice(0, 120), senderId },
    lastMessageAt: serverTimestamp(),
    [`lastRead.${senderId}`]: serverTimestamp(),
  });
  await batch.commit();
}

// Record that this user has seen everything in the chat so far
export function markChatRead(chatId, uid) {
  return updateDoc(doc(db, "chats", chatId), {
    [`lastRead.${uid}`]: serverTimestamp(),
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

// Live list of this user's conversations, most recent first.
// Chats with no messages yet are hidden. Sorting happens here so no index is needed.
export function subscribeToChats(uid, onChats, onError) {
  const q = query(collection(db, "chats"), where("participants", "array-contains", uid));

  return onSnapshot(
    q,
    (snap) => {
      const time = (c) => (c.lastMessageAt ? c.lastMessageAt.toMillis() : Date.now());
      const chats = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => c.lastMessage)
        .sort((a, b) => time(b) - time(a));
      onChats(chats);
    },
    onError
  );
}

// A chat is unread if the latest message is from the other person
// and arrived after this user last opened the chat.
export function isUnread(chat, uid) {
  if (!chat.lastMessage || chat.lastMessage.senderId === uid) return false;

  const lastReadStamp = chat.lastRead?.[uid];
  if (lastReadStamp === null) return false; // write still pending, so we just read it

  const lastMessageTime = chat.lastMessageAt ? chat.lastMessageAt.toMillis() : 0;
  const lastReadTime = lastReadStamp ? lastReadStamp.toMillis() : 0;
  return lastReadTime < lastMessageTime;
}