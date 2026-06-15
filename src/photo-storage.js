import { withTimeout } from "./async-utils.js";
import { createSignedPhoto, PHOTO_BUCKET, photoStoragePath, uploadPhotoWithClient } from "./photo-operations.js";
import { supabase } from "./supabase.js";

const STORAGE_REQUEST_TIMEOUT_MS = 20000;
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

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen"));
  reader.readAsDataURL(blob);
});

export { photoStoragePath };

export const photoForStorage = ({ signedUrl, ...photo }) => photo;

async function signedPhoto(photo, client = supabase) {
  return createSignedPhoto(client, photo);
}

export async function uploadPhotoData(userId, photo, client = supabase) {
  return uploadPhotoWithClient(client, userId, photo);
}

export async function hydratePhotos(userId, photos, client = supabase) {
  if (!Array.isArray(photos) || photos.length === 0) return [];
  return Promise.all(photos.map(async (photo) => {
    try {
      return await (photo.dataUrl ? uploadPhotoData(userId, photo, client) : signedPhoto(photo, client));
    } catch (error) {
      console.error("hydratePhoto", error);
      return photo;
    }
  }));
}

export async function refreshPhotoUrls(photos, client = supabase) {
  if (!Array.isArray(photos) || photos.length === 0) return [];
  return Promise.all(photos.map(async (photo) => {
    if (!photo.storagePath || photo.dataUrl) return photo;
    try {
      return await signedPhoto(photo, client);
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
    const response = await withTimeout(
      fetch(source),
      STORAGE_REQUEST_TIMEOUT_MS,
      "La descarga de una foto tardo demasiado.",
    );
    if (!response.ok) throw new Error("No se pudo incluir una foto en la copia");
    return { id: photo.id, date: photo.date, dataUrl: await blobToDataUrl(await response.blob()) };
  }));
}

export async function deletePhotoFile(photo, client = supabase) {
  if (!photo.storagePath) return;
  const { error } = await withTimeout(
    client.storage.from(PHOTO_BUCKET).remove([photo.storagePath]),
    STORAGE_REQUEST_TIMEOUT_MS,
    "La eliminacion de la foto tardo demasiado.",
  );
  if (error) throw error;
}

export async function deleteUserPhotos(userId) {
  const paths = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await withTimeout(
      supabase.storage.from(PHOTO_BUCKET).list(userId, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      }),
      STORAGE_REQUEST_TIMEOUT_MS,
      "La consulta de fotos tardo demasiado.",
    );
    if (error) throw error;
    paths.push(...data.filter((item) => item.name).map((item) => `${userId}/${item.name}`));
    if (data.length < 100) break;
  }
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await withTimeout(
      supabase.storage.from(PHOTO_BUCKET).remove(paths.slice(index, index + 100)),
      STORAGE_REQUEST_TIMEOUT_MS,
      "La eliminacion de fotos tardo demasiado.",
    );
    if (error) throw error;
  }
}
