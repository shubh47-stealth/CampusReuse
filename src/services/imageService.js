const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Upload an image straight from the browser to Cloudinary (unsigned upload).
 * Returns the secure URL, which we store on the item in Firestore.
 */
export async function uploadImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured. Check your .env file.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be under 5 MB.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error?.message || "Image upload failed.");
  }

  const data = await res.json();
  return data.secure_url;
}