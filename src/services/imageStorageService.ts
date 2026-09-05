import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const DB_NAME = 'enxaquecator_images_db';
const STORE_NAME = 'images';
const DB_VERSION = 1;

/**
 * Inicializa e retorna a conexão com o banco IndexedDB dedicado para fotos.
 * O IndexedDB permite centenas de megabytes de armazenamento local sem estourar o limite de 5MB do LocalStorage.
 */
const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB não suportado neste navegador.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB.'));
  });
};

/**
 * Salva uma imagem otimizada no IndexedDB local.
 */
export const saveImageToLocalDB = async (id: string, dataUrl: string): Promise<void> => {
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, dataUrl, savedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Não foi possível salvar imagem no IndexedDB:', err);
  }
};

/**
 * Recupera imagem pelo ID do IndexedDB local.
 */
export const getImageFromLocalDB = async (id: string): Promise<string | null> => {
  try {
    const db = await openIndexedDB();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
};

/**
 * Deleta imagem do IndexedDB local.
 */
export const deleteImageFromLocalDB = async (id: string): Promise<void> => {
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erro ao remover imagem do IndexedDB:', err);
  }
};

/**
 * Faz o upload seguro da imagem para o Firebase Storage se configurado e o usuário estiver logado.
 * Caso ocorra qualquer problema (offline, bucket ainda não ativado ou sem permissão),
 * faz fallback automático salvando no IndexedDB e retornando a string Base64 otimizada.
 */
export const uploadOrStoreImage = async (
  userId: string | undefined,
  crisisDateOrId: string,
  imagePayload: { base64: string; blob?: Blob },
  imageIndex: number = 0
): Promise<string> => {
  // Se já for uma URL remota (ex: já hospedada no Storage ou CDN), mantém
  if (imagePayload.base64.startsWith('http://') || imagePayload.base64.startsWith('https://')) {
    return imagePayload.base64;
  }

  const imageId = `img_${crisisDateOrId}_${Date.now()}_${imageIndex}`;

  // 1. Sempre garantir cópia local no IndexedDB para acesso offline imediato
  await saveImageToLocalDB(imageId, imagePayload.base64);

  // 2. Se o Firebase Cloud Storage estiver configurado e o usuário autenticado, tentar upload
  if (storage && userId && userId !== 'demo-local-user') {
    try {
      const filename = `${imageId}.jpg`;
      const storagePath = `users/${userId}/crises/${crisisDateOrId}/${filename}`;
      const imageRef = ref(storage, storagePath);

      let blobToUpload = imagePayload.blob;
      if (!blobToUpload) {
        const res = await fetch(imagePayload.base64);
        blobToUpload = await res.blob();
      }

      const snapshot = await uploadBytes(imageRef, blobToUpload, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          crisisDate: crisisDateOrId
        }
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (cloudErr) {
      console.warn('Firebase Cloud Storage indisponível ou com restrição de permissão. Utilizando armazenamento local otimizado:', cloudErr);
      return imagePayload.base64;
    }
  }

  return imagePayload.base64;
};