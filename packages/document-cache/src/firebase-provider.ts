import { ref, get, set } from 'firebase/database';
import { db } from '@textsculpt/firebase';
import { CachedDocument, CacheProvider } from './types';
import { encodeForFirebase } from './encoding';
import { cacheProcessedDocument } from './index';
import { getDownloadURL } from 'firebase/storage';

// For debugging: import auth from the demo app if possible
// (If not possible, instruct user to log auth.currentUser in the app before calling getDocument)

export const firebaseProvider: CacheProvider = {
  async get(id: string): Promise<CachedDocument | null> {
    const sanitizedId = encodeForFirebase(id);
    const path = `processedDocuments/${sanitizedId}`;
    console.log('[firebaseProvider.get] Requested ID:', id);
    console.log('[firebaseProvider.get] Sanitized ID:', sanitizedId);
    console.log('[firebaseProvider.get] Firebase path:', path);
    // Uncomment the next line if you can import auth:
    // console.log('[firebaseProvider.get] Current user:', auth.currentUser);
    const docRef = ref(db, path);
    const snapshot = await get(docRef);
    if (snapshot.exists()) {
      const data = snapshot.val() as any;
      if (data.html) {
        // HTML is stored directly in DB
        return {
          processedContent: data.html,
          sourceLastModified: data.sourceLastModified || 0,
          lastAccessed: data.lastAccessed || Date.now(),
        };
      } else if (data.htmlUrl) {
        // HTML is stored in Storage, fetch it
        const response = await fetch(data.htmlUrl);
        const html = await response.text();
        return {
          processedContent: html,
          sourceLastModified: data.sourceLastModified || 0,
          lastAccessed: data.lastAccessed || Date.now(),
        };
      }
    }
    return null;
  },

  async set(id: string, doc: CachedDocument): Promise<void> {
    const sanitizedId = encodeForFirebase(id);
    // Use cacheProcessedDocument to store the HTML in the right place
    await cacheProcessedDocument(sanitizedId, doc.processedContent);
    // Optionally, you can also update sourceLastModified/lastAccessed in DB if needed
  },
}; 