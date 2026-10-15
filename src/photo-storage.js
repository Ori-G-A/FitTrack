import { photoStoragePath } from "./photo-operations.js";
import { createPhotoService } from "./photo-service.js";
export { photoForStorage } from "./photo-service.js";
import { supabase } from "./supabase.js";

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

const serviceFor = (client = supabase) => createPhotoService({
  client,
  readDataUrl: async (dataUrl) => (await fetch(dataUrl)).blob(),
  fetchPhoto: (source) => fetch(source),
  blobToDataUrl,
  onError: (...args) => console.error(...args),
});

export const uploadPhotoData = (userId, photo, client = supabase) => serviceFor(client).uploadPhotoData(userId, photo);
export const hydratePhotos = (userId, photos, client = supabase) => serviceFor(client).hydratePhotos(userId, photos);
export const refreshPhotoUrls = (photos, client = supabase) => serviceFor(client).refreshPhotoUrls(photos);
export const photosForBackup = (photos) => serviceFor().photosForBackup(photos);
export const deletePhotoFile = (photo, client = supabase) => serviceFor(client).deletePhotoFile(photo);
export const deleteUserPhotos = (userId) => serviceFor().deleteUserPhotos(userId);
