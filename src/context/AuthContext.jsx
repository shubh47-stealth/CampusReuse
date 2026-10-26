import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { ensurePublicProfile } from "../services/profileService";

const AuthContext = createContext({
  currentUser: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const ensuredPublicProfile = useRef(new Set());

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // Clean up any previous profile listener when the user changes
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Live-listen to users/{uid} so profile edits show up instantly
      unsubProfile = onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
          setLoading(false);

          // Make sure older accounts also have a public profile (once per session)
          if (snap.exists() && !ensuredPublicProfile.current.has(user.uid)) {
            ensuredPublicProfile.current.add(user.uid);
            ensurePublicProfile(user.uid, snap.data()).catch(console.error);
          }
        },
        (err) => {
          console.error("Profile listener error:", err);
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}