export function openDrawingsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BuildMitraDrawings', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('drawings')) {
        db.createObjectStore('drawings', { keyPath: 'id' });
      }
    };
  });
}

export async function saveDrawing(drawing: any): Promise<void> {
  const db = await openDrawingsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drawings', 'readwrite');
    const store = tx.objectStore('drawings');
    const request = store.put(drawing);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    tx.oncomplete = () => resolve();
  });
}

export async function getAllDrawings(): Promise<any[]> {
  const db = await openDrawingsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drawings', 'readonly');
    const store = tx.objectStore('drawings');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteDrawing(id: number): Promise<void> {
  const db = await openDrawingsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drawings', 'readwrite');
    const store = tx.objectStore('drawings');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
