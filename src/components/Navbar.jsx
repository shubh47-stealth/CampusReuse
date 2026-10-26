import { Link, useNavigate } from "react-router-dom";
import { Recycle, LogOut, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useChats } from "../hooks/useChats";
import { isUnread } from "../services/chatService";
import { logOut } from "../services/authService";

export default function Navbar() {
  const { currentUser, profile } = useAuth();
  const { chats } = useChats();
  const navigate = useNavigate();

  const unreadCount = currentUser
    ? chats.filter((c) => isUnread(c, currentUser.uid)).length
    : 0;

  async function handleLogout() {
    await logOut();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-emerald-600">
          <Recycle className="h-6 w-6" />
          CampusReuse
        </Link>

        {currentUser ? (
          <div className="flex items-center gap-4">
            <Link
              to="/messages"
              className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Messages</span>
              {unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} unread conversations`}
                  className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-medium flex items-center justify-center"
                >
                  {unreadCount}
                </span>
              )}
            </Link>
            <span className="text-sm text-gray-600 hidden md:inline">
              {profile?.fullName || currentUser.displayName || currentUser.email}
              {profile?.hostelBlock ? ` · ${profile.hostelBlock}` : ""}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-emerald-600">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}