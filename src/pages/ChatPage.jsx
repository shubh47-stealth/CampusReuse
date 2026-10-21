import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ensureChat, sendMessage, subscribeToMessages } from "../services/chatService";

export default function ChatPage() {
  const { otherUid } = useParams();
  const { currentUser } = useAuth();

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!currentUser || otherUid === currentUser.uid) return;

    let unsubscribe = null;
    let cancelled = false;

    (async () => {
      try {
        const id = await ensureChat(currentUser.uid, otherUid);
        if (cancelled) return;
        setChatId(id);
        unsubscribe = subscribeToMessages(
          id,
          setMessages,
          (err) => {
            console.error("Chat listener error:", err);
            setError("Could not load messages.");
          }
        );
      } catch (err) {
        console.error(err);
        setError("Could not open this chat.");
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, otherUid]);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!chatId || !text.trim()) return;
    const toSend = text;
    setText("");
    try {
      await sendMessage(chatId, currentUser.uid, toSend);
    } catch (err) {
      console.error(err);
      setError("Message failed to send.");
      setText(toSend);
    }
  }

  if (otherUid === currentUser?.uid) {
    return <div className="p-6 text-gray-600">You can't chat with yourself.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col h-[75vh]">
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="font-semibold text-gray-900">Chat</h1>
          <p className="text-xs text-gray-400 truncate">with {otherUid}</p>
        </div>

        {error && (
          <div role="alert" className="mx-4 mt-3 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && !error && (
            <p className="text-center text-sm text-gray-400 mt-8">
              No messages yet. Say hi!
            </p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === currentUser.uid;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm break-words ${
                    mine
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-200">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!chatId || !text.trim()}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-4 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}