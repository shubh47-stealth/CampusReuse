import { Link, useNavigate } from "react-router-dom";
import { Recycle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { logOut } from "../services/authService";

export default function Navbar() {
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();

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
            <span className="text-sm text-gray-600 hidden sm:inline">
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