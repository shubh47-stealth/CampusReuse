import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

/**
 * Create an auth account and the matching users/{uid} Firestore document.
 * profileData: { fullName, hostelBlock, roomNumber }
 */
export async function signUp(email, password, { fullName, hostelBlock, roomNumber }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  await updateProfile(user, { displayName: fullName });

  // Write both documents together: the private profile (email, room number)
  // and the public profile other students are allowed to see (name, hostel).
  const batch = writeBatch(db);
  batch.set(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    hostelBlock,
    roomNumber,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "publicProfiles", user.uid), {
    uid: user.uid,
    fullName,
    hostelBlock,
  });
  await batch.commit();

  return user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logOut() {
  return signOut(auth);
}

// Turn Firebase error codes into messages a student can understand
export function friendlyAuthError(err) {
  switch (err?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}