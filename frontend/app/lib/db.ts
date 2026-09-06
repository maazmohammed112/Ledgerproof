/**
 * LedgerProof Enterprise Financial IndexedDB Storage Layer
 * 
 * Provides isolated, indexed persistence for multi-company workspaces,
 * transactions, invoices, vendors, audit logs, and generated finance reports.
 */

const DB_NAME = 'ledgerproof_enterprise_finance_v3';
const DB_VERSION = 1;

export const DB_STORES = {
  WORKSPACES: 'workspaces',
  TRANSACTIONS: 'transactions',
  INVOICES: 'invoices',
  PURCHASE_ORDERS: 'purchase_orders',
  VENDORS: 'vendors',
  POLICIES: 'policies',
  AUDIT_EVENTS: 'audit_events',
  IMPORTS: 'imports',
  REPORTS: 'reports',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not available in current environment.'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Workspaces store
      if (!db.objectStoreNames.contains(DB_STORES.WORKSPACES)) {
        db.createObjectStore(DB_STORES.WORKSPACES, { keyPath: 'id' });
      }

      // Scoped entity stores with workspaceId index
      const scopedStores = [
        DB_STORES.TRANSACTIONS,
        DB_STORES.INVOICES,
        DB_STORES.PURCHASE_ORDERS,
        DB_STORES.VENDORS,
        DB_STORES.POLICIES,
        DB_STORES.AUDIT_EVENTS,
        DB_STORES.IMPORTS,
        DB_STORES.REPORTS,
      ];

      for (const storeName of scopedStores) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          store.createIndex('by_workspace', 'workspaceId', { unique: false });
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

export async function idbGetAll<T>(storeName: string, workspaceId?: string): Promise<T[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      if (workspaceId && store.indexNames.contains('by_workspace')) {
        const index = store.index('by_workspace');
        const req = index.getAll(IDBKeyRange.only(workspaceId));
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      } else {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      }
    });
  } catch (err) {
    console.warn(`[IndexedDB] idbGetAll fallback for ${storeName}:`, err);
    return [];
  }
}

export async function idbPut<T extends { id: string }>(storeName: string, item: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] idbPut fallback for ${storeName}:`, err);
  }
}

export async function idbPutMany<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
  if (items.length === 0) return;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] idbPutMany fallback for ${storeName}:`, err);
  }
}

export async function idbDelete(storeName: string, id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] idbDelete fallback for ${storeName}:`, err);
  }
}

export async function idbDeleteByWorkspace(storeName: string, workspaceId: string): Promise<number> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      if (!store.indexNames.contains('by_workspace')) {
        return resolve(0);
      }
      const index = store.index('by_workspace');
      const req = index.openCursor(IDBKeyRange.only(workspaceId));
      let count = 0;
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] idbDeleteByWorkspace fallback for ${storeName}:`, err);
    return 0;
  }
}
