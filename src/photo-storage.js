import { localISO } from "./app-utils.js";
import { supabase } from "./supabase.js";

const PHOTO_BUCKET = "progress-photos";
const newId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);
const SOURCE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

export function validatePhotoFile(file) {
  if (!file || !SOURCE_IMAGE_TYPES.has(file.type)) throw new Error("Formato no admitido. Usa JPEG, PNG, WebP o HEIC.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("La imagen supera el limite de 25 MB.");
  return file;
}

export function compressImage(file, maxPx = 820, quality = 0.62) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    image.src = url;
  });
}

const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();
const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen"));
  reader.readAsDataURL(blob);
});

const photoStoragePath = (userId, mimeType, photoId) => {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const safeId = String(photoId || newId()).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || newId();
  return `${userId}/${safeId}.${extension}`;
};

export const photoForStorage = ({ signedUrl, ...photo }) => photo;

async function signedPhoto(photo) {
  if (!photo.storagePath || photo.dataUrl) return photo;
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(photo.storagePath, 60 * 60 * 24);
  if (error) throw error;
  return { ...photo, signedUrl: data.signedUrl };
}

export async function uploadPhotoData(userId, photo) {
  if (!photo.dataUrl) return signedPhoto(photo);
  const blob = await dataUrlToBlob(photo.dataUrl);
  const contentType = ["image/jpeg", "image/png", "image/webp"].includes(blob.type) ? blob.type : "image/jpeg";
  const id = photo.id || newId();
  const storagePath = photoStoragePath(userId, contentType, id);
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, blob, { contentType, upsert: true });
  if (error) throw error;
  return signedPhoto({ id, date: photo.date || localISO(), storagePath });
}

export async function hydratePhotos(userId, photos) {
  if (!Array.isArray(photos) || photos.length === 0) return [];
  const hydrated = [];
  for (const photo of photos) {
    try {
      hydrated.push(await (photo.dataUrl ? uploadPhotoData(userId, photo) : signedPhoto(photo)));
    } catch (error) {
      console.error("hydratePhoto", error);
      hydrated.push(photo);
    }
  }
  return hydrated;
}

export async function refreshPhotoUrls(photos) {
  if (!Array.isArray(photos) || photos.length === 0) return [];
  return Promise.all(photos.map(async (photo) => {
    if (!photo.storagePath || photo.dataUrl) return photo;
    try {
      return await signedPhoto(photo);
    } catch (error) {
      console.error("refreshPhotoUrl", error);
      return photo;
    }
  }));
}

export async function photosForBackup(photos) {
  return Promise.all(photos.map(async (photo) => {
    if (photo.dataUrl) return photoForStorage(photo);
    const source = photo.signedUrl || (await signedPhoto(photo)).signedUrl;
    const response = await fetch(source);
    if (!response.ok) throw new Error("No se pudo incluir una foto en la copia");
    return { id: photo.id, date: photo.date, dataUrl: await blobToDataUrl(await response.blob()) };
  }));
}

export async function deletePhotoFile(photo) {
  if (!photo.storagePath) return;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([photo.storagePath]);
  if (error) throw error;
}

export async function deleteUserPhotos(userId) {
  const paths = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list(userId, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    paths.push(...data.filter((item) => item.name).map((item) => `${userId}/${item.name}`));
    if (data.length < 100) break;
  }
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(paths.slice(index, index + 100));
    if (error) throw error;
  }
}
