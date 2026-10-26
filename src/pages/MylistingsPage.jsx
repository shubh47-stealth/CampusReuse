import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deleteItem, setItemStatus, subscribeToMyItems } from "../services/itemService";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  reserved: "bg-amber-50 text-amber-700",
  sold: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS = {
  active: "Active",
  reserved: "Reserved",
  sold: "Sold",
};

function priceLabel(item) {
  if (item.listingType === "free") return "Free";
  if (item.listingType === "swap") return "Swap";
  return `₹${item.price}`;
}

export default function MylistingsPage() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return subscribeToMyItems(
      currentUser.uid,
      (list) => {
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("My items listener error:", err);
        setError("Could not load your listings.");
        setLoading(false);
      }
    );
  }, [currentUser.uid]);

  async function changeStatus(id, status) {
    setError("");
    try {
      await setItemStatus(id, status);
    } catch (err) {
      console.error(err);
      setError("Could not update that listing.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this listing?")) return;
    setError("");
    try {
      await deleteItem(id);
    } catch (err) {
      console.error(err);
      setError("Could not delete that listing.");
    }
  }

  const btn =
    "rounded-lg border border-gray-300 text-sm px-3 py-1.5 hover:bg-gray-50 transition";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My listings</h1>
          <p className="text-sm text-gray-500">
            Reserved and sold items are hidden from the marketplace
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

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p>You haven't listed anything yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-gray-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-gray-900 truncate">{item.title}</h2>
                  <span className={`rounded-full text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {priceLabel(item)} · {item.category} · {item.hostelBlock}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {item.status === "active" && (
                  <button onClick={() => changeStatus(item.id, "reserved")} className={btn}>
                    Reserve
                  </button>
                )}
                {item.status === "reserved" && (
                  <button onClick={() => changeStatus(item.id, "active")} className={btn}>
                    Relist
                  </button>
                )}
                {item.status !== "sold" && (
                  <button onClick={() => changeStatus(item.id, "sold")} className={btn}>
                    Mark sold
                  </button>
                )}
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Delete listing"
                  className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}