import { ref, get, set } from 'firebase/database';
import { db } from '../../../apps/web/firebase/config'; 
import { CachedDocument, CacheProvider } from './types';

export const firebaseProvider: CacheProvider = {
  async get(id: string): Promise<CachedDocument | null> {
    const docRef = ref(db, `processedDocuments/${id}`);
    const snapshot = await get(docRef);
    if (snapshot.exists()) {
      return snapshot.val() as CachedDocument;
    }
    return null;
  },

  async set(id: string, doc: CachedDocument): Promise<void> {
    const docRef = ref(db, `processedDocuments/${id}`);
    await set(docRef, doc);
  },
}; 