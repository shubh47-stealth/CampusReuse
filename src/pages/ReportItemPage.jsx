import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LF_CATEGORIES, createReport } from "../services/lostFoundService";
import { MAX_IMAGE_BYTES, uploadImage } from "../services/imageService";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500";

function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function ReportItemPage() {
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const [form, setForm] = useState({
    type: "lost",
    title: "",
    description: "",
    category: LF_CATEGORIES[0],
    location: "",
    date: today(),
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!profile) {
      setError("Your profile hasn't loaded yet. Please try again in a moment.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (uploadErr) {
          console.error(uploadErr);
          setError(uploadErr.message || "Could not upload the photo.");
          return;
        }
      }

      await createReport(currentUser, profile, { ...form, imageUrl });
      navigate("/lost-found");
    } catch (err) {
      console.error(err);
      setError("Could not submit the report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLost = form.type === "lost";
  const typeButton = (value, label) => (
    <button
      type="button"
      onClick={() => setForm((f) => ({ ...f, type: value }))}
      className={`flex-1 rounded-lg py-2 text-sm font-medium border transition ${
        form.type === value
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900">Report an item</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Reported from {profile?.hostelBlock || "your hostel"}
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            {typeButton("lost", "I lost something")}
            {typeButton("found", "I found something")}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              What is it?
            </label>
            <input
              id="title"
              required
              maxLength={80}
              value={form.title}
              onChange={update("title")}
              className={inputClass}
              placeholder="e.g. Blue steel water bottle"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={update("description")}
              className={inputClass}
              placeholder={
                isLost
                  ? "Colour, brand, marks or stickers that identify it"
                  : "Describe it, but keep one detail back so the real owner can prove it's theirs"
              }
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
                {LF_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                {isLost ? "Date lost" : "Date found"}
              </label>
              <input
                id="date"
                type="date"
                required
                max={today()}
                value={form.date}
                onChange={update("date")}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              {isLost ? "Where did you last see it?" : "Where did you find it?"}
            </label>
            <input
              id="location"
              maxLength={100}
              value={form.location}
              onChange={update("location")}
              className={inputClass}
              placeholder="e.g. Block A common room, library 2nd floor"
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optional)
            </label>
            {preview ? (
              <div className="flex items-center gap-3">
                <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-3 file:py-2 file:cursor-pointer"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 text-white font-medium py-2.5 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </form>
      </div>
    </div>
  );
}