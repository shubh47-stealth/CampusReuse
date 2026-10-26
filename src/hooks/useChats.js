import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToChats } from "../services/chatService";

// Live list of the signed-in user's conversations
export function useChats() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeToChats(
      uid,
      (list) => {
        setChats(list);
        setLoading(false);
      },
      (err) => {
        console.error("Chats listener error:", err);
        setLoading(false);
      }
    );
  }, [uid]);

  return { chats, loading };
}