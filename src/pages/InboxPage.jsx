import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChats } from "../hooks/useChats";
import { getOtherUid, isUnread } from "../services/chatService";
import { getPublicProfile } from "../services/profileService";

function formatTime(stamp) {
  if (!stamp) return "";
  const date = stamp.toDate();
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function InboxPage() {
  const { currentUser } = useAuth();
  const { chats, loading } = useChats();
  const [profiles, setProfiles] = useState({});

  // Look up the other person's name for each conversation
  useEffect(() => {
    let cancelled = false;
    const missing = chats
      .map((c) => getOtherUid(c, currentUser.uid))
      .filter((uid) => uid && !(uid in profiles));

    missing.forEach(async (uid) => {
      const p = await getPublicProfile(uid);
      if (!cancelled) setProfiles((prev) => ({ ...prev, [uid]: p }));
    });

    return () => {
      cancelled = true;
    };
  }, [chats, currentUser.uid, profiles]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
      <p className="text-sm text-gray-500 mb-6">Your conversations with other students</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : chats.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <MessageCircle className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p>No conversations yet.</p>
          <Link to="/" className="text-emerald-600 font-medium hover:underline">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <ul className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {chats.map((chat) => {
            const otherUid = getOtherUid(chat, currentUser.uid);
            const profile = profiles[otherUid];
            const unread = isUnread(chat, currentUser.uid);
            const mine = chat.lastMessage.senderId === currentUser.uid;

            return (
              <li key={chat.id}>
                <Link
                  to={`/chat/${otherUid}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                    {(profile?.fullName || "S").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate ${unread ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                        {profile?.fullName || "Student"}
                        {profile?.hostelBlock && (
                          <span className="text-xs font-normal text-gray-400"> · {profile.hostelBlock}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${unread ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {mine ? "You: " : ""}
                      {chat.lastMessage.text}
                    </p>
                  </div>

                  {unread && (
                    <span aria-label="Unread" className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}