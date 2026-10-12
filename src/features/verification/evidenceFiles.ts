const databaseName = 'cont-marjo-demo-files';
const storeName = 'verification-evidence';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('El navegador no permite guardar archivos locales.')); return; }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento.'));
    request.onsuccess = () => resolve(request.result);
  });
}

function operation<T>(action: (store: IDBObjectStore) => IDBRequest, read: (value: unknown) => T): Promise<T> {
  return openDatabase().then((database) => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = action(store);
    transaction.oncomplete = () => { database.close(); resolve(read(request.result)); };
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error('No se pudo guardar el archivo.')); };
    transaction.onabort = transaction.onerror;
  }));
}

export function saveEvidenceFile(key: string, file: File): Promise<void> {
  return operation<void>((store) => store.put(file, key), () => undefined);
}

export function loadEvidenceFile(key: string): Promise<Blob | null> {
  return operation<Blob | null>((store) => store.get(key), (value) => value instanceof Blob ? value : null);
}

export function deleteEvidenceFile(key: string): Promise<void> {
  return operation<void>((store) => store.delete(key), () => undefined);
}
