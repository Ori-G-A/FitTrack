import { withTimeout } from "./async-utils.js";
import { createSignedPhoto, PHOTO_BUCKET, uploadPhotoWithClient } from "./photo-operations.js";

const STORAGE_REQUEST_TIMEOUT_MS = 20000;
export const photoForStorage = ({ signedUrl, ...photo }) => photo;

export function createPhotoService({ client, readDataUrl, fetchPhoto, blobToDataUrl, onError }) {
  async function signedPhoto(photo) {
    return createSignedPhoto(client, photo);
  }

  async function uploadPhotoData(userId, photo) {
    return uploadPhotoWithClient(client, userId, photo, readDataUrl);
  }

  async function hydratePhotos(userId, photos) {
    if (!Array.isArray(photos) || photos.length === 0) return [];
    return Promise.all(photos.map(async (photo) => {
      try {
        return await (photo.dataUrl ? uploadPhotoData(userId, photo) : signedPhoto(photo));
      } catch (error) {
        onError("hydratePhoto", error);
        return photo;
      }
    }));
  }

  async function refreshPhotoUrls(photos) {
    if (!Array.isArray(photos) || photos.length === 0) return [];
    return Promise.all(photos.map(async (photo) => {
      if (!photo.storagePath || photo.dataUrl) return photo;
      try {
        return await signedPhoto(photo);
      } catch (error) {
        onError("refreshPhotoUrl", error);
        return photo;
      }
    }));
  }

  async function photosForBackup(photos) {
    return Promise.all(photos.map(async (photo) => {
      if (photo.dataUrl) return photoForStorage(photo);
      const source = photo.signedUrl || (await signedPhoto(photo)).signedUrl;
      const response = await withTimeout(
        fetchPhoto(source),
        STORAGE_REQUEST_TIMEOUT_MS,
        "La descarga de una foto tardo demasiado.",
      );
      if (!response.ok) throw new Error("No se pudo incluir una foto en la copia");
      return { id: photo.id, date: photo.date, dataUrl: await blobToDataUrl(await response.blob()) };
    }));
  }

  async function deletePhotoFile(photo) {
    if (!photo.storagePath) return;
    const { error } = await withTimeout(
      client.storage.from(PHOTO_BUCKET).remove([photo.storagePath]),
      STORAGE_REQUEST_TIMEOUT_MS,
      "La eliminacion de la foto tardo demasiado.",
    );
    if (error) throw error;
  }

  async function deleteUserPhotos(userId) {
    const paths = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await withTimeout(
        client.storage.from(PHOTO_BUCKET).list(userId, {
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
        client.storage.from(PHOTO_BUCKET).remove(paths.slice(index, index + 100)),
        STORAGE_REQUEST_TIMEOUT_MS,
        "La eliminacion de fotos tardo demasiado.",
      );
      if (error) throw error;
    }
  }

  return { uploadPhotoData, hydratePhotos, refreshPhotoUrls, photosForBackup, deletePhotoFile, deleteUserPhotos };
}
