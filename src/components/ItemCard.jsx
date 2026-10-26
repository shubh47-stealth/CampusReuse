import { Link } from "react-router-dom";
import { Package, MessageCircle, CheckCircle, Trash2 } from "lucide-react";
import { setItemStatus, deleteItem } from "../services/itemService";

function priceLabel(item) {
  if (item.listingType === "free") return "Free";
  if (item.listingType === "swap") return "Swap";
  return `₹${item.price}`;
}

export default function ItemCard({ item, currentUid }) {
  const isOwner = item.ownerId === currentUid;

  async function handleSold() {
    try {
      await setItemStatus(item.id, "sold");
    } catch (err) {
      console.error(err);
      alert("Could not update this listing.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await deleteItem(item.id);
    } catch (err) {
      console.error(err);
      alert("Could not delete this listing.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <Package className="h-10 w-10 text-gray-300" />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 break-words">{item.title}</h3>
          <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1">
            {priceLabel(item)}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {item.category} · {item.hostelBlock} · {item.ownerName}
        </p>

        {item.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{item.description}</p>
        )}

        <div className="mt-auto pt-4 flex gap-2">
          {isOwner ? (
            <>
              <button
                onClick={handleSold}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-sm py-2 hover:bg-gray-50"
              >
                <CheckCircle className="h-4 w-4" />
                Mark sold
              </button>
              <button
                onClick={handleDelete}
                aria-label="Delete listing"
                className="rounded-lg border border-gray-300 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to={`/chat/${item.ownerId}`}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 text-white text-sm py-2 hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Message seller
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}