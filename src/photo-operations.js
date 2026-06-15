import { localISO } from "./app-utils.js";
import { withTimeout } from "./async-utils.js";

export const PHOTO_BUCKET = "progress-photos";
const STORAGE_REQUEST_TIMEOUT_MS = 20000;
const newId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);
const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

export const photoStoragePath = (userId, mimeType, photoId) => {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const safeId = String(photoId || newId()).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || newId();
  return `${userId}/${safeId}.${extension}`;
};

export async function createSignedPhoto(client, photo) {
  if (!photo.storagePath || photo.dataUrl) return photo;
  const { data, error } = await withTimeout(
    client.storage.from(PHOTO_BUCKET).createSignedUrl(photo.storagePath, 60 * 60 * 24),
    STORAGE_REQUEST_TIMEOUT_MS,
    "La carga de una foto tardo demasiado.",
  );
  if (error) throw error;
  return { ...photo, signedUrl: data.signedUrl };
}

export async function uploadPhotoWithClient(client, userId, photo) {
  if (!photo.dataUrl) return createSignedPhoto(client, photo);
  const blob = await dataUrlToBlob(photo.dataUrl);
  const contentType = ["image/jpeg", "image/png", "image/webp"].includes(blob.type) ? blob.type : "image/jpeg";
  const id = photo.id || newId();
  const storagePath = photoStoragePath(userId, contentType, id);
  const { error } = await withTimeout(
    client.storage.from(PHOTO_BUCKET).upload(storagePath, blob, { contentType, upsert: true }),
    STORAGE_REQUEST_TIMEOUT_MS,
    "La subida de la foto tardo demasiado.",
  );
  if (error) throw error;
  return createSignedPhoto(client, { id, date: photo.date || localISO(), storagePath });
}
