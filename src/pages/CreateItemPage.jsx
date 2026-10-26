import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, createItem } from "../services/itemService";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500";

export default function CreateItemPage() {
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    listingType: "sell",
    price: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Your profile hasn't loaded yet. Please try again in a moment.");
      return;
    }
    if (form.listingType === "sell" && (form.price === "" || Number(form.price) < 0)) {
      setError("Enter a price of 0 or more.");
      return;
    }

    setSubmitting(true);
    try {
      await createItem(currentUser, profile, form);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Could not create the listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900">Sell an item</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Listed for {profile?.hostelBlock || "your hostel"}
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              required
              maxLength={80}
              value={form.title}
              onChange={update("title")}
              className={inputClass}
              placeholder="e.g. Engineering Mathematics textbook"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={update("description")}
              className={inputClass}
              placeholder="Condition, edition, anything buyers should know"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={update("category")}
                className={`${inputClass} bg-white`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="listingType"
                value={form.listingType}
                onChange={update("listingType")}
                className={`${inputClass} bg-white`}
              >
                <option value="sell">Sell</option>
                <option value="free">Give away free</option>
                <option value="swap">Swap</option>
              </select>
            </div>
          </div>

          {form.listingType === "sell" && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                value={form.price}
                onChange={update("price")}
                className={inputClass}
                placeholder="0"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 text-white font-medium py-2.5 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Posting..." : "Post listing"}
          </button>
        </form>
      </div>
    </div>
  );
}