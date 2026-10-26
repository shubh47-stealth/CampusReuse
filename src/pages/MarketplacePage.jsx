import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, subscribeToItems } from "../services/itemService";
import ItemCard from "../components/ItemCard";

export default function MarketplacePage() {
  const { currentUser, profile } = useAuth();
  const [scope, setScope] = useState("mine"); // "mine" | "all"
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const myHostel = profile?.hostelBlock;

  useEffect(() => {
    // Wait for the profile so "my hostel" has a value
    if (scope === "mine" && !myHostel) return;

    setLoading(true);
    setError("");

    const unsubscribe = subscribeToItems(
      {
        hostelBlock: scope === "mine" ? myHostel : undefined,
        category: category || undefined,
      },
      (list) => {
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("Items listener error:", err);
        setError("Could not load listings.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [scope, category, myHostel]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-sm text-gray-500">
            Buy, sell and swap items around campus
          </p>
        </div>
        <Link
          to="/sell"
          className="flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Sell an item
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          aria-label="Hostel filter"
        >
          <option value="mine">My hostel{myHostel ? ` (${myHostel})` : ""}</option>
          <option value="all">All hostels</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          aria-label="Category filter"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading listings...</p>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p>No items here yet.</p>
          <Link to="/sell" className="text-emerald-600 font-medium hover:underline">
            Be the first to list something
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} currentUid={currentUser.uid} />
          ))}
        </div>
      )}
    </div>
  );
}